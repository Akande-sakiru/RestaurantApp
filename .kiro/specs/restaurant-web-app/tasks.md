# Implementation Plan: Restaurant Web Application

## Overview

Full-stack restaurant SPA built on Laravel 12 + React 19 + Inertia.js v2. Implementation is organized into 10 phases that build incrementally: foundation and data layer first, then backend features, then frontend, then real-time and notifications, and finally testing. Each phase produces working, integrated code before the next phase begins.

## Tasks

- [ ] 1. Foundation — database, models, RBAC, and shared infrastructure
  - [ ] 1.1 Publish Spatie Permission migrations and update the users migration
    - Run `php artisan vendor:publish --provider="Spatie\LaravelPermission\PermissionServiceProvider"` to publish the permission tables migration
    - Add `is_active` (boolean, default true) and `deleted_at` (nullable timestamp) columns to the existing `create_users_table` migration
    - Add `phone` (nullable string) column to the users migration
    - _Requirements: 2.1, 3.1, 12.4_

  - [x] 1.2 Create migrations for categories, menu_items, orders, order_items, and reservations
    - Create `2024_01_01_000002_create_categories_table.php`: `id`, `name`, `slug` (unique), `sort_order` (int default 0), `timestamps`
    - Create `2024_01_01_000003_create_menu_items_table.php`: `id`, `category_id` (FK → categories), `name`, `slug` (unique), `description` (text), `price` (decimal 8,2), `image_path` (nullable string), `is_available` (boolean default true), `sort_order` (int default 0), `deleted_at`, `timestamps`
    - Create `2024_01_01_000004_create_orders_table.php`: `id`, `user_id` (FK → users), `order_number` (unique string), `type` (enum: dine-in|takeaway|delivery), `status` (enum: pending|confirmed|preparing|ready|completed|cancelled, default pending), `delivery_address` (nullable text), `table_number` (nullable string), `subtotal` (decimal 8,2), `total` (decimal 8,2), `notes` (nullable text), `deleted_at`, `timestamps`
    - Create `2024_01_01_000005_create_order_items_table.php`: `id`, `order_id` (FK → orders), `menu_item_id` (nullable FK → menu_items), `menu_item_name` (string — snapshot), `menu_item_price` (decimal 8,2 — snapshot), `quantity` (unsigned int), `customization_notes` (nullable text), `timestamps`
    - Create `2024_01_01_000006_create_reservations_table.php`: `id`, `user_id` (FK → users), `reservation_number` (unique string), `reserved_date` (date), `reserved_time` (time), `party_size` (unsigned tinyint), `status` (enum: pending|confirmed|cancelled|completed, default pending), `special_requests` (nullable text), `timestamps`
    - _Requirements: 5.1, 6.1, 7.1, 9.1_

  - [-] 1.3 Update the User model and create Category, MenuItem, Order, OrderItem, and Reservation models
    - Update `app/Models/User.php`: add `HasRoles`, `SoftDeletes` traits; set `$fillable` to `['name', 'email', 'phone', 'password', 'is_active']`; add `is_active` and `email_verified_at` casts; add `orders()` HasMany and `reservations()` HasMany relationships
    - Create `app/Models/Category.php` with `HasFactory`; `$fillable = ['name', 'slug', 'sort_order']`; `menuItems()` HasMany relationship
    - Create `app/Models/MenuItem.php` with `HasFactory`, `SoftDeletes`; `$fillable` and `$casts` per design; `category()` BelongsTo, `orderItems()` HasMany; `getImageUrlAttribute()` accessor using `Storage::url()`
    - Create `app/Models/Order.php` with `HasFactory`, `SoftDeletes`; `$fillable` and `$casts` per design; `user()` BelongsTo, `items()` HasMany (→ OrderItem)
    - Create `app/Models/OrderItem.php` with `HasFactory`; `$fillable` and `$casts` per design; `order()` BelongsTo, `menuItem()` BelongsTo (nullable)
    - Create `app/Models/Reservation.php` with `HasFactory`; `$fillable` and `$casts` per design; `user()` BelongsTo
    - _Requirements: 2.2, 3.1, 5.1, 6.1, 7.1, 8.6, 9.5_

  - [ ] 1.4 Create the RolesAndPermissionsSeeder and update DatabaseSeeder
    - Create `database/seeders/RolesAndPermissionsSeeder.php` that creates all permissions listed in the design (`menu.view`, `menu.create`, `menu.update`, `menu.delete`, `orders.view-own`, `orders.view-all`, `orders.update-status`, `reservations.view-own`, `reservations.view-all`, `reservations.update-status`, `users.view`, `users.manage`, `cart.manage`) and assigns them to `customer` and `admin` roles as specified
    - Create a default admin user seeder (`AdminUserSeeder.php`) that creates one admin account
    - Update `DatabaseSeeder.php` to call `RolesAndPermissionsSeeder` and `AdminUserSeeder`
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 1.5 Register Spatie middleware aliases and configure bootstrap/app.php
    - In `bootstrap/app.php`, register `role` and `permission` middleware aliases pointing to Spatie's `RoleMiddleware` and `PermissionMiddleware`
    - Ensure `HandleInertiaRequests` middleware is registered in the web middleware stack
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ] 1.6 Create model factories for all new models
    - Create `CategoryFactory.php`, `MenuItemFactory.php`, `OrderFactory.php`, `OrderItemFactory.php`, `ReservationFactory.php`
    - Update `UserFactory.php` to include `is_active`, `phone` fields
    - _Requirements: (testing infrastructure)_


