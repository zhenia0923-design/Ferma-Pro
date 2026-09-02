# FERMA PRO

Refactored farm-management application.

The original application is preserved as `legacy.html`. The active application is `app.html`, loaded by `index.html`.

## Modules

- Broiler batches: headcount, mortality, weighing, feed, treatment, sales, slaughter and home use.
- Laying hens: groups, daily eggs, feed and mortality.
- Feed recipes: multiple ingredients with kg, percentage and cost.
- Finance: unified income and expense journal.
- Reports: batch calculations and printing.
- Unified warehouse: feed, medicines, bedding and other stock with receipts, usage, sales, home transfers, adjustments, weighted-average cost, lots and expiry dates.

## First warehouse setup

Run `supabase_migration.sql` once in the Supabase SQL Editor. It creates `warehouse_items`, `warehouse_movements`, row-level security policies and the `warehouse_balances` view.

The warehouse module is available at `warehouse.html` and is designed to be integrated into the main navigation in the next application revision.
