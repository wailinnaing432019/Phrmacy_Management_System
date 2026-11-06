# Architecture

MediStock uses a layered backend so that controllers stay thin, business rules live in
services, and every database query lives in a repository. Phase 1 covers the admin panel
and cashier POS. The customer storefront and its separate API/auth will be migrated in a
later phase and are intentionally untouched for now.

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Controller | `app/Http/Controllers` | Validate the request, call one service method, render an Inertia page or redirect. No queries, no transactions. |
| Form request | `app/Http/Requests` | Reusable validation rules (categories, suppliers). |
| Service | `app/Services/<Module>` | Business rules, transactions, stock movements, sequencing, mail. |
| Repository | `app/Repositories/<Module>` | Every Eloquent query for its module. Interfaces define the contract. |
| Resource | `app/Http/Resources/<Module>` | The exact array shape an Inertia page receives. |
| Model | `app/Models` | Relationships, casts, scopes, and the activity-log/soft-delete traits. |

Shared contracts:

- `app/Repositories/BaseRepositoryInterface.php`
- `app/Repositories/BaseRepository.php` — CRUD, pagination, soft-delete helpers.
- `app/Providers/RepositoryServiceProvider.php` — binds every `*RepositoryInterface` to its implementation.

Every module follows the same shape:

```
app/Repositories/Medicine/
    MedicineRepositoryInterface.php
    MedicineRepository.php
app/Services/Medicine/MedicineService.php
app/Http/Resources/Medicine/MedicineResource.php
```

## Request flow

1. A route resolves a controller method (often with route-model binding).
2. The controller validates input and calls one service method.
3. The service applies business rules and opens a transaction when several writes must
   succeed or fail together.
4. The repository performs the queries.
5. The controller maps the result through a resource (for Inertia props) and renders the
   page or redirects with a flash message.

## Refactored modules

| Module | Repository | Service |
| --- | --- | --- |
| Category | `CategoryRepository` | `CategoryService` |
| Supplier | `SupplierRepository` | `SupplierService` |
| Medicine | `MedicineRepository` | `MedicineService` |
| Medicine supplier | `MedicineSupplierRepository` | `MedicineSupplierService` |
| Sales / POS | `SaleRepository` | `SaleService` |
| Sale returns | `SaleReturnRepository` | `SaleReturnService` |
| Orders | `OrderRepository` | `OrderService` |
| Invoices | — | `OrderService` |
| Dashboards | `DashboardRepository` | `DashboardService` |
| Users | `UserRepository` | `UserService` |
| Purchase batches | `PurchasedItemRepository` | `PurchasedItemService` |
| Storefront | `StorefrontRepository` | `StorefrontService` |
| Customer orders | `CustomerOrderRepository` | `CustomerOrderService` |

`BarcodeController` is intentionally thin: it only renders a Code-128 PNG.

## Soft deletes and activity logs

- `SoftDeletes` is applied to **master data only**: Medicine, Category, Supplier,
  MedicineSupplier, User, and Customer. Sales, orders, returns, and stock movements remain
  immutable and are never deleted.
- `App\Models\Concerns\HasActivityLog` wraps `spatie/laravel-activitylog` and logs
  fillable attributes, dirty changes only, excluding passwords and tokens. The log name
  is the table name.
- Unique medicine names and barcodes ignore soft-deleted rows so a deleted medicine does
  not block a new one.

## Customer accounts

Customers are stored separately from staff in `customers` and authenticate through the
`customer` session guard (provider `customers`, password broker `customers` using
`customer_password_reset_tokens`). Staff keep using the `web` guard and `users` table.

The split lands in batches while the storefront stays on its existing Inertia pages:

1. **C1 (done)** — `customers` table/model/factory, guard/provider/broker, and a nullable
   `orders.customer_id` backfilled from legacy `users.role = 'user'` accounts.
2. **C2 (done)** — customer registration, login, logout, password reset, and Google OAuth
   moved to the `customer` guard; `users.role` narrowed to `admin | cashier`; `orders.user_id`
   dropped.
3. **C3 (done)** — storefront controllers refactored into repository/service/resources.
4. **C4 (done)** — checkout and customer order management moved to customer-centric controllers/services.
5. **C5 (done)** — Sanctum-authenticated API (`/api/v1`) and customer SPA (`/spa`).

## Adding a new module

1. Create `<Module>RepositoryInterface` and `<Module>Repository` under
   `app/Repositories/<Module>`, extending the base contract.
2. Bind the interface in `RepositoryServiceProvider`.
3. Create `app/Services/<Module>/<Module>Service.php` with the business operations.
4. Create the Inertia resources under `app/Http/Resources/<Module>` matching the page props.
5. Reduce the controller to validation → service call → resource/redirect.
6. Add model traits (`HasActivityLog`, `SoftDeletes`) when the model is master data.
7. Add tests for CRUD, soft deletes, activity logs, and page rendering.

## Tests and tooling

```bash
php artisan test
./vendor/bin/pint
npm run build
```

Tests run against MySQL (not SQLite) and use `RefreshDatabase`.