- [ ] 2. Backend services and route structure
  - [ ] 2.1 Create CartService and bind it in AppServiceProvider
    - Create `app/Services/CartService.php` implementing `get()`, `add()`, `update()`, `remove()`, `clear()`, `count()`, `subtotal()`, and `key()` methods as specified in the design
    - `add()` must increment quantity if item already exists in the Redis hash; `update()` with qty=0 must call `remove()`; cart TTL is 7 days, refreshed on each write
    - `subtotal()` iterates hash values and sums `price * quantity` accurate to two decimal places
    - Bind `CartService` as a singleton in `AppServiceProvider`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 2.2 Create OrderService
    - Create `app/Services/OrderService.php` with `createFromCart(User $user, array $validated): Order`
    - Wrap in `DB::transaction`: fetch cart items, validate all items are still available, create `Order` record with a unique `order_number` (e.g., `ORD-` + timestamp + random), create `OrderItem` records snapshotting `menu_item_name` and `menu_item_price`, clear the cart, dispatch `OrderCreated` event and `SendOrderConfirmationEmail` job
    - _Requirements: 6.5, 6.6, 15.1_

  - [ ] 2.3 Define all web routes in routes/web.php
    - Define public routes: `GET /` (LandingController), `GET /menu` (MenuController)
    - Define customer route group with `['auth', 'verified', 'role:customer|admin']` middleware: cart CRUD, orders index/show/store, reservations index/create/store/cancel, profile edit/update/password/destroy
    - Define admin route group with `['auth', 'verified', 'role:admin']` middleware, prefix `admin`, name `admin.`: dashboard, menu-items resource, categories resource, orders index/show/status, reservations index/status, users index/role/toggle-active
    - Ensure `require __DIR__.'/auth.php'` is present
    - _Requirements: 2.9, 3.2, 3.3, 3.4, 14.1_

  - [ ] 2.4 Update HandleInertiaRequests middleware to share auth, cart, and flash props
    - Update `share()` method to return `auth.user` with `id`, `name`, `email`, `roles` (via `getRoleNames()`), or null for guests
    - Add `cart.count` using `app(CartService::class)->count($request->user())` (0 for guests)
    - Add `flash.success` and `flash.error` from session
    - _Requirements: 3.5, 14.2, 14.3, 14.4_


- [ ] 3. Auth controllers and RBAC enforcement
  - [ ] 3.1 Update RegisteredUserController to assign the customer role and redirect correctly
    - After `User::create([...])`, call `$user->assignRole('customer')`
    - Change the post-registration redirect to `route('orders.index')` (customer dashboard)
    - _Requirements: 2.2, 3.1_

  - [ ] 3.2 Update AuthenticatedSessionController for role-aware redirects
    - After successful login, redirect `admin` role users to `route('admin.dashboard')` and `customer` role users to `route('orders.index')`
    - After logout, redirect to `route('home')`
    - _Requirements: 2.5, 2.7_

  - [ ] 3.3 Add is_active check to LoginRequest or authentication guard
    - In `LoginRequest::authenticate()` (or via a custom guard), after credentials are validated, check `$user->is_active`; if false, throw a `ValidationException` with an appropriate error message
    - _Requirements: 12.4_

  - [ ]* 3.4 Write property test for registration role assignment (Property 2)
    - **Property 2: Registration assigns exactly the customer role**
    - **Validates: Requirements 2.2, 3.1**
    - Tag with `#[Group('property')]`

  - [ ]* 3.5 Write property test for unauthenticated route protection (Property 3)
    - **Property 3: Unauthenticated requests to protected routes redirect to login**
    - **Validates: Requirements 2.9**
    - Tag with `#[Group('property')]`

  - [ ]* 3.6 Write property test for customer role blocked from admin routes (Property 4)
    - **Property 4: Customer role cannot access admin routes**
    - **Validates: Requirements 3.2, 3.4**
    - Tag with `#[Group('property')]`

  - [ ]* 3.7 Write property test for Inertia shared props include user role (Property 5)
    - **Property 5: Inertia shared props always include authenticated user's role**
    - **Validates: Requirements 3.5**
    - Tag with `#[Group('property')]`

