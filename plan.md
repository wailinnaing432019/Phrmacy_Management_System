# MediStock — Full Refactor & Customer Split Plan

This is the working plan for the remaining work on the pharmacy app. It is written so any
developer or agent can pick up the project without re-discovering context. Read it fully before
changing code, then follow the batch order.

> **Working agreement:** Implement in reviewable batches. Each batch must end with clean, valid
> production code, Pint clean, a successful `npm run build`, and its own commit. Testing will
> be handled independently by the user — do not run or require the test suite in agent batches.
> Do not start the next batch without the user's approval. Do not implement two batches in one commit.

---

## 1. Status snapshot

- Branch: `build-upd`
- Last commit: `ea59e5d feat(customer): add customer table, model, guard, and order linkage`
- Pint: clean
- `npm run build`: green
- MySQL must be running. If Laragon is running, it is already started; otherwise see
  [§5 Environment](#5-environment-and-verification).

### Completed work

| Commit | Scope |
| --- | --- |
| `55c7df0` | Foundation: `BaseRepository`, `HasActivityLog`, soft deletes, Spatie activity log, `RepositoryServiceProvider` |
| `02d1800` | Master data: Category, Supplier, Medicine, MedicineSupplier (repos/services/resources/thin controllers) |
| `22538b1` | Transactions: Sale/POS, SaleReturn, Order, Invoice, Dashboard, User, PurchasedItem |
| `661f5ac` | Cleanup: removed 5 unreferenced controllers, added `docs/architecture.md` |
| `ea59e5d` | **C1**: `customers` table/model/factory, `customer` guard/provider/broker, `orders.customer_id` + backfill |
| `b184fa0` | **C2**: Customer auth flows (`customer` guard, split login, password reset, email verification, drop `orders.user_id`, narrow `users.role`) |
| `e42f9e5` | **C3**: Storefront refactor (`StorefrontRepository`, `StorefrontService`, `StorefrontController`, `ContactController`, resources) |
| `05d028d` | **C4**: Orders/checkout + admin views (`CustomerOrderRepository`, `CustomerOrderService`, `CustomerOrderController`, remove `CustomerController`) |

### Uncommitted user work — do not touch or commit

`database/seeders/DatabaseSeeder.php` has a local edit (the `Userfactory` call was removed).
It belongs to the user. Leave it in the working tree unless the user explicitly asks about it.

---

## 2. Locked decisions

These were approved and should not be revisited without asking the user:

- **Layered architecture**: controller → service → repository → resource. Controllers do
  validation + one service call + render/redirect only.
- **Domain name stays "Medicine"** (not Product).
- **Activity logging**: `spatie/laravel-activitylog` 4.x via the shared
  `App\Models\Concerns\HasActivityLog` trait.
- **Soft deletes only for master data**: Medicine, Category, Supplier, MedicineSupplier,
  User, and Customer. Sales, orders, returns, and stock movements stay immutable.
- **Customer accounts are a separate model/table/guard**, not `users.role = 'user'`.
- **Customer deletion soft-deletes** the account (email stays reserved by the unique index).
- **Customer SPA auth**: Sanctum same-domain session cookie + CSRF (no tokens in JS).
- **Keep every existing customer Inertia page working** until the SPA reaches parity.
- **No default credentials** are seeded. Admins are created with
  `php artisan app:create-admin`.

---

## 3. Architecture rules (mandatory for all remaining work)

Follow the patterns already established in Phase 1. Reference:
`docs/architecture.md`, `app/Repositories/Medicine/`, `app/Services/Medicine/`,
`app/Http/Resources/Medicine/`.

```
app/Repositories/<Module>/
    <Module>RepositoryInterface.php   // contract, extends BaseRepositoryInterface (or bespoke for read-only)
    <Module>Repository.php            // every Eloquent query for the module
app/Services/<Module>/<Module>Service.php
app/Http/Resources/<Module>/<Module>Resource.php
app/Http/Controllers/<Module>Controller.php
```

- Bind every repository interface in `app/Providers/RepositoryServiceProvider.php`.
- `BaseRepository` already provides `query()`, `all()`, `findOrFail()`, `create()`,
  `update()`, `delete()`; add module-specific query methods to the interface.
- Services own transactions, stock movements, sequence numbers, mail, and cross-model rules.
- Resources must reproduce the **exact prop shape** the React page already consumes. Verify
  by reading the page and its `columns.tsx`/type definitions before writing a resource.
- Keep route names and URLs stable unless the batch explicitly says otherwise. Prefer
  rendering the same Inertia component paths.
- Add `HasActivityLog` and `SoftDeletes` only on master-data models.

---

## 4. Remaining batches

### C2 — Customer auth flows (in progress / finishing)

Move authentication from `users.role = 'user'` to the `customer` guard, then remove the
legacy customer role and column.

**Routing:**

| Purpose | Staff (`web` guard) | Customer (`customer` guard) |
| --- | --- | --- |
| Login | `GET/POST /login` → `auth/login` | `GET/POST /customers/login` → `customers/LoginForm` |
| Register | — (staff created by admin) | `GET/POST /customers/register` → `customers/Register2` |
| Forgot password | `GET/POST /forgot-password` (`users` broker) | `GET/POST /customers/forgot-password` (`customers` broker) |
| Reset password | `GET/POST /reset-password/{token}` | `GET/POST /customers/reset-password/{token}` |
| Verify email | existing routes using `web` | dedicated customer routes |
| Logout | `POST /logout` | `POST /customers/logout` (or one route that logs out both guards) |

The current `AuthenticatedSessionController::create()` renders `customers/LoginForm` for
**everyone**; that is the login page that must be split. Staff should render `auth/login`
(the commented-out block already exists), customers keep `customers/LoginForm`.

**Tasks**

1. Create customer auth controllers under `app/Http/Controllers/Auth/Customer/`:
   - `RegisteredCustomerController` (create/store) — creates a `Customer`, fires
     `Registered`, logs in with `Auth::guard('customer')`, redirects to `customer.index`.
   - `AuthenticatedCustomerSessionController` (create/store/destroy) — `Auth::guard('customer')
     ->attempt(...)`, session regenerate/invalidate, redirect `customer.index`.
   - `CustomerPasswordResetLinkController`, `CustomerNewPasswordController` — use
     `Password::broker('customers')`.
   - `CustomerEmailVerification*` controllers or a guard-aware verification middleware.
2. Create `app/Http/Requests/Auth/CustomerLoginRequest.php`. Keep rate limiting (`5` attempts)
   and separate customer throttle key format.
3. Add a customer auth middleware that redirects unauthenticated customers to
   `customer.login`. `auth:customer` alone redirects to the default `login` route, which is
   the staff page. Implement `EnsureCustomerIsAuthenticated`.
4. Email verification: Customer routes use guard-aware middleware
   (`EnsureCustomerEmailIsVerified`) that checks `auth('customer')->user()` and redirects to
   the customer verification notice.
5. `GoogleController`:
   - Resolve/create `Customer` only.
   - Log in with `Auth::guard('customer')`.
   - If the email belongs to a staff `User`, refuse with a clear error and link to staff
     login instead of creating a duplicate customer.
   - Keep `google_id`, verified email (`email_verified_at ??= now()`).
6. Update `routes/web.php` customer group to use `['customer', 'customer.verified']`.
   Keep the URLs/route names for storefront pages unchanged.
7. Update customer-facing links:
   - `resources/js/layouts/app/customers/Navbar.tsx` (`route('login')` → `route('customer.login')`,
     `route('register')` → `route('customer.register')`, `auth.customer`)
   - `resources/js/pages/customers/LoginForm.tsx`
   - `resources/js/pages/customers/RegisterForm.tsx`
8. Move checkout/orders ownership from `auth()->id()` / `orders.user_id` to
   `auth('customer')->id()` / `orders.customer_id` in `CustomerController` (checkout,
   `myOrders`, `myOrderItems`).
9. Data cleanup migration (single migration, ordered carefully):
   1. Abort unless every order with a `user_id` that belongs to a legacy customer has
      `customer_id` set.
   2. Drop `orders.user_id` foreign key, then the column.
   3. Delete `users.role = 'user'` rows.
   4. Alter `users.role` enum to `('admin','cashier')`; change default to `'cashier'`.
   5. Best-effort `down()`.
10. Remove/retire `User::ROLE_USER`, `User::homeRouteName()`'s customer fallback, and all
    `role:user` usages. Keep `RoleMiddleware` for staff routes.

**Files to touch**

- `config/auth.php`
- `routes/auth.php`, `routes/web.php`
- `app/Http/Controllers/Auth/RegisteredUserController.php`
- `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- `app/Http/Controllers/Auth/Customer/*`
- `app/Http/Controllers/GoogleController.php`
- `app/Http/Controllers/CustomerController.php`
- `app/Models/User.php`, `app/Models/Customer.php`
- `database/migrations/*_narrow_users_role_to_staff.php`
- `database/factories/UserFactory.php` (default role becomes staff, e.g. `cashier`)
- `database/factories/OrderFactory.php` (use `customer_id` once `user_id` is dropped)

**Acceptance criteria**

- Existing storefront pages still render for guests.
- Staff login still lands on dashboard/POS; customer login lands on the storefront.
- `users` contains only `admin`/`cashier`; no `role = 'user'` remains.
- `./vendor/bin/pint --dirty` and `npm run build` pass cleanly.

---

### C3 — Storefront refactor (done)

Extract the storefront half into repositories/services/resources without changing any page or UI behavior.

---

### C4 — Orders/checkout + admin views (done)

Moved orders from legacy user relationship to `Customer`:
- `CustomerOrderRepository` + `CustomerOrderService` + `CustomerOrderController`
- Resources matching `customers/MyOrders`, `customers/MyOrderItems`
- Removed `CustomerController.php`
- Cleaned `Order.php`, `OrderRepository.php`, `SaleService.php`, and admin order resources to use `customer` relationship with `name` fallback.

---

### C5 — Customer API + SPA (next)

**API**

- Install Sanctum (`php artisan install:api`) and enable same-domain session auth:
  - `SANCTUM_STATEFUL_DOMAINS` includes the SPA host;
  - CORS credentials allowed for that host;
  - CSRF cookie flow (`/sanctum/csrf-cookie`) documented.
- Add `routes/api.php` with `/api/v1`:
  - `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`,
    `/auth/reset-password`;
  - `GET /products`, `GET /products/{medicine}`, `GET /categories`;
  - `POST /orders`, `GET /orders`, `GET /orders/{order}` (customer-scoped).
- Reuse the C3/C4 services. Do not duplicate business logic in API controllers.
- Add API resources under `app/Http/Resources/Api/V1/` (separate from Inertia resources).
- Rate limit auth and checkout endpoints.

**SPA**

- Build the customer SPA against `/api/v1`; keep the existing Inertia storefront running
  until parity is verified.
- Switch traffic per route or via a feature flag/subdomain; do not delete the Inertia pages
  until the SPA covers every flow (browse, product, cart, checkout, my orders, auth).
- Reuse the existing React components/styles where practical; the API is the contract.

**Acceptance criteria**

- Both the Inertia storefront and the SPA work during the transition.
- Cookie session auth configured cleanly.
- Pint clean, `npm run build` passes, one commit per sub-step.

---

## 5. Environment and verification

```bash
php artisan migrate
./vendor/bin/pint --dirty
npm run build
```

- DB: `pharmacy_db` on `127.0.0.1:3306`, user `root`, empty password (see `.env`).
- Check `git status` before committing. Do **not** stage the user's `DatabaseSeeder.php`
  edit. Prefer `git add <paths>` over `git add -A` while that edit exists.

---

## 6. Gotchas and sequencing constraints

1. **`orders.user_id` is NOT NULL with `ON DELETE CASCADE`.** If deleting legacy users
   before dropping that FK, MySQL cascades and deletes their orders. Always: backfill
   `customer_id` → verify → drop FK/column → delete users → narrow enum.
2. **C1 intentionally kept `orders.user_id`.** Dropping it in C1 would break registration
   followed by checkout because new customers still authenticate on the web guard until C2.
3. **`auth:customer` redirects to `route('login')` by default**, which is the staff page.
   Add a customer-aware unauthenticated redirect.
4. **`verified` middleware checks the default guard**, not `auth('customer')`. Use a
   guard-aware middleware for customer verification.
5. **`HandleInertiaRequests` shares `auth.user` from the default guard.** If customer pages
   need the signed-in customer in props, add `auth.customer` (or resolve the guard based on
   the request) without breaking staff pages that read `auth.user`.
6. **Existing customer link names**: the storefront navbar and forms use `route('login')`
   and `route('register')`. Update them in C2 if customer auth moves to `/customers/*`.
7. **`RoleMiddleware` uses `$request->user()`** (default web guard). Keep it only on staff
   routes; customer routes must use the customer middleware.
8. **Customer email uniqueness vs soft deletes**: a soft-deleted customer keeps the email
   reserved. Validation must decide whether deleted emails can be reused (current decision:
   no). Use `Rule::unique('customers', 'email')` and do not add `whereNull('deleted_at')`
   unless the user changes this.
9. **Activity log excludes** `password`, `remember_token`, timestamps; keep that behavior
   for the Customer model.
10. **Composer reports ~75 security advisories.** Not yet addressed. Treat as a separate
    optional task (`composer audit`), not part of a feature batch.
11. **`CustomerController` has unrouted `home()` and `liked()` methods.** Verify before
    deleting; do not remove a page that the SPA or frontend still references.
12. **Resource shapes are contracts.** Read the React page/type/columns before changing any
    prop name; the existing pages must not need edits for a backend refactor.

---

## 7. Quick file map

**Auth / customer**
- `config/auth.php` — `web` and `customer` guards, providers, brokers.
- `app/Models/User.php` — staff only after C2 (`admin`, `cashier`).
- `app/Models/Customer.php` — customer account, `orders()` relation.
- `app/Http/Controllers/Auth/*` — staff auth + new customer auth in C2.
- `app/Http/Controllers/GoogleController.php` — customer-only OAuth.
- `app/Http/Middleware/RoleMiddleware.php` — staff role gate.
- `routes/auth.php`, `routes/web.php` — auth and storefront routes.

**Storefront / orders**
- `app/Http/Controllers/CustomerController.php` — to be split in C3/C4.
- `app/Models/Medicine.php` — `availableForSale()`, `withSellableQty()`, `sellableQty()`.
- `app/Repositories/Dashboard/DashboardRepository.php` — shared top-selling logic.
- `app/Services/OrderReservationService.php`, `app/Services/InventoryService.php`.

**Admin / cashier (done in Phase 1)**
- `app/Repositories/*`, `app/Services/*`, `app/Http/Resources/*`
- `app/Providers/RepositoryServiceProvider.php`
- `docs/architecture.md`

---

## 8. Current route map (customer side)

| Method | URL | Controller | Name | Access |
| --- | --- | --- | --- | --- |
| GET | `/customers` | `CustomerController@index` | `customer.index` | guest |
| GET | `/customers/products` | `CustomerController@products` | `customers.products` | guest |
| GET | `/customers/product/{medicine}` | `CustomerController@product` | `customers.product` | guest |
| GET | `/customers/cart` | `CustomerController@cart` | `customer.cart` | guest |
| POST | `/customers/contact` | `CustomerController@send` | `contact` | guest, throttle 5/min |
| GET | `/customers/login` | `AuthenticatedCustomerSessionController@create` | `customer.login` | guest |
| GET | `/customers/register` | `RegisteredCustomerController@create` | `customer.register` | guest |
| GET | `/customers/checkout` | `CustomerController@showCheckout` | `customer.checkout` | `customer, customer.verified` |
| GET | `/customers/orders` | `CustomerController@orders` | `customer.orders` | `customer, customer.verified` |
| POST | `/checkout` | `CustomerController@checkout` | `checkout` | `customer, customer.verified`, throttle 20/min |
| GET | `/my-orders` | `CustomerController@myOrders` | `customers.myorders` | `customer, customer.verified` |
| GET | `/my-orders/{order}` | `CustomerController@myOrderItems` | `customers.myorderitems` | `customer, customer.verified` |

---

## 9. Definition of done (every batch)

1. Migration(s) applied locally and clean.
2. Production code strictly follows the layered architecture and locked decisions.
3. `./vendor/bin/pint --dirty` clean.
4. `npm run build` succeeds without errors.
5. One clean commit with conventional message describing changes and scope.
6. `git status` verified (unintended files, including `DatabaseSeeder.php`, never committed).
7. `docs/architecture.md` updated as applicable.
