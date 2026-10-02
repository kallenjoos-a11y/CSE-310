# Personal Budget Software — Project Context

**Last Updated:** October 1, 2026  
**Document Purpose:** Living source of truth for the project’s product decisions, scope, technical direction, current progress, future ideas, and unresolved questions.

## Status Labels

- **Decided** — Established project direction unless deliberately changed.
- **In Progress** — Work that has begun but is not complete.
- **Proposed** — A likely approach that still requires a decision or validation.
- **Future** — Intentionally deferred until the core system works.
- **Out of Scope for Now** — Discussed but explicitly set aside.

## 1. Project Overview

**Status: Decided**

This project is a personal budgeting application intended for the user and his wife.

It is more than an expense tracker. Its central purpose is to support an envelope- or zero-based-style budgeting system that answers two separate questions:

1. **Where is our money?** — Accounts
2. **What is our money for?** — Budget categories

The application should eventually be accessible through both web and mobile interfaces, with shared cloud data so both household members can see current information.

The project is also being used as a long-term software-engineering learning project, beginning with a CSE 310 Cloud Databases sprint.

## 2. Core Financial Model

### Accounts — Decided

An account represents where money physically exists.

Examples include checking, savings, cash, and credit-card accounts.

An account balance answers the question:

> Where is the money currently stored?

The MVP uses two application-defined account behaviors:

```text
account_type
- normal
- credit_card
```

Checking, savings, and cash accounts can use `normal`. Credit cards use `credit_card` because they may eventually require different behavior. An enum was selected instead of a boolean, integer codes, or a lookup table because the application currently needs only these two defined behaviors and does not need user-defined account types.

Accounts also include `is_active`, defaulting to `true`, so a closed account can be archived without deleting its transaction history.

Account balances are derived from transactions and transfers. The database does not store a mutable `current_balance` as the source of truth.

Investment-account value and holdings tracking are deferred. Market value does not fit the transaction-derived balance model well, and portfolio management is outside the day-to-day budgeting purpose of the MVP. Investing may still be represented as a budget category or financial activity without treating the application as investment software.

### Budget Categories — Decided

A category represents what money is intended for.

The initial categories discussed are:

- Investments
- Housing
- Tithing
- Car Loan
- Car Insurance
- Phone Plan
- Transportation
- Groceries
- Eating Out / Date Night
- Fun Money
- Savings
- Emergency
- Utilities

Categories must be stored as customizable data rather than hard-coded into the application. Users should eventually be able to add, rename, organize, or remove categories without changing the source code.

A category's available balance is derived rather than stored directly:

```text
SUM(allocations.amount)
- SUM(expense amounts assigned through transaction_categories)
= available category balance
```

The database does not store `amount_spent`, `total_amount_in_budget`, or a mutable current available amount as the source of truth.

### Accounts and Categories Are Independent — Decided

Accounts and categories are two independent views of the same money.

The system does not need to track which particular category dollars are physically held in which account.

For example, the system may know:

```text
Accounts
Checking: $3,000
Savings:  $4,000
Cash:     $1,000
Total:    $8,000
```

Separately, it may know:

```text
Categories
Housing:        $2,000
Tithing:          $500
Groceries:        $600
Emergency Fund: $2,500
Investments:    $1,000
Fun:              $400
Unallocated:    $1,000
Total:           $8,000
```

A category balance does not have to be divided among Checking, Savings, and other accounts.

This keeps ordinary account transfers from affecting the budget. Moving money from Checking to Savings changes where the money is stored but does not change what it is intended for.

### Transactions — Decided

A transaction records income or an expense affecting one account.

Each transaction includes an `account_id`, a positive monetary `total_amount` stored as `numeric(12,2)`, and a `transaction_type` of `income` or `expense`. It also includes the purchase or transaction date and may include a description and, later, a receipt reference.

An expense should identify both:

- The account the money came from
- The category or categories whose available balances should be reduced