- [ ] 4. Checkpoint — run migrations, seeders, and auth tests
  - Run `php artisan migrate:fresh --seed` and verify roles/permissions are created
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 5. Backend controllers — public and customer features
  - [ ] 5.1 Create LandingController
    - `index()` queries up to 6 active `MenuItem` records (with their category) to use as featured items
    - Returns `Inertia::render('Welcome', ['featuredItems' => ..., 'restaurantInfo' => [...]])` where `restaurantInfo` contains name, tagline, address, hours, and contact info (sourced from config or hardcoded constants)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 Write property test for featured items contain required fields (Property 1)
    - **Property 1: Featured menu items contain required fields**
    - **Validates: Requirements 1.3**
    - Tag with `#[Group('property')]`

  - [ ] 5.3 Create MenuController
    - `index()` accepts optional `category` (ID) and `search` (string) query parameters
    - Queries active `MenuItem` records with their category; applies category filter when provided; applies case-insensitive `name` or `description` LIKE search when provided
    - Returns `Inertia::render('Menu/Index', ['menuItems' => ..., 'categories' => Category::orderBy('sort_order')->get(), 'filters' => compact('category', 'search')])`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 5.4 Write property test for menu page groups all active items by category (Property 6)
    - **Property 6: Menu page groups all active items by category**
    - **Validates: Requirements 4.2**
    - Tag with `#[Group('property')]`

  - [ ]* 5.5 Write property test for menu items contain required fields (Property 7)
    - **Property 7: Menu items in response contain all required fields**
    - **Validates: Requirements 4.3**
    - Tag with `#[Group('property')]`

  - [ ]* 5.6 Write property test for category filter returns only matching items (Property 8)
    - **Property 8: Category filter returns only items from that category**
    - **Validates: Requirements 4.5**
    - Tag with `#[Group('property')]`

  - [ ]* 5.7 Write property test for menu search returns only matching items (Property 9)
    - **Property 9: Menu search returns only matching items**
    - **Validates: Requirements 4.6**
    - Tag with `#[Group('property')]`

  - [ ] 5.8 Create CartController
    - `index()`: returns `Inertia::render('Cart/Index', ['cartItems' => $cartService->get($user), 'subtotal' => $cartService->subtotal($user)])`
    - `store(Request $request)`: validates `menu_item_id`, `quantity` (min 1), optional `notes`; checks item `is_available`; calls `$cartService->add()`; returns redirect back with success flash
    - `update(Request $request, MenuItem $menuItem)`: validates `quantity` (min 0); calls `$cartService->update()` (which removes if qty=0); returns redirect back
    - `destroy(MenuItem $menuItem)`: calls `$cartService->remove()`; returns redirect back
    - `clear()`: calls `$cartService->clear()`; returns redirect back
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7_

  - [ ]* 5.9 Write property test for cart persistence across requests (Property 10)
    - **Property 10: Cart persists across requests within the same session**
    - **Validates: Requirements 5.1, 5.7**
    - Tag with `#[Group('property')]`

  - [ ]* 5.10 Write property test for adding item stores all provided data (Property 11)
    - **Property 11: Adding an item to the cart stores all provided data**
    - **Validates: Requirements 5.2**
    - Tag with `#[Group('property')]`

  - [ ]* 5.11 Write property test for duplicate cart item increments quantity (Property 12)
    - **Property 12: Adding a duplicate cart item increments quantity**
    - **Validates: Requirements 5.3**
    - Tag with `#[Group('property')]`

  - [ ]* 5.12 Write property test for cart subtotal equals sum of price times quantity (Property 13)
    - **Property 13: Cart subtotal equals sum of price times quantity**
    - **Validates: Requirements 5.5**
    - Tag with `#[Group('property')]`

  - [ ]* 5.13 Write property test for unavailable items cannot be added to cart (Property 25)
    - **Property 25: Unavailable items cannot be added to the cart**
    - **Validates: Requirements 9.4**
    - Tag with `#[Group('property')]`

  - [ ] 5.14 Create OrderController (customer-facing)
    - `index()`: returns `Inertia::render('Orders/Index', ['orders' => $user->orders()->latest()->get()])`; scoped to authenticated user only
    - `show(Order $order)`: authorizes that `$order->user_id === auth()->id()`; returns `Inertia::render('Orders/Show', ['order' => $order->load('items')])`
    - `store(StoreOrderRequest $request)`: delegates to `OrderService::createFromCart()`; redirects to `Inertia::render('Orders/Confirmation', ['order' => $order])`
    - Create `app/Http/Requests/StoreOrderRequest.php` validating `type` (in: dine-in,takeaway,delivery), `delivery_address` (required_if type=delivery), `table_number` (required_if type=dine-in), `notes` (nullable)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 5.15 Write property test for checkout summary reflects all cart items (Property 14)
    - **Property 14: Checkout summary reflects all cart items with correct totals**
    - **Validates: Requirements 6.1**
    - Tag with `#[Group('property')]`

  - [ ]* 5.16 Write property test for valid order creates pending order and clears cart (Property 15)
    - **Property 15: Valid order submission creates a pending order and clears the cart**
    - **Validates: Requirements 6.5**
    - Tag with `#[Group('property')]`

  - [ ]* 5.17 Write property test for customers only see their own orders (Property 16)
    - **Property 16: Customers only see their own orders**
    - **Validates: Requirements 6.7**
    - Tag with `#[Group('property')]`

  - [ ] 5.18 Create ReservationController (customer-facing)
    - `index()`: returns `Inertia::render('Reservations/Index', ['reservations' => $user->reservations()->latest()->get()])`
    - `create()`: returns `Inertia::render('Reservations/Create')`
    - `store(StoreReservationRequest $request)`: creates `Reservation` with status `pending` and unique `reservation_number`; dispatches `SendReservationConfirmationEmail` job; redirects to reservations index with success flash
    - `cancel(Reservation $reservation)`: authorizes ownership; validates status is `pending` or `confirmed` (422 otherwise); updates status to `cancelled`; dispatches `SendReservationStatusUpdateEmail` job; redirects back
    - Create `app/Http/Requests/StoreReservationRequest.php` validating `reserved_date` (date, after_or_equal: today), `reserved_time` (required, date_format: H:i), `party_size` (integer, min:1, max:20), `special_requests` (nullable string)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 5.19 Write property test for reservation date validation rejects past dates (Property 17)
    - **Property 17: Reservation date validation rejects past dates**
    - **Validates: Requirements 7.3**
    - Tag with `#[Group('property')]`

  - [ ]* 5.20 Write property test for reservation party size validation enforces bounds (Property 18)
    - **Property 18: Reservation party size validation enforces bounds**
    - **Validates: Requirements 7.4**
    - Tag with `#[Group('property')]`

  - [ ]* 5.21 Write property test for valid reservation creates pending reservation (Property 19)
    - **Property 19: Valid reservation submission creates a pending reservation**
    - **Validates: Requirements 7.5**
    - Tag with `#[Group('property')]`

  - [ ]* 5.22 Write property test for customers only see their own reservations (Property 20)
    - **Property 20: Customers only see their own reservations**
    - **Validates: Requirements 7.6**
    - Tag with `#[Group('property')]`

  - [ ]* 5.23 Write property test for cancelling pending/confirmed reservation sets cancelled (Property 21)
    - **Property 21: Cancelling a pending or confirmed reservation sets status to cancelled**
    - **Validates: Requirements 7.7**
    - Tag with `#[Group('property')]`

  - [ ] 5.24 Update ProfileController for full profile management
    - `edit()`: returns `Inertia::render('Profile/Edit', ['user' => $request->user()])`
    - `update(ProfileUpdateRequest $request)`: validates name and unique email (ignoring own); persists and redirects back with success flash
    - `updatePassword(Request $request)`: validates `current_password` (using `current_password` rule), `password` (confirmed, min 8); updates password; redirects back
    - `destroy(Request $request)`: validates password confirmation; soft-deletes user; invalidates session; redirects to home
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 5.25 Write property test for profile update persists valid name and email (Property 22)
    - **Property 22: Profile update persists valid name and email**
    - **Validates: Requirements 8.2**
    - Tag with `#[Group('property')]`


