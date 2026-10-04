# Personal Budget Software

A personal budgeting application designed to track where money is stored and what that money is budgeted for.

This project currently uses a React frontend connected to a PostgreSQL cloud database hosted by Supabase. The current version demonstrates cloud database operations by allowing budget categories to be created, read, updated, and deleted.

The database has also been designed to support accounts, transactions, split transactions, transfers between accounts, and budget allocations as the application continues to develop.

## Instructions for Build and Use

Steps to build and/or run the software:

1. Clone the repository to your computer.
2. Install the project dependencies with `npm install`.
3. Create a `.env` file in the project root with the required Supabase environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_DEV_HOUSEHOLD_ID`
4. Start the React development server with `npm run dev`.
5. Open the local URL provided by Vite in a web browser.

Instructions for using the software:

1. Start the application and open it in a web browser.
2. View the budget categories retrieved from the Supabase cloud database.
3. Add a new budget category.
4. Update an existing category.
5. Delete a category.
6. Changes made through the application are stored in the Supabase PostgreSQL database.

## Development Environment

To recreate the development environment, you need the following software and/or libraries:

* Visual Studio Code
* Node.js and npm
* React
* Vite
* `@supabase/supabase-js`
* Supabase
* PostgreSQL
* Git and GitHub

## Useful Websites to Learn More

I found these websites useful in developing this software:

* [Supabase Documentation](https://supabase.com/docs)
* [Supabase JavaScript Documentation](https://supabase.com/docs/reference/javascript/introduction)
* [React Documentation](https://react.dev/)
* [Vite Documentation](https://vite.dev/guide/)
* [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Future Work

The following items I plan to fix, improve, and/or add to this project in the future:

* [ ] Implement Supabase Authentication and replace the temporary development household ID.
* [ ] Replace temporary development Row Level Security policies with secure household-specific policies.
* [ ] Build the main budgeting dashboard with total money, budgeted money, and unallocated money.
* [ ] Add account management for checking, savings, cash, and credit card accounts.
* [ ] Add income and expense transaction entry.
* [ ] Allow purchases to be split across multiple budget categories.
* [ ] Implement category allocations and display the amount spent and remaining in each category.
* [ ] Add transfers between accounts without treating them as income or expenses.
* [ ] Add transaction history.
* [ ] Add receipt image uploads using Supabase Storage.
* [ ] Add default percentage-based paycheck allocations.
* [ ] Add real-time updates when cloud data changes.