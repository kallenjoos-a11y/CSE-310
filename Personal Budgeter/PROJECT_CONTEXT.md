# Personal Budget Software — Project Context

**Last Updated:** September 23, 2026  
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

Examples:

- Checking
- Savings
- Cash
- Investment accounts

An account balance answers the question:

> Where is the money currently stored?

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

A transaction records something that happened to the money.

An expense should identify both:

- The account the money came from
- The category whose available balance should be reduced

Example:

```text
Payee: Walmart
Amount: $62.37
Account: Checking
Category: Groceries
Date: September 22, 2026
Note: Weekly groceries
Receipt: Optional image
```

This transaction would reduce both the Checking account balance and the available Groceries balance by $62.37.

Expected transaction information includes:

- Amount
- Date
- Merchant or payee
- Account
- Category allocation
- Optional note
- Optional receipt reference

### Allocations — Decided Concept, Details Not Finalized

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

The exact implementation of allocation history, budget periods, and category balances has not yet been finalized.

### Transfers — Decided Concept

A transfer moves money between accounts without counting as income or spending.

For example:

```text
Checking: -$500
Savings:  +$500
```

Budget-category balances remain unchanged.

The conceptual model is:

```text
Money comes in       → Income
Money gets assigned  → Allocation
Money gets used      → Expense
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

The current preference is to allow leftover money to remain Unallocated, but the complete behavior has not been finalized.

## 4. First Usable Product

**Status: Decided Direction**

The smallest useful budgeting experience should allow the user to:

1. Create and view accounts.
2. Create and customize budget categories.
3. Allocate money to categories.
4. Enter an expense.
5. Select the account used for the expense.
6. Select the category or categories paying for it.
7. See the account balance decrease.
8. See the appropriate category balance decrease.
9. View recent transactions.

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

The goal is not to finish the entire budgeting application. The sprint should establish a reusable cloud-data foundation and demonstrate an understanding of cloud database operations.

The working sprint goal is:

> Create a cloud-hosted household-budget database and a small program capable of creating, reading, updating, deleting, and querying financial data.

The initial demonstration may use a simple interface. A polished web dashboard is not required for the database sprint.

Relevant learning objectives include:

- PostgreSQL and Supabase
- Relational data modeling
- Primary and foreign keys
- Table relationships
- CRUD operations
- Useful financial queries
- Connecting application code to a cloud database
- Protecting credentials
- Authentication and Row Level Security concepts

The user has already completed ITM 220 and has prior SQL experience, so the project does not need to begin by reteaching basic SQL syntax.

## 6. Technical Direction

### Selected — Decided

- **Cloud platform:** Supabase
- **Database:** PostgreSQL through Supabase
- **Version control:** Git and GitHub are part of the intended workflow.
- **Development sequence:** Cloud database first, followed by a web application and later a mobile application.
- **Security direction:** Supabase Authentication and Row Level Security should eventually restrict data to members of the correct household.
- **Receipt storage direction:** Supabase Storage is the proposed location for receipt images.

Supabase was selected over Firebase because the project’s financial information fits a relational model and the user’s SQL experience transfers naturally to PostgreSQL.

### Not Yet Chosen

The following have not been finalized:

- Programming language for the database-sprint demonstration
- Web frontend framework
- Web backend or API structure
- Mobile framework
- Final repository and deployment structure
- Whether the web client will access Supabase directly or through an additional backend layer

Technologies suggested in earlier discussion should not be treated as committed choices until deliberately selected.

## 7. Current Supabase Progress

**Status: In Progress**

The following setup has been completed or observed:

- A Supabase organization was created.
- A Supabase project named `personal-budget` was created.
- The project was shown as healthy and running.
- GitHub was connected to the Supabase account, but no repository was connected to the Supabase project.
- Connecting a repository was deliberately deferred while the data structure is designed.
- Work began on the first table, named `households`.
- The proposed description for that table is:

  > Represents a household that owns and manages a shared budget.

- Row Level Security should remain enabled.
- RLS policies have not yet been designed.
- At the latest recorded point, the `households` table fields were still being reviewed before saving.

## 8. Preliminary Data Model

**Status: Proposed; not a finalized schema**

The current high-level structure is:

```text
households
    |
    +-- accounts
    |
    +-- categories
    |
    +-- transactions
            |
            +-- transaction_allocations