- [ ] 6. Backend controllers — admin features
  - [ ] 6.1 Create Admin\DashboardController
    - `index()`: queries today's order count, total revenue (sum of `total` for today's orders), pending order count, today's reservation count, pending reservation count, active menu item count, category count, 5 most recent orders (with user), and today's reservations (with user)
    - Returns `Inertia::render('Admin/Dashboard/Index', [...all stats...])`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 6.2 Write property test for dashboard recent orders never exceeds 5 items (Property 36)
    - **Property 36: Dashboard recent orders list never exceeds 5 items**
    - **Validates: Requirements 13.4**
    - Tag with `#[Group('property')]`

  - [ ]* 6.3 Write property test for dashboard today's reservations contains only today's (Property 37)
    - **Property 37: Dashboard today's reservations contains only today's reservations**
    - **Validates: Requirements 13.5**
    - Tag with `#[Group('property')]`

  - [ ] 6.4 Create Admin\CategoryController (resource)
    - `index()`: returns all categories with menu item count
    - `store(Request $request)`: validates `name` (required, unique), auto-generates `slug`; creates category; redirects back
    - `update(Request $request, Category $category)`: validates `name` (unique ignoring self); updates; redirects back
    - `destroy(Category $category)`: checks if category has any menu items; if yes, returns 422 with error message requiring reassignment; otherwise deletes; redirects back
    - _Requirements: 9.6, 9.7_

  - [ ]* 6.5 Write property test for category with items cannot be deleted (Property 27)
    - **Property 27: Category with items cannot be deleted**
    - **Validates: Requirements 9.7**
    - Tag with `#[Group('property')]`

  - [ ] 6.6 Create Admin\MenuItemController (resource) with image upload
    - `index()`: returns paginated menu items with category, ordered by category sort_order then item sort_order
    - `store(StoreMenuItemRequest $request)`: validates all fields; if image uploaded, stores to `menu-images` disk and dispatches `ProcessMenuItemImage` job; creates `MenuItem`; redirects to index
    - `update(UpdateMenuItemRequest $request, MenuItem $menuItem)`: validates fields; handles image replacement; updates record; redirects back
    - `destroy(MenuItem $menuItem)`: soft-deletes; redirects back
    - Create `StoreMenuItemRequest` and `UpdateMenuItemRequest` form requests validating `name`, `description`, `price` (numeric, min 0), `category_id` (exists), `is_available` (boolean), `image` (nullable, image, max 2048)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8_

  - [ ]* 6.7 Write property test for creating a menu item makes it visible on public menu (Property 23)
    - **Property 23: Creating a menu item makes it visible on the public menu**
    - **Validates: Requirements 9.2**
    - Tag with `#[Group('property')]`

  - [ ]* 6.8 Write property test for updating a menu item reflects changes on public menu (Property 24)
    - **Property 24: Updating a menu item reflects changes on the public menu**
    - **Validates: Requirements 9.3**
    - Tag with `#[Group('property')]`

  - [ ]* 6.9 Write property test for soft-deleting a menu item preserves order item references (Property 26)
    - **Property 26: Soft-deleting a menu item preserves order item references**
    - **Validates: Requirements 9.5**
    - Tag with `#[Group('property')]`

  - [ ] 6.10 Create Admin\OrderController
    - `index(Request $request)`: accepts optional `status` filter; returns paginated orders (latest first) with user; includes pending order count in props
    - `show(Order $order)`: returns order with items and user
    - `updateStatus(Request $request, Order $order)`: validates `status` (in: confirmed,preparing,ready,completed,cancelled); updates status; dispatches `SendOrderStatusUpdateEmail` job if status is `ready` or `cancelled`; dispatches `OrderStatusUpdated` broadcast event; redirects back
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 6.11 Write property test for admin order status filter returns only matching orders (Property 28)
    - **Property 28: Admin order status filter returns only matching orders**
    - **Validates: Requirements 10.2**
    - Tag with `#[Group('property')]`

  - [ ]* 6.12 Write property test for admin order status update persists new status (Property 29)
    - **Property 29: Admin order status update persists the new status**
    - **Validates: Requirements 10.3**
    - Tag with `#[Group('property')]`

  - [ ] 6.13 Create Admin\ReservationController
    - `index(Request $request)`: accepts optional `date` and `status` filters; returns paginated reservations with user; includes pending reservation count
    - `updateStatus(Request $request, Reservation $reservation)`: validates `status` (in: confirmed,cancelled,completed); updates status; dispatches `SendReservationStatusUpdateEmail` job if status is `confirmed` or `cancelled`; dispatches `ReservationStatusUpdated` broadcast event; redirects back
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 6.14 Write property test for admin reservation list includes all required fields (Property 30)
    - **Property 30: Admin reservation list includes all required fields**
    - **Validates: Requirements 11.1**
    - Tag with `#[Group('property')]`

  - [ ]* 6.15 Write property test for admin reservation filter returns only matching reservations (Property 31)
    - **Property 31: Admin reservation filter returns only matching reservations**
    - **Validates: Requirements 11.2**
    - Tag with `#[Group('property')]`

  - [ ] 6.16 Create Admin\UserController
    - `index(Request $request)`: accepts optional `search` query; returns paginated users (15 per page) with roles; excludes soft-deleted
    - `updateRole(Request $request, User $user)`: validates `role` (in: customer,admin); syncs role using `$user->syncRoles([$request->role])`; redirects back
    - `toggleActive(Request $request, User $user)`: prevents self-deactivation (422 if `$user->id === auth()->id()`); toggles `is_active`; redirects back
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 6.17 Write property test for user list pagination respects page size (Property 32)
    - **Property 32: User list pagination respects page size**
    - **Validates: Requirements 12.1**
    - Tag with `#[Group('property')]`

  - [ ]* 6.18 Write property test for user search returns only matching users (Property 33)
    - **Property 33: User search returns only matching users**
    - **Validates: Requirements 12.2**
    - Tag with `#[Group('property')]`

  - [ ]* 6.19 Write property test for role change is immediately enforced (Property 34)
    - **Property 34: Role change is immediately enforced**
    - **Validates: Requirements 12.3**
    - Tag with `#[Group('property')]`

  - [ ]* 6.20 Write property test for deactivated users cannot authenticate (Property 35)
    - **Property 35: Deactivated users cannot authenticate**
    - **Validates: Requirements 12.4**
    - Tag with `#[Group('property')]`