Example:

```text
Payee: Walmart
Total amount: $62.37
Transaction type: expense
Account: Checking
Category: Groceries
Date: September 22, 2026
Note: Weekly groceries
Receipt: Optional image
```

This transaction would reduce both the derived Checking balance and the available Groceries balance by $62.37.

### Split Transactions — Decided

A transaction can be divided among multiple budget categories through the `transaction_categories` junction table.

Example:

```text
Walmart — $72.43

Groceries: $51.20
Household: $16.23
Clothing:   $5.00
```

Each junction row records:

```text
transaction_id
category_id
amount numeric(12,2)
```

The name `transaction_categories` is used instead of `transaction_allocations` so that categorizing spending is not confused with allocating income to budget categories.

The exact behavior for temporarily incomplete split categorization remains unresolved, including when the system must require the category amounts to equal the transaction total.

### Allocations — Decided Core Model

An allocation assigns available money to a budget category. It does not represent money entering, leaving, or physically moving between accounts.

Income initially increases an account balance and creates money available to allocate.

Example:

```text
Income: $1,500
Deposited into: Checking

Allocate:
Housing:        $700
Groceries:      $250
Tithing:        $150
Emergency Fund: $250
Fun:            $100
Unallocated:     $50
```

The system preserves allocation history as individual records rather than storing only a category's current balance. An allocation records its category, amount, allocation date, and creation time. It may optionally reference the income transaction that caused it through a nullable `income_transaction_id`. Keeping that reference nullable allows manual allocations that do not originate from a specific income transaction.

Budget periods, default allocation-rule behavior, rounding, and the representation of unallocated money remain unresolved.

### Transfers — Decided

A transfer moves money between accounts without counting as income or spending. Transfers use a dedicated table instead of paired income and expense transactions.

For example:

```text
Checking: -$500
Savings:  +$500
```

Budget-category balances remain unchanged.

Each transfer has a `from_account_id`, `to_account_id`, positive `amount`, transfer date, and optional description. The database should enforce:

```sql
CHECK (amount > 0)
CHECK (from_account_id <> to_account_id)
```

The conceptual model is:

```text
Money comes in       → Income transaction
Money gets assigned  → Allocation
Money gets used      → Expense transaction
Money changes places → Transfer
```

## 3. Income and Default Allocations

**Status: Planned, with unresolved details**

Because paycheck amounts can vary, categories should eventually be able to receive default percentage-based allocations.

Example:

```text
Tithing:       10%
Housing:       30%
Groceries:     15%
Investments:   15%
Emergency:     20%
Fun:           10%
```

When income is entered, the user could choose to apply these defaults and review or edit the calculated amounts before saving.

Possible future allocation rules discussed include:

- Percentage of income
- Fixed amount
- Manual allocation
- A combination of percentages and fixed amounts

Questions still to resolve include:

- What happens when percentages total less than 100%?
- Should the remainder automatically become Unallocated?
- Should percentages greater than 100% be rejected?
- How should fixed and percentage rules interact?
- Are allocation rules attached to categories, households, or individual income sources?
- How should rounding be handled when percentages divide income unevenly?

The current preference is to allow leftover money to remain Unallocated, but the complete behavior has not been finalized.

Default rules and actual allocations are separate concepts. A rule describes what should happen to future income; an allocation records the dollar amount actually assigned at a point in time. Changing a rule must not rewrite historical allocations.

## 4. First Usable Product

**Status: Decided Direction**

The smallest useful budgeting experience should allow the user to:

1. Create and view accounts.
2. Create and customize budget categories.
3. Record income and allocate money to categories.
4. Enter an expense.
5. Select the account used for the expense.
6. Select the category or categories paying for it.
7. See the derived account balance decrease.
8. See the appropriate derived category balance decrease.
9. Transfer money between accounts without changing the budget.
10. View recent transactions.

A basic dashboard may eventually show:

- Total money
- Budgeted money
- Unallocated money
- Account balances
- Category balances
- Recent transactions

Functionality and correct financial behavior take priority over visual polish.

## 5. Current CSE 310 Sprint

**Status: In Progress**

The current sprint focuses on Cloud Databases.

The goal is not to finish the entire budgeting application. The assignment requires a cloud database with at least one table and software that demonstrates the four CRUD operations:

```text
Create — add new data
Read   — query data
Update — modify data
Delete — remove data
```

The likely demonstration will use the `categories` table:

- Read and display categories.
- Add a category.
- Rename a category.
- Delete a category.

This deliberately narrow demonstration satisfies the sprint requirements while contributing useful work to the eventual product. A polished dashboard, the complete budget workflow, authentication, and the full MVP are not required for this week's deliverable.

Relevant learning objectives include:

- PostgreSQL and Supabase
- Relational data modeling
- Primary and foreign keys
- Table relationships
- CRUD operations
- Useful financial queries
- Connecting React to a cloud database
- Protecting credentials
- Authentication and Row Level Security concepts

The user has already completed ITM 220 and has prior SQL experience, so the project does not need to begin by reteaching basic SQL syntax.

## 6. Technical Direction

### Selected — Decided

- **Cloud platform:** Supabase
- **Database:** PostgreSQL through Supabase
- **Web frontend:** React
- **Client library:** Supabase JavaScript client
- **Version control:** Git and GitHub are part of the intended workflow.
- **Development sequence:** Cloud database and React CRUD demonstration first, followed by the broader web application and later a mobile application.
- **Balance strategy:** Derive account and category balances from financial events instead of storing mutable balance fields as the source of truth.
- **Money representation:** Use `numeric(12,2)` for monetary amounts rather than floating-point types.
- **Security direction:** Supabase Authentication and Row Level Security should eventually restrict data to members of the correct household.
- **Receipt storage direction:** Supabase Storage is the proposed location for receipt images.

Supabase was selected over Firebase because the project's financial information fits a relational model and the user's SQL experience transfers naturally to PostgreSQL.

The immediate application path is:

```text
React
  ↓
Supabase JavaScript client
  ↓
Supabase PostgreSQL
  ↓
query categories
  ↓
display categories in React
  ↓
complete Create → Read → Update → Delete
```

### Not Yet Chosen

The following have not been finalized:

- Web backend or API structure beyond the initial direct React-to-Supabase connection
- Mobile framework
- Final repository and deployment structure
- Whether a later production version will continue to access Supabase directly or introduce an additional backend layer

Technologies suggested in earlier discussion should not be treated as committed choices until deliberately selected.

## 7. Current Supabase Progress

**Status: In Progress**

The following setup and schema work has been completed or observed:

- A Supabase organization was created.
- A Supabase project named `personal-budget` was created and shown as healthy and running.
- GitHub was connected to the Supabase account, but connecting a repository to the Supabase project was deliberately deferred while the data structure was designed.
- The `households` and `accounts` tables were created.
- Account-type and transaction-type enum decisions were made; the account type uses `normal` and `credit_card`.
- Foreign-key relationships and ownership through households and accounts were worked through.
- The core MVP schema was designed around `households`, `accounts`, `categories`, `transactions`, `transaction_categories`, `transfers`, and `allocations`.
- Dedicated transfers and their positive-amount and different-account constraints were designed.
- Split transactions through `transaction_categories` were designed.
- Allocation history and the optional relationship to an income transaction were designed.
- Row Level Security remains enabled.
- RLS policies, authentication, and household membership have not yet been finalized.
- React was selected for the frontend, and the next milestone is connecting it to Supabase and reading `categories`.

Before assuming implementation state, future sessions should inspect Supabase and the repository. A design recorded here does not by itself prove that every table, relationship, constraint, or policy has been created in the live project.

## 8. Finalized MVP Core Data Model