```

### Households

A household owns and manages the shared budget.

This provides a foundation for the user and his wife to share one budget while keeping it isolated from other households if the application later supports more users.

### Accounts

Accounts represent where money physically exists.

Likely information includes:

- Household
- Name
- Type
- Current balance or balance-calculation information
- Possible archived status

Whether balances should be stored directly or calculated from transactions still needs to be decided.

### Categories

Categories represent what money is intended for.

Likely information includes:

- Household
- Name
- Optional category group
- Optional type
- Active or archived status
- Possible default allocation rule

### Transactions

Transactions represent income, expenses, or other financial activity.

Likely information includes:

- Household or account ownership relationship
- Account
- Amount
- Date
- Merchant or payee
- Optional note
- Transaction type
- Optional receipt reference
- Possibly who entered or made the transaction

### Transaction Allocations

A separate transaction-allocation table is proposed so that one transaction can be divided among multiple budget categories.

Example:

```text
Walmart — $72.43

Groceries: $51.20
Household: $16.23
Clothing:   $5.00
```

This supports split transactions without forcing every transaction into exactly one category.

### Additional Concepts Still Requiring Design

- Income allocations
- Budget periods or monthly budgets
- Transfers between accounts
- Category balance calculation
- Receipt metadata and file references
- Household membership
- Recurring transactions
- Reconciliation information
- Default allocation rules

These should not automatically become new tables until their behavior has been worked through.

## 9. Receipt Support

### Required Direction — Decided

The user wants an easy way to attach pictures of receipts to transactions.

A receipt should be associated with its transaction, while any category split belongs to that transaction’s allocations.

### Future Enhancements

Possible later receipt features include:

- Taking or uploading a photograph
- Storing the image through Supabase Storage
- Extracting merchant, date, total, or line items through OCR or AI
- Asking the user to verify extracted information
- Categorizing individual items
- Storing supporting documents for specialized transactions

Automatic receipt scanning is not part of the current database sprint.

## 10. Future Features

The following ideas have been discussed and should be remembered, but they are not part of the immediate implementation unless deliberately promoted into scope:

- Split transactions
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
- More advanced investment-account support
- Web application
- Mobile application
- Real-time syncing between devices

The user liked these ideas and asked that they be brought up when the project reaches the appropriate stage.

## 11. Explicitly Deferred Topics

### 529 College Savings

**Status: Out of Scope for Now**

529 handling was discussed, including account ownership, beneficiaries, qualified education expenses, contributions, growth, and supporting documentation.

The user explicitly decided not to focus on 529-specific behavior yet.

The first version should stay centered on:

- Accounts
- Categories
- Transactions
- Allocations
- Transfers

The general account design may eventually need enough flexibility to represent restricted-purpose or externally owned accounts, but specialized 529 behavior should not currently drive the schema.

## 12. Current Build Order

The current intended order is:

1. Finish designing the core data model.
2. Create the initial Supabase tables one at a time.
3. Understand and define their primary and foreign keys.
4. Add representative sample data.
5. Build a small program that connects to Supabase.
6. Demonstrate create, read, update, delete, and query operations.
7. Complete the CSE 310 Cloud Databases deliverable.
8. Build the web application in a later sprint.
9. Add a mobile interface in a later sprint.

Receipt uploads should follow basic transaction behavior. Advanced automation should wait until the core financial calculations are reliable.

## 13. Open Questions

The following questions remain unresolved:

- What exact columns belong in `households`?
- What is the complete initial database schema?
- Should account balances be stored, calculated, or cached?
- How should category balances be calculated?
- How should allocation history be represented?
- How should budget periods work?
- How should income and expenses be represented consistently?
- Should transfers use a dedicated table, paired transactions, or another model?
- What rules guarantee that split allocations equal the transaction total?
- How should default percentage allocations be stored?
- How should fixed and percentage allocation rules interact?
- How should rounding be handled when percentages divide a paycheck unevenly?
- How should Unallocated money be represented?
- What language should be used for the first Supabase-connected program?
- What frontend framework should be used for the web application?
- When should authentication and household membership be introduced?
- When should receipt storage be implemented?
- When should the GitHub repository be connected to Supabase?

These should be resolved deliberately rather than silently assumed.

## 14. Assistant / Mentor Role

The assistant’s primary purpose in this project is to mentor the user into becoming a better software engineer, not to replace the user as the developer.

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
- Provide direct implementation help when explicitly requested or when appropriate, while preserving learning and user ownership.

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
9. Keep 529-specific features out of scope unless the user deliberately returns to them.
10. Prioritize mentoring, understanding, and user ownership.

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
- Proposed `transaction_allocations` to support transactions split across several categories.
- Deferred React or other frontend connection work until the database foundation is better understood.