- [ ] 7. Checkpoint — backend feature tests
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 8. Events, jobs, notifications, and broadcasting
  - [ ] 8.1 Create broadcast events: OrderCreated, OrderStatusUpdated, ReservationStatusUpdated
    - Create `app/Events/OrderCreated.php`: implements `ShouldBroadcast`; broadcasts on `private-orders.{userId}` and `private-admin.orders` channels; payload includes order summary
    - Create `app/Events/OrderStatusUpdated.php`: implements `ShouldBroadcast`; broadcasts on `private-orders.{userId}` and `private-admin.orders`; payload includes `order_id` and new `status`
    - Create `app/Events/ReservationStatusUpdated.php`: implements `ShouldBroadcast`; broadcasts on `private-reservations.{userId}`; payload includes `reservation_id` and new `status`
    - Define channel authorization in `routes/channels.php` for `orders.{userId}` (own user only) and `admin.orders` (admin role only)
    - _Requirements: 10.3, 11.3, 11.4_

  - [ ] 8.2 Create queued email jobs and notification classes
    - Create `app/Jobs/SendOrderConfirmationEmail.php` (implements `ShouldQueue`, dispatched to `notifications` queue)
    - Create `app/Jobs/SendOrderStatusUpdateEmail.php`
    - Create `app/Jobs/SendReservationConfirmationEmail.php`
    - Create `app/Jobs/SendReservationStatusUpdateEmail.php`
    - Create `app/Notifications/OrderConfirmed.php`, `OrderStatusUpdated.php`, `ReservationConfirmed.php`, `ReservationStatusUpdated.php` — each extends `Notification` and implements `toMail()` with the template content described in the design
    - Each job's `handle()` calls `$model->user->notify(new CorrespondingNotification($model))`
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 8.3 Write property test for all email notifications dispatched as queued jobs (Property 38)
    - **Property 38: All email notifications are dispatched as queued jobs**
    - Use `Queue::fake()` to assert jobs are pushed to the `notifications` queue for each triggering event
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**
    - Tag with `#[Group('property')]`

  - [ ] 8.4 Create ProcessMenuItemImage queued job
    - Create `app/Jobs/ProcessMenuItemImage.php` (implements `ShouldQueue`, dispatched to `default` queue)
    - `handle()` uses GD or Imagick to resize the stored image to max 800×600 and re-save it in place
    - _Requirements: 9.8_

  - [ ] 8.5 Create the PropertyTest support trait
    - Create `tests/Support/PropertyTest.php` with the `forAll(callable $generator, callable $assertion, int $iterations = 100): void` method using Faker as described in the design's testing strategy
    - _Requirements: (testing infrastructure)_