**Status: Decided architecture; implementation in progress**

The high-level structure is:

```text
households
├── accounts
│   ├── transactions
│   │   └── transaction_categories ──→ categories
│   └── transfers ──→ accounts
├── categories
│   └── allocations
└── future household membership
```

### Households

A household owns and manages the shared budget. It provides a foundation for the user and his wife to share one budget while keeping it isolated from other households if the application later supports more users.

```text
households
- id uuid PK
- name text
- created_at timestamptz
```

### Accounts

Accounts represent where money physically exists. Their balances are calculated from transactions and transfers rather than stored in a `current_balance` column.

```text
accounts
- id uuid PK
- household_id uuid FK → households.id
- account_name text
- account_type enum(normal, credit_card)
- is_active boolean DEFAULT true
- created_at timestamptz
```

### Categories

Categories represent what money is intended for. Their available balances are calculated from allocations minus categorized expenses.

```text
categories
- id uuid PK
- household_id uuid FK → households.id
- name text
- created_at timestamptz
```

Category grouping, archiving behavior, and default allocation rules may be added later after their behavior is deliberately designed.

### Transactions

Transactions represent income or expenses affecting an account.

```text
transactions
- id uuid PK
- account_id uuid FK → accounts.id
- total_amount numeric(12,2)
- transaction_type enum(income, expense)
- description text nullable
- purchase_date date
- receipt reference (future)
- created_at timestamptz
```

### Transaction Categories

`transaction_categories` is a junction table that assigns all or part of a transaction to one or more categories.

```text
transaction_categories
- transaction_id uuid FK → transactions.id
- category_id uuid FK → categories.id
- amount numeric(12,2)
```

This structure supports split transactions. The validation and user experience for temporarily incomplete categorization still require a decision.

### Transfers

Transfers move money between accounts without representing income or expense and without changing category balances.

```text
transfers
- id uuid PK
- from_account_id uuid FK → accounts.id
- to_account_id uuid FK → accounts.id
- amount numeric(12,2)
- transfer_date date
- description text nullable
- created_at timestamptz
```

Required constraints include:

```sql
CHECK (amount > 0)
CHECK (from_account_id <> to_account_id)
```

### Allocations

Allocations preserve the history of money assigned to budget categories.

```text
allocations
- id uuid PK
- category_id uuid FK → categories.id
- income_transaction_id uuid FK → transactions.id nullable
- amount numeric(12,2)
- allocation_date date
- created_at timestamptz
```

The nullable `income_transaction_id` connects allocations to a particular income transaction when appropriate while still permitting manual allocations.

### Deferred Data-Model Concepts

- Budget periods or monthly budgets
- Household membership
- Receipt metadata and file references
- Recurring transactions
- Reconciliation information
- Default percentage and fixed allocation rules
- Advanced investment-account holdings and market-value tracking

These should not automatically become new tables until their behavior has been worked through.

## 9. Receipt Support

### Required Direction — Decided

The user wants an easy way to attach pictures of receipts to transactions.

A receipt should be associated with its transaction, while category splits belong to `transaction_categories` rows associated with that transaction.

### Future Enhancements

Possible later receipt features include:

- Taking or uploading a photograph
- Storing the image through Supabase Storage
- Extracting merchant, date, total, or line items through OCR or AI
- Asking the user to verify extracted information
- Categorizing individual items
- Storing supporting documents for specialized transactions

The exact Supabase Storage implementation and receipt-reference schema remain unresolved. Automatic receipt scanning is not part of the current database sprint.

## 10. Future Features

The following ideas have been discussed and should be remembered, but they are not part of the immediate implementation unless deliberately promoted into scope:

- Recurring transactions
- Custom category groups
- Household-member tracking
- Reports and charts
- Account reconciliation
- Cleared and reconciled transaction states
- Bank synchronization
- Automatic transaction importing
- Automatic categorization
- Notifications
- Savings goals
- Receipt OCR or AI extraction
- Advanced investment-account holdings and market-value tracking
- Mobile application
- Real-time syncing between devices