- [ ] 9. Frontend — Inertia bootstrap, layouts, and shared UI components
  - [ ] 9.1 Update app.jsx with QueryClientProvider and Toaster
    - Wrap the Inertia app with `<QueryClientProvider client={queryClient}>` and render `<Toaster position="top-right" />` inside the setup function as shown in the design
    - _Requirements: 14.1_

  - [ ] 9.2 Update bootstrap.js with Laravel Echo + Reverb configuration
    - Import `laravel-echo` and `pusher-js`; configure `window.Echo` with `broadcaster: 'reverb'` and the `VITE_REVERB_*` env vars as shown in the design
    - _Requirements: 10.1_

  - [ ] 9.3 Create GuestLayout.jsx
    - Minimal header with restaurant logo/name, nav links to Menu (`/menu`), Login (`/login`), and Register (`/register`)
    - Renders `{children}` in a centered content area
    - Used by: Welcome, Menu/Index, Auth pages
    - _Requirements: 1.5, 14.1_

  - [ ] 9.4 Create CustomerLayout.jsx
    - Persistent nav bar with links: Menu, Cart (with badge from `usePage().props.cart.count`), My Orders, My Reservations, Profile
    - Displays authenticated user's name from `usePage().props.auth.user.name`
    - Includes logout button that submits a DELETE to `/logout` via Inertia
    - Renders flash toast notifications from `usePage().props.flash` using `react-hot-toast`
    - _Requirements: 14.2, 14.3_

  - [ ] 9.5 Create AdminLayout.jsx
    - Sidebar navigation with links: Dashboard, Menu Management, Orders (with pending badge), Reservations (with pending badge), User Management
    - Displays authenticated admin's name
    - Includes logout button
    - Renders flash toast notifications
    - _Requirements: 14.2, 14.4_

  - [ ] 9.6 Create shared UI components
    - Create `resources/js/Components/UI/` directory with reusable components: `Button.jsx` (variants: primary, secondary, danger), `InputField.jsx` (label + input + error), `Badge.jsx` (status color mapping), `Modal.jsx` (Headless UI Dialog wrapper), `Pagination.jsx` (Inertia-aware page links)
    - Create `resources/js/Components/Orders/OrderStatusBadge.jsx` mapping status strings to Tailwind color classes
    - _Requirements: 14.1_

- [ ] 10. Frontend — public pages (landing and menu)
  - [ ] 10.1 Create Welcome.jsx (landing page)
    - Uses `GuestLayout`
    - Hero section with restaurant name, tagline, and hero image/banner
    - Featured menu items grid using `MenuItemCard` component (name, description, price)
    - Restaurant info section: opening hours, address, contact
    - CTA buttons: "View Full Menu" → `/menu`, "Make a Reservation" → `/reservations/create`, "Login" / "Register"
    - Fully responsive with Tailwind (mobile-first)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 10.2 Create Menu/Index.jsx with category filter and search
    - Uses `GuestLayout` (accessible without auth)
    - Renders `CategoryFilter.jsx` component (list of category buttons, highlights active)
    - Renders `SearchInput.jsx` component (controlled input, debounced, updates URL query param via Inertia router)
    - Renders `MenuItemCard.jsx` for each item: name, description, price, image (if present), availability indicator; "Add to Cart" button disabled and visually muted when `is_available = false`
    - Category filter and search update URL params and trigger Inertia visits (preserving scroll)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 11. Frontend — cart and checkout
  - [ ] 11.1 Create CartDrawer.jsx and CartItem.jsx components
    - `CartDrawer.jsx`: Headless UI `Dialog` slide-over panel; fetches cart contents via TanStack Query when opened; renders list of `CartItem` components; shows subtotal and "Proceed to Checkout" button linking to `/cart`
    - `CartItem.jsx`: displays item name, price, quantity controls (increment/decrement via Inertia PATCH), remove button (Inertia DELETE), customization notes
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 11.2 Create Cart/Index.jsx (checkout page)
    - Uses `CustomerLayout`
    - Displays order summary: all cart items with quantities, individual prices, subtotal
    - Order type selector (radio: dine-in, takeaway, delivery) using React Hook Form + Zod
    - Conditional fields: delivery address (required when delivery), table number (required when dine-in)
    - "Place Order" button submits via Inertia POST to `/orders`
    - Empty cart state with link back to menu
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 11.3 Create Orders/Confirmation.jsx
    - Uses `CustomerLayout`
    - Displays order reference number, list of ordered items, total, and estimated preparation time
    - Links to order history
    - _Requirements: 6.6_

- [ ] 12. Frontend — customer orders and reservations
  - [ ] 12.1 Create Orders/Index.jsx and Orders/Show.jsx
    - `Index.jsx`: uses `CustomerLayout`; lists all customer orders with `OrderStatusBadge`, total, date, and link to detail; empty state message
    - `Show.jsx`: uses `CustomerLayout`; displays full order detail — all items, quantities, customization notes, delivery address or table number, status badge, timestamps
    - _Requirements: 6.7, 6.8_

  - [ ] 12.2 Create Reservations/Create.jsx and Reservations/Index.jsx
    - `Create.jsx`: uses `CustomerLayout`; React Hook Form + Zod form with date picker, time input, party size (number), special requests (textarea); client-side validation mirrors server rules (date not in past, party size 1–20); submits via Inertia POST
    - `Index.jsx`: uses `CustomerLayout`; lists upcoming and past reservations with status badge, date/time, party size; cancel button (Inertia PATCH) for pending/confirmed reservations; disabled cancel for completed/cancelled
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8_

- [ ] 13. Frontend — profile management
  - [ ] 13.1 Create Profile/Edit.jsx
    - Uses `CustomerLayout`
    - Three sections: (1) Update name/email form (React Hook Form + Zod, Inertia PATCH), (2) Change password form (current password, new password, confirm — Inertia PUT), (3) Delete account section with confirmation modal (Inertia DELETE)
    - Inline validation errors from Inertia `errors` prop
    - Success flash via `react-hot-toast`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_