Split transactions and the React web application have moved into the decided MVP architecture and are no longer merely future ideas.

The user liked these future ideas and asked that they be brought up when the project reaches the appropriate stage.

## 11. Explicitly Deferred Topics

### 529 College Savings

**Status: Out of Scope for Now**

529 handling was discussed, including account ownership, beneficiaries, qualified education expenses, contributions, growth, and supporting documentation.

The user explicitly decided not to focus on 529-specific behavior yet.

The first version should stay centered on:

- Accounts
- Categories
- Transactions
- Transaction categories
- Allocations
- Transfers

The general account design may eventually need enough flexibility to represent restricted-purpose or externally owned accounts, but specialized 529 behavior should not currently drive the schema.

### Investment-Account Value Tracking

**Status: Out of Scope for Now**

The MVP will not track investment holdings or changing market values. Those values do not fit the transaction-derived account-balance model cleanly and would expand the product into portfolio management. Investment contributions can still be represented in the day-to-day budget without tracking the investment account's live value.

## 12. Current Build Order

The current intended order is:

1. Verify the implemented Supabase schema against the decided MVP model.
2. Make sure the React project runs locally.
3. Install and configure the Supabase JavaScript client with environment variables.
4. Add representative household and category data.
5. Connect React to Supabase and query `categories`.
6. Display categories in React to complete the Read operation.
7. Add Create, Update, and Delete behavior for categories one operation at a time.
8. Complete the CSE 310 Cloud Databases deliverable.
9. Continue the broader budgeting MVP with transactions, allocations, transfers, and derived balances.
10. Add receipt uploads only after basic transaction behavior works.
11. Add a mobile interface in a later sprint.

Advanced automation should wait until the core financial calculations are reliable.

## 13. Open Questions

The following questions remain unresolved:

- How should budget periods or monthly budgets work?
- How should default percentage-allocation rules be stored and applied?
- What happens when allocation percentages total less than or greater than 100%?
- How should fixed and percentage allocation rules interact?
- How should rounding be handled when percentages divide income unevenly?
- How should unallocated money be represented?
- When and how should authentication and household membership be introduced?
- What Row Level Security policies are needed for household isolation?
- How and when should receipt storage be implemented in Supabase Storage?
- How should temporarily incomplete split categorization be represented and validated?
- At what point must `transaction_categories.amount` values sum exactly to `transactions.total_amount`?
- When should the GitHub repository be connected to Supabase?

The following questions are now decided and should not be reopened without a specific reason:

- Account balances are calculated from financial activity rather than stored as mutable current balances.
- Category balances are calculated from allocations minus categorized expenses.
- Allocation history is represented by individual `allocations` records.
- Income and expenses are represented by a transaction-type enum.
- Split transactions use `transaction_categories`.
- Transfers use a dedicated `transfers` table.
- React is the selected web frontend for this stage.
- Monetary values use `numeric(12,2)`.

Remaining questions should be resolved deliberately rather than silently assumed.

## 14. Assistant / Mentor Role

The assistant’s primary purpose in this project is to mentor the user into becoming a better software engineer, not to replace the user as the developer.

The user should generally make the first meaningful architecture attempt. The assistant should then review and pressure-test the proposed design, explain tradeoffs, identify edge cases, and help refine it. The assistant should avoid steering the user toward a predetermined architecture through a sequence of leading questions when the user is capable of proposing a design first.

The assistant should:

- Teach the concepts behind proposed designs.
- Explain why a particular design works.
- Help the user reason about architecture and tradeoffs.
- Ask useful questions before major decisions are finalized.
- Connect technical choices to the product’s real behavior.
- Help diagnose errors and explain what they mean.
- Review schemas, code, and design decisions.
- Point out edge cases and possible future consequences.
- Encourage the user to attempt meaningful parts of the work.
- Help the user develop greater independence over time.
- Provide direct design or implementation help when the user explicitly requests it, is stuck, or would benefit from a concrete example, while explaining the reasoning and preserving user ownership.

For this CSE 310 work, the assistant should function more like a mentor or teaching assistant than a substitute completing the assignment.

## 15. Guidance for Future Sessions

At the beginning of a future project conversation:

1. Read this file before proposing architecture or implementation.
2. Treat it as the current source of truth.
3. Do not treat proposed or future ideas as decided requirements.
4. Do not silently expand the active sprint.
5. Check the current repository and Supabase state before assuming what has been implemented.
6. Explain architectural changes and update this document when a decision changes.
7. Preserve the distinction between accounts and categories.
8. Remember that accounts and categories are independent views of the same money.
9. Preserve event history and derive balances from that history unless a later decision deliberately changes the model.
10. Keep 529-specific and investment-value-tracking features out of scope unless the user deliberately returns to them.
11. Keep the CSE 310 demonstration narrowly focused on category CRUD until its requirements are complete.
12. Let the user make the first architecture attempt when practical, then review and pressure-test it.
13. Provide direct design help when the user explicitly requests it.
14. Prioritize mentoring, understanding, and user ownership.

## 16. Decision Log

### September 22, 2026

- Defined the product as a personal budgeting system for the user and his wife.
- Chose to begin with the CSE 310 Cloud Databases module.
- Selected Supabase rather than Firebase.
- Established accounts, categories, transactions, allocations, and transfers as the core concepts.
- Established that categories must be customizable.
- Established that accounts and categories are independent views of the same money.
- Discussed percentage-based default allocations for variable paychecks.
- Identified receipt images, split transactions, reconciliation, and other enhancements for later development.
- Explicitly deferred specialized 529 support.

### September 23, 2026

- Created and opened the healthy `personal-budget` Supabase project.
- Deferred connecting a GitHub repository.
- Began designing the `households` table.
- Kept Row Level Security enabled.
- Proposed a junction table to support transactions split across several categories.
- Deferred frontend connection work until the database foundation was better understood.

### September 25, 2026

- Continued building the core Supabase foundation, including `households` and `accounts`.
- Decided to derive account balances from transactions and transfers instead of storing a mutable `current_balance`.
- Selected an `account_type` enum with `normal` and `credit_card` values.
- Added `is_active` so closed accounts can be archived without deleting their history.
- Standardized monetary fields on `numeric(12,2)` rather than floating-point types.
- Deferred investment-account holdings and market-value tracking from the MVP.

### September 30, 2026

- Defined transactions around `account_id`, `total_amount`, and an `income` or `expense` transaction type.
- Chose `transaction_categories` as the junction table for split transactions, avoiding confusion with income allocations.
- Chose a dedicated `transfers` table with separate source and destination account IDs.
- Required transfer amounts to be positive and source and destination accounts to be different.
- Preserved the principle that transfers affect account location but not budget-category balances.

### October 1, 2026

- Finalized allocation history as individual `allocations` records rather than a stored current category balance.
- Made `income_transaction_id` nullable so an allocation may reference a particular income transaction or be entered manually.
- Defined category available balance as allocations minus categorized expense amounts.
- Finalized the seven-table MVP core: `households`, `accounts`, `categories`, `transactions`, `transaction_categories`, `transfers`, and `allocations`.
- Selected React as the frontend for the current stage and the Supabase JavaScript client as the connection path.
- Narrowed the CSE 310 deliverable to demonstrating Create, Read, Update, and Delete, most likely with `categories`.
- Set the next milestone as connecting React to Supabase, querying categories, and displaying them before adding the remaining CRUD operations.
- Refined the mentoring approach: the user generally makes the first architecture attempt, and the assistant reviews and pressure-tests it; direct design help remains appropriate when explicitly requested.