- [ ] 14. Frontend — admin dashboard and management pages
  - [ ] 14.1 Create Admin/Dashboard/Index.jsx
    - Uses `AdminLayout`
    - Stats cards row: today's orders, today's revenue, pending orders, today's reservations, pending reservations, active menu items, categories — using `StatsCard.jsx` component
    - Recent orders table using `RecentOrdersTable.jsx` (order number, customer, type, total, status badge)
    - Today's reservations list (customer, time, party size, status badge)
    - Revenue chart using Recharts (e.g., bar chart of orders per hour today)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ] 14.2 Create Admin/Menu/Index.jsx, Create.jsx, and Edit.jsx
    - `Index.jsx`: uses `AdminLayout`; table of all menu items with category, price, availability toggle (Inertia PATCH), edit link, delete button (with confirmation modal); "Add Item" button
    - `Create.jsx`: uses `AdminLayout`; React Hook Form + Zod form for name, description, price, category (select), is_available (checkbox), image upload; submits via Inertia POST with `forceFormData: true`
    - `Edit.jsx`: pre-populated form; submits via Inertia POST with `_method: PUT` and `forceFormData: true`; shows existing image preview
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8_

  - [ ] 14.3 Create Admin/Categories/Index.jsx
    - Uses `AdminLayout`
    - Table of categories with item count, sort order, rename inline or via modal, delete button (disabled/warning if items exist)
    - "Add Category" form (inline or modal)
    - _Requirements: 9.6, 9.7_

  - [ ] 14.4 Create Admin/Orders/Index.jsx and Show.jsx with real-time updates
    - `Index.jsx`: uses `AdminLayout`; status filter tabs (all, pending, confirmed, preparing, ready, completed, cancelled); orders table with customer name, type, total, status badge, created time; pending order count badge in header
    - Subscribe to `private-admin.orders` Echo channel; on `OrderCreated` and `OrderStatusUpdated` events, call `queryClient.invalidateQueries(['admin', 'orders'])` and show toast notification
    - TanStack Query polls every 30s as WebSocket fallback
    - `Show.jsx`: full order detail with all items, customization notes, delivery/table info; `OrderStatusSelect.jsx` dropdown to update status (Inertia PATCH)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 14.5 Create Admin/Reservations/Index.jsx
    - Uses `AdminLayout`
    - Date filter (date input) and status filter (select); reservations table with customer name, date, time, party size, special requests, status badge; action buttons to confirm/cancel/complete (Inertia PATCH); pending count badge
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ] 14.6 Create Admin/Users/Index.jsx
    - Uses `AdminLayout`
    - Search input (Inertia visit with `search` query param); paginated users table with name, email, role badge, registration date, active status; role change select (Inertia PATCH); activate/deactivate toggle (Inertia PATCH, disabled for own account)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 15. Frontend — auth pages and error pages
  - [ ] 15.1 Update Login.jsx and Register.jsx for role-aware behavior
    - `Login.jsx`: update to use React Hook Form + Zod; after successful login the server redirect handles role routing (no frontend change needed beyond form UX)
    - `Register.jsx`: update form to use React Hook Form + Zod; remove any Breeze-default redirect assumptions
    - Both pages use `GuestLayout`
    - _Requirements: 2.1, 2.4, 2.5, 2.6_

  - [ ] 15.2 Create error pages (404, 403, 500) within the SPA layout
    - Create `resources/js/Pages/Error.jsx` that renders within `GuestLayout` (or the appropriate layout based on auth state); displays the HTTP status code and a friendly message; includes a "Go Home" link
    - Configure Inertia's error handling in `app.jsx` to render this component for 404, 403, and 500 responses
    - _Requirements: 14.6_

- [ ] 16. Checkpoint — full integration test
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints (tasks 4, 7, 16) ensure incremental validation before proceeding
- Property tests use the custom `PropertyTest` trait in `tests/Support/PropertyTest.php` and are tagged `#[Group('property')]` for selective execution via `php artisan test --group=property`
- Unit tests focus on CartService and OrderService isolation; property tests handle broad input coverage
- Integration tests use `Queue::fake()`, `Mail::fake()`, `Storage::fake()`, and `Event::fake()`
- The `tests/Feature/Rbac/AccessControlTest.php` file covers Properties 3, 4, and 5 together
- Frontend testing is validated through Inertia prop contracts in feature tests; React component UI is validated manually
- Run `php artisan storage:link` once after setup to serve uploaded menu images
- Configure `phpunit.xml` with `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`, `SESSION_DRIVER=array` for fast test runs

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.6", "8.5"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4", "1.5", "2.1"] },
    { "id": 4, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 5, "tasks": ["3.1", "3.2", "3.3", "5.1", "5.3", "5.8", "5.14", "5.18", "5.24", "6.1", "6.4", "6.6", "6.10", "6.13", "6.16"] },
    { "id": 6, "tasks": ["3.4", "3.5", "3.6", "3.7", "5.2", "5.4", "5.5", "5.6", "5.7", "5.9", "5.10", "5.11", "5.12", "5.13", "5.15", "5.16", "5.17", "5.19", "5.20", "5.21", "5.22", "5.23", "5.25", "6.2", "6.3", "6.5", "6.7", "6.8", "6.9", "6.11", "6.12", "6.14", "6.15", "6.17", "6.18", "6.19", "6.20", "8.1", "8.2", "8.4"] },
    { "id": 7, "tasks": ["8.3", "9.1", "9.2"] },
    { "id": 8, "tasks": ["9.3", "9.4", "9.5", "9.6"] },
    { "id": 9, "tasks": ["10.1", "10.2", "11.1", "11.2", "12.1", "12.2", "13.1", "14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "15.1", "15.2"] }
  ]
}
```
