# Design Document — Restaurant Web Application

## Overview

The restaurant web application is a full-stack SPA built on **Laravel 12** (backend) + **React 19** (frontend) bridged by **Inertia.js v2**. There are no separate REST API endpoints consumed by the frontend; instead, Inertia renders server-side controller responses directly as React page components, sharing typed props through the Inertia protocol.

Three distinct audiences share a single codebase:

| Audience | Role | Access scope |
|---|---|---|
| Guest | — (unauthenticated) | Public routes only |
| Customer | `customer` | Public + customer-scoped routes |
| Admin | `admin` | All routes including admin dashboard |

Role enforcement is handled server-side by **Spatie Laravel Permission v6** middleware and gate checks. The React frontend receives the authenticated user's role via Inertia shared props and conditionally renders navigation and UI elements accordingly.

Real-time features (live order updates on the admin dashboard) are delivered via **Laravel Reverb** WebSocket broadcasting. All outbound emails are queued through **Laravel's job queue** backed by **Redis** (Predis).

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                           │
│  React 19 + Inertia.js v2 + TailwindCSS + Framer Motion        │
│  React Hook Form + Zod │ TanStack Query │ Recharts │ Lucide     │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP (Inertia XHR) + WebSocket
┌────────────────────────▼────────────────────────────────────────┐
│                     Laravel 12 Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Web Routes  │  │  Middleware  │  │  Inertia Middleware   │  │
│  │  (routes/    │  │  (auth,role, │  │  (shared props,       │  │
│  │   web.php)   │  │   throttle)  │  │   asset versioning)   │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘  │
│         │                                                        │
│  ┌──────▼───────────────────────────────────────────────────┐   │
│  │                     Controllers                           │   │
│  │  Auth │ Menu │ Cart │ Order │ Reservation │ Admin │ ...  │   │
│  └──────┬───────────────────────────────────────────────────┘   │
│         │                                                        │
│  ┌──────▼──────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │     Models      │  │   Services   │  │  Jobs/Events/       │ │
│  │  (Eloquent ORM) │  │  (CartSvc,   │  │  Notifications      │ │
│  │                 │  │   OrderSvc)  │  │  (queued via Redis) │ │
│  └──────┬──────────┘  └──────────────┘  └────────────────────┘ │
│         │                                                        │
│  ┌──────▼──────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │    MySQL DB     │  │  Redis Cache │  │  Laravel Reverb    │ │
│  │  (primary data) │  │  (sessions,  │  │  (WebSocket server)│ │
│  │                 │  │   queues,    │  │                    │ │
│  │                 │  │   cart)      │  │                    │ │
│  └─────────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Decisions

- **Inertia.js** eliminates the need for a separate API layer. Controllers return `Inertia::render()` responses with typed props; the React frontend receives them as component props.
- **Cart storage**: Redis hash keyed by `cart:{user_id}` for O(1) reads/writes and automatic TTL management. Falls back to database-backed sessions if Redis is unavailable.
- **Real-time**: Laravel Reverb (native WebSocket server) broadcasts `OrderCreated`, `OrderStatusUpdated`, and `ReservationStatusUpdated` events on private channels. The React frontend subscribes via Laravel Echo.
- **File uploads**: Menu item images are stored in `storage/app/public/menu-images/` via Laravel's `Storage` facade and served through a symbolic link. Images are processed (resized/optimized) via a queued job.
- **RBAC**: Spatie Permission's `role` middleware guards route groups. Gate checks inside controllers handle fine-grained authorization.

---

## Components and Interfaces

### Backend — Controller Map

```
app/Http/Controllers/
├── Auth/                          (Breeze-generated, extended)
│   ├── AuthenticatedSessionController.php
│   ├── RegisteredUserController.php
│   ├── PasswordResetLinkController.php
│   ├── NewPasswordController.php
│   └── VerifyEmailController.php
├── LandingController.php          GET /
├── MenuController.php             GET /menu
├── CartController.php             GET|POST|PATCH|DELETE /cart
├── OrderController.php            GET|POST /orders, GET /orders/{order}
├── ReservationController.php      GET|POST /reservations, PATCH|DELETE /reservations/{reservation}
├── ProfileController.php          GET|PATCH|DELETE /profile
└── Admin/
    ├── DashboardController.php    GET /admin/dashboard
    ├── MenuItemController.php     CRUD /admin/menu-items
    ├── CategoryController.php     CRUD /admin/categories
    ├── OrderController.php        GET|PATCH /admin/orders, GET /admin/orders/{order}
    ├── ReservationController.php  GET|PATCH /admin/reservations
    └── UserController.php         GET|PATCH /admin/users
```

### Frontend — Page Component Map

```
resources/js/
├── app.jsx                        Inertia bootstrap
├── bootstrap.js                   Axios + Echo setup
├── Layouts/
│   ├── GuestLayout.jsx            Public pages (landing, menu, auth)
│   ├── CustomerLayout.jsx         Authenticated customer pages
│   └── AdminLayout.jsx            Admin dashboard pages
├── Pages/
│   ├── Welcome.jsx                Landing page (/)
│   ├── Menu/
│   │   └── Index.jsx              Public menu (/menu)
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── Cart/
│   │   └── Index.jsx              Cart + checkout (/cart)
│   ├── Orders/
│   │   ├── Index.jsx              Order history (/orders)
│   │   ├── Show.jsx               Order detail (/orders/{id})
│   │   └── Confirmation.jsx       Post-checkout confirmation
│   ├── Reservations/
│   │   ├── Index.jsx              Customer reservations (/reservations)
│   │   └── Create.jsx             Booking form (/reservations/create)
│   ├── Profile/
│   │   └── Edit.jsx               Profile management (/profile)
│   └── Admin/
│       ├── Dashboard/
│       │   └── Index.jsx          Admin overview (/admin/dashboard)
│       ├── Menu/
│       │   ├── Index.jsx          Menu item list (/admin/menu-items)
│       │   ├── Create.jsx
│       │   └── Edit.jsx
│       ├── Categories/
│       │   └── Index.jsx          Category management (/admin/categories)
│       ├── Orders/
│       │   ├── Index.jsx          Order management (/admin/orders)
│       │   └── Show.jsx
│       ├── Reservations/
│       │   └── Index.jsx          Reservation management (/admin/reservations)
│       └── Users/
│           └── Index.jsx          User management (/admin/users)
└── Components/
    ├── UI/                        Headless UI wrappers, buttons, inputs
    ├── Menu/
    │   ├── MenuItemCard.jsx
    │   ├── CategoryFilter.jsx
    │   └── SearchInput.jsx
    ├── Cart/
    │   ├── CartDrawer.jsx         Slide-over cart panel
    │   ├── CartItem.jsx
    │   └── CartSummary.jsx
    ├── Orders/
    │   ├── OrderStatusBadge.jsx
    │   └── OrderCard.jsx
    ├── Reservations/
    │   └── ReservationCard.jsx
    └── Admin/
        ├── StatsCard.jsx
        ├── RecentOrdersTable.jsx
        └── OrderStatusSelect.jsx
```

### Inertia Shared Props

The `HandleInertiaRequests` middleware shares the following props on every request:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id'    => $request->user()->id,
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
                'roles' => $request->user()->getRoleNames(),
            ] : null,
        ],
        'cart' => [
            'count' => $request->user()
                ? app(CartService::class)->count($request->user())
                : 0,
        ],
        'flash' => [
            'success' => $request->session()->get('success'),
            'error'   => $request->session()->get('error'),
        ],
    ];
}
```

---

## Data Models

### Entity Relationship Diagram

```
users
  id, name, email, phone, password, is_active, email_verified_at,
  remember_token, deleted_at, timestamps

  ├── has many → orders
  ├── has many → reservations
  ├── has one  → cart (Redis, not DB)
  └── belongs to many → roles (via Spatie)

categories
  id, name, slug, sort_order, timestamps

  └── has many → menu_items

menu_items
  id, category_id (FK), name, slug, description, price (decimal 8,2),
  image_path, is_available (bool), sort_order, deleted_at, timestamps

  ├── belongs to → categories
  └── has many  → order_items

orders
  id, user_id (FK), order_number (unique), type (enum: dine-in|takeaway|delivery),
  status (enum: pending|confirmed|preparing|ready|completed|cancelled),
  delivery_address (nullable text), table_number (nullable string),
  subtotal (decimal 8,2), total (decimal 8,2), notes (nullable text),
  deleted_at, timestamps

  ├── belongs to → users
  └── has many  → order_items

order_items
  id, order_id (FK), menu_item_id (FK nullable — soft-delete safe),
  menu_item_name (string — snapshot), menu_item_price (decimal 8,2 — snapshot),
  quantity (unsigned int), customization_notes (nullable text), timestamps

  ├── belongs to → orders
  └── belongs to → menu_items (nullable)

reservations
  id, user_id (FK), reservation_number (unique),
  reserved_date (date), reserved_time (time),
  party_size (unsigned tinyint), status (enum: pending|confirmed|cancelled|completed),
  special_requests (nullable text), timestamps

  └── belongs to → users
```

### Migration Files

```
database/migrations/
├── 0001_01_01_000000_create_users_table.php          (existing — add is_active, deleted_at)
├── 0001_01_01_000001_create_cache_table.php          (existing)
├── 0001_01_01_000002_create_jobs_table.php           (existing)
├── 2024_01_01_000001_create_permission_tables.php    (Spatie — published)
├── 2024_01_01_000002_create_categories_table.php
├── 2024_01_01_000003_create_menu_items_table.php
├── 2024_01_01_000004_create_orders_table.php
├── 2024_01_01_000005_create_order_items_table.php
└── 2024_01_01_000006_create_reservations_table.php
```

### Model Definitions

**User** (`app/Models/User.php`)
```php
use HasFactory, Notifiable, HasRoles, SoftDeletes;

protected $fillable = ['name', 'email', 'phone', 'password', 'is_active'];
protected $hidden   = ['password', 'remember_token'];
protected $casts    = ['is_active' => 'boolean', 'email_verified_at' => 'datetime', 'password' => 'hashed'];

public function orders(): HasMany { ... }
public function reservations(): HasMany { ... }
```

**Category** (`app/Models/Category.php`)
```php
use HasFactory;

protected $fillable = ['name', 'slug', 'sort_order'];

public function menuItems(): HasMany { ... }
```

**MenuItem** (`app/Models/MenuItem.php`)
```php
use HasFactory, SoftDeletes;

protected $fillable = ['category_id', 'name', 'slug', 'description', 'price', 'image_path', 'is_available', 'sort_order'];
protected $casts    = ['price' => 'decimal:2', 'is_available' => 'boolean'];

public function category(): BelongsTo { ... }
public function orderItems(): HasMany { ... }
public function getImageUrlAttribute(): ?string { ... }  // Storage::url()
```

**Order** (`app/Models/Order.php`)
```php
use HasFactory, SoftDeletes;

protected $fillable = ['user_id', 'order_number', 'type', 'status', 'delivery_address', 'table_number', 'subtotal', 'total', 'notes'];
protected $casts    = ['subtotal' => 'decimal:2', 'total' => 'decimal:2'];

public function user(): BelongsTo { ... }
public function items(): HasMany { ... }  // → OrderItem
```

**OrderItem** (`app/Models/OrderItem.php`)
```php
use HasFactory;

protected $fillable = ['order_id', 'menu_item_id', 'menu_item_name', 'menu_item_price', 'quantity', 'customization_notes'];
protected $casts    = ['menu_item_price' => 'decimal:2'];

public function order(): BelongsTo { ... }
public function menuItem(): BelongsTo { ... }  // nullable
```

**Reservation** (`app/Models/Reservation.php`)
```php
use HasFactory;

protected $fillable = ['user_id', 'reservation_number', 'reserved_date', 'reserved_time', 'party_size', 'status', 'special_requests'];
protected $casts    = ['reserved_date' => 'date', 'reserved_time' => 'datetime:H:i'];

public function user(): BelongsTo { ... }
```

---

## Backend Architecture

### Route Structure (`routes/web.php`)

```php
// Public routes
Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');

// Auth routes (Breeze)
require __DIR__.'/auth.php';

// Customer routes
Route::middleware(['auth', 'verified', 'role:customer|admin'])->group(function () {
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{menuItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{menuItem}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/create', [ReservationController::class, 'create'])->name('reservations.create');
    Route::post('/reservations', [ReservationController::class, 'store'])->name('reservations.store');
    Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel'])->name('reservations.cancel');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [Admin\DashboardController::class, 'index'])->name('dashboard');

        Route::resource('menu-items', Admin\MenuItemController::class);
        Route::resource('categories', Admin\CategoryController::class);

        Route::get('/orders', [Admin\OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [Admin\OrderController::class, 'show'])->name('orders.show');
        Route::patch('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->name('orders.status');

        Route::get('/reservations', [Admin\ReservationController::class, 'index'])->name('reservations.index');
        Route::patch('/reservations/{reservation}/status', [Admin\ReservationController::class, 'updateStatus'])->name('reservations.status');

        Route::get('/users', [Admin\UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [Admin\UserController::class, 'updateRole'])->name('users.role');
        Route::patch('/users/{user}/toggle-active', [Admin\UserController::class, 'toggleActive'])->name('users.toggle-active');
    });
```

### RBAC Design (Spatie Laravel Permission)

**Roles and Permissions:**

```php
// Seeded via RolesAndPermissionsSeeder
$permissions = [
    // Menu
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    // Orders
    'orders.view-own', 'orders.view-all', 'orders.update-status',
    // Reservations
    'reservations.view-own', 'reservations.view-all', 'reservations.update-status',
    // Users
    'users.view', 'users.manage',
    // Cart
    'cart.manage',
];

$customerRole = Role::create(['name' => 'customer']);
$customerRole->givePermissionTo([
    'menu.view', 'orders.view-own', 'reservations.view-own', 'cart.manage',
]);

$adminRole = Role::create(['name' => 'admin']);
$adminRole->givePermissionTo(Permission::all());
```

**Middleware registration** (`bootstrap/app.php`):
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role'       => \Spatie\LaravelPermission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\LaravelPermission\Middleware\PermissionMiddleware::class,
    ]);
})
```

**Registration flow** (`RegisteredUserController`):
```php
$user = User::create([...]);
$user->assignRole('customer');
Auth::login($user);
return redirect(route('orders.index'));
```

### Cart Service (`app/Services/CartService.php`)

The cart is stored in Redis as a hash: `cart:{user_id}` → `{menu_item_id}` → JSON-encoded `{id, name, price, quantity, notes}`.

```php
class CartService
{
    public function __construct(private Redis $redis) {}

    public function get(User $user): array { ... }
    public function add(User $user, MenuItem $item, int $qty, ?string $notes): void { ... }
    public function update(User $user, MenuItem $item, int $qty): void { ... }
    public function remove(User $user, MenuItem $item): void { ... }
    public function clear(User $user): void { ... }
    public function count(User $user): int { ... }
    public function subtotal(User $user): float { ... }
    private function key(User $user): string { return "cart:{$user->id}"; }
}
```

Key behaviors:
- `add()`: If item already exists in hash, increment quantity; otherwise set new entry.
- `update()` with qty=0: calls `remove()`.
- `subtotal()`: Iterates hash values, sums `price * quantity`.
- Cart TTL: 7 days, refreshed on each write.

### Order Service (`app/Services/OrderService.php`)

```php
class OrderService
{
    public function createFromCart(User $user, array $validated): Order
    {
        return DB::transaction(function () use ($user, $validated) {
            $cartItems = $this->cartService->get($user);
            // Validate all items still available
            // Create Order record
            // Create OrderItem records (snapshot name + price)
            // Clear cart
            // Dispatch OrderCreated event + SendOrderConfirmationEmail job
            return $order;
        });
    }
}
```

### Events and Broadcasting

```
app/Events/
├── OrderCreated.php           → private channel: orders.{userId}
├── OrderStatusUpdated.php     → private channel: orders.{userId}
│                                 + presence channel: admin.orders
└── ReservationStatusUpdated.php → private channel: reservations.{userId}
```

**Channel definitions** (`routes/channels.php`):
```php
Broadcast::channel('orders.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});

Broadcast::channel('admin.orders', function (User $user) {
    return $user->hasRole('admin');
});
```

**Admin dashboard real-time** (`Admin/Orders/Index.jsx`):
```js
useEffect(() => {
    const channel = window.Echo.private('admin.orders');
    channel.listen('OrderCreated', (e) => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        toast.success(`New order #${e.order.order_number}`);
    });
    channel.listen('OrderStatusUpdated', (e) => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    });
    return () => window.Echo.leave('admin.orders');
}, []);
```

### Jobs and Notifications

```
app/Jobs/
├── SendOrderConfirmationEmail.php
├── SendOrderStatusUpdateEmail.php
├── SendReservationConfirmationEmail.php
├── SendReservationStatusUpdateEmail.php
└── ProcessMenuItemImage.php

app/Notifications/
├── OrderConfirmed.php
├── OrderStatusUpdated.php
├── ReservationConfirmed.php
└── ReservationStatusUpdated.php
```

All email jobs implement `ShouldQueue` and are dispatched to the `notifications` queue:
```php
dispatch(new SendOrderConfirmationEmail($order))->onQueue('notifications');
```

### File Upload Handling

Menu item images are handled in `Admin\MenuItemController`:

```php
public function store(StoreMenuItemRequest $request): RedirectResponse
{
    $data = $request->validated();
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('menu-images', 'public');
        $data['image_path'] = $path;
        ProcessMenuItemImage::dispatch($path)->onQueue('default');
    }
    MenuItem::create($data);
    return redirect()->route('admin.menu-items.index');
}
```

`ProcessMenuItemImage` job uses GD/Imagick to resize to max 800×600 and optimize. The `image_url` accessor on `MenuItem` returns `Storage::url($this->image_path)`.

Storage configuration: `FILESYSTEM_DISK=public`, symlink via `php artisan storage:link`.

---

## Frontend Architecture

### Inertia Bootstrap (`resources/js/app.jsx`)

```jsx
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <QueryClientProvider client={queryClient}>
                <App {...props} />
                <Toaster position="top-right" />
            </QueryClientProvider>
        );
    },
});
```

### Echo Bootstrap (`resources/js/bootstrap.js`)

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

### Layout Strategy

Each layout wraps its children with the appropriate navigation bar and provides the page shell:

- **GuestLayout**: Minimal header with logo, nav links (Menu, Login, Register). Used by landing page, menu, and auth pages.
- **CustomerLayout**: Full navigation bar with customer links (Menu, Cart with badge, My Orders, My Reservations, Profile). Uses `usePage().props.auth.user` and `usePage().props.cart.count`.
- **AdminLayout**: Sidebar navigation with admin links. Displays pending order/reservation badges from shared props.

### Form Handling Pattern

All forms use **React Hook Form** + **Zod** for client-side validation, with Inertia's `useForm` for server submission:

```jsx
// Example: ReservationCreate.jsx
const schema = z.object({
    reserved_date: z.string().min(1),
    reserved_time: z.string().min(1),
    party_size: z.number().int().min(1).max(20),
    special_requests: z.string().optional(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
});

const { post, processing } = useForm();

const onSubmit = (data) => post(route('reservations.store'), data);
```

### Data Fetching Strategy

- **Inertia props**: Primary data source for initial page load (SSR-compatible, no waterfall).
- **TanStack Query**: Used for data that needs to be refreshed without a full Inertia visit — specifically the admin orders list (polled every 30s as fallback to WebSocket) and cart state.
- **Inertia router**: Used for all mutations (form submissions, status updates) to keep server state authoritative.

### Cart UI

The cart is accessible from any page via a `CartDrawer` slide-over component (Headless UI `Dialog`). The cart item count in the nav badge comes from `usePage().props.cart.count` (shared prop, updated on every Inertia response). Full cart contents are fetched via TanStack Query when the drawer opens.

---

## Real-Time Features

### Laravel Reverb Configuration

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=restaurant-app
REVERB_APP_KEY=your-key
REVERB_APP_SECRET=your-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

### Broadcast Events

| Event | Channel | Payload | Trigger |
|---|---|---|---|
| `OrderCreated` | `private-orders.{userId}`, `private-admin.orders` | order summary | Order::created |
| `OrderStatusUpdated` | `private-orders.{userId}`, `private-admin.orders` | order_id, new status | Admin status update |
| `ReservationStatusUpdated` | `private-reservations.{userId}` | reservation_id, new status | Admin status update |

### Admin Dashboard Real-Time

The admin orders page subscribes to `private-admin.orders` and uses TanStack Query's `invalidateQueries` to refresh the orders list when events arrive. A pending order count badge in the sidebar is updated via the same mechanism.

---

## Email Notification System

### Notification Templates

| Notification | Trigger | Template |
|---|---|---|
| `OrderConfirmed` | Order created | Order reference, items, total, estimated time |
| `OrderStatusUpdated` | Status → `ready` or `cancelled` | Order reference, new status |
| `ReservationConfirmed` | Reservation created | Date, time, party size, reference |
| `ReservationStatusUpdated` | Status → `confirmed` or `cancelled` | Reservation reference, new status |

All notifications extend `Mailable` and are dispatched as queued jobs:

```php
// app/Jobs/SendOrderConfirmationEmail.php
class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function handle(): void
    {
        $this->order->user->notify(new OrderConfirmed($this->order));
    }
}
```

Queue configuration: `QUEUE_CONNECTION=redis`, queue worker processes `notifications` queue with `--tries=3 --backoff=60`.

---

## Error Handling

### HTTP Error Responses

- **401 Unauthenticated**: Inertia middleware redirects to `/login`.
- **403 Forbidden**: Custom Inertia error page rendered within the SPA layout.
- **404 Not Found**: Custom Inertia error page.
- **422 Unprocessable Entity**: Inertia automatically passes validation errors back to the page component as `errors` prop.
- **500 Server Error**: Custom error page; errors logged to Laravel's log channel.

### Frontend Error Handling

- Form validation errors: Displayed inline via `InputError` components using Inertia's `errors` prop.
- Toast notifications: `react-hot-toast` displays success/error flash messages from Inertia shared `flash` prop.
- Network errors: Inertia's global event listeners catch failed requests and display a toast.

### Business Rule Validation

- **Cart**: Adding an unavailable item returns a 422 with a descriptive error message.
- **Reservation date**: Past dates return a 422 validation error on the `reserved_date` field.
- **Order cancellation**: Attempting to cancel a completed/cancelled reservation returns a 422.
- **Category deletion with items**: Returns a 422 requiring reassignment.
- **Self-deactivation**: Admin attempting to deactivate their own account returns a 422.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The following properties are derived from the acceptance criteria prework analysis. Properties are written for PHPUnit 11 with a custom property-based testing helper (see Testing Strategy). Each property is universally quantified and references the requirement it validates.

**Property Reflection:** After reviewing all testable criteria, the following consolidations were made:
- Requirements 3.2 and 3.4 both test that customers cannot access admin routes — consolidated into Property 3.
- Requirements 5.1 and 5.7 both test cart persistence across requests — consolidated into Property 6.
- Requirements 4.2 and 4.3 both test menu item data completeness — kept separate as they test different aspects (grouping vs. field presence).
- Requirements 6.7 and 12.1 both test data scoping/pagination — kept separate as they test different resources.

---

### Property 1: Featured menu items contain required fields

*For any* set of active menu items in the database, the landing page Inertia response props should contain featured items each having `name`, `description`, and `price` fields with non-null values.

**Validates: Requirements 1.3**

---

### Property 2: Registration assigns exactly the customer role

*For any* valid registration payload (unique name, unique email, valid password), submitting the registration form should create a user record that has exactly one role assigned, and that role must be `customer`.

**Validates: Requirements 2.2, 3.1**

---

### Property 3: Unauthenticated requests to protected routes redirect to login

*For any* route in the customer or admin route groups, an HTTP request made without an authenticated session should receive a redirect response to the login page (HTTP 302 → `/login`).

**Validates: Requirements 2.9**

---

### Property 4: Customer role cannot access admin routes

*For any* admin route, an HTTP request made by an authenticated user with the `customer` role should receive a 403 Forbidden response.

**Validates: Requirements 3.2, 3.4**

---

### Property 5: Inertia shared props always include authenticated user's role

*For any* authenticated user making any Inertia request, the shared `auth.user.roles` prop in the response should be a non-empty array containing the user's assigned role name.

**Validates: Requirements 3.5**

---

### Property 6: Menu page groups all active items by category

*For any* collection of active menu items distributed across categories, the menu page Inertia response should contain all active items, and each item should appear under its correct category grouping. Inactive (soft-deleted) items should not appear.

**Validates: Requirements 4.2**

---

### Property 7: Menu items in response contain all required fields

*For any* active menu item in the database, the menu page response should include that item with `name`, `description`, `price`, and `is_available` fields present and non-null.

**Validates: Requirements 4.3**

---

### Property 8: Category filter returns only items from that category

*For any* category and any set of menu items, applying a category filter to the menu page should return only items whose `category_id` matches the selected category. Items from other categories must not appear.

**Validates: Requirements 4.5**

---

### Property 9: Menu search returns only matching items

*For any* non-empty search term, all menu items returned by the search should have the search term present (case-insensitive) in either their `name` or `description`. Items that do not match should not appear.

**Validates: Requirements 4.6**

---

### Property 10: Cart persists across requests within the same session

*For any* authenticated customer and any cart state (items added), making a subsequent request in the same session should return the same cart contents with unchanged quantities and item data.

**Validates: Requirements 5.1, 5.7**

---

### Property 11: Adding an item to the cart stores all provided data

*For any* available menu item, quantity, and optional customization notes, adding the item to the cart should result in the cart containing an entry for that item with the exact quantity and notes provided.

**Validates: Requirements 5.2**

---

### Property 12: Adding a duplicate cart item increments quantity

*For any* menu item already present in the cart with quantity Q, adding the same item with quantity N should result in the cart containing that item with quantity Q + N, not two separate entries.

**Validates: Requirements 5.3**

---

### Property 13: Cart subtotal equals sum of price times quantity

*For any* collection of cart items with associated prices and quantities, the computed cart subtotal should equal the mathematical sum of (price × quantity) for all items, accurate to two decimal places.

**Validates: Requirements 5.5**

---

### Property 14: Checkout summary reflects all cart items with correct totals

*For any* cart contents, the checkout page Inertia props should include all cart items with their quantities, individual prices, and a total that equals the sum of all (price × quantity) values.

**Validates: Requirements 6.1**

---

### Property 15: Valid order submission creates a pending order and clears the cart

*For any* authenticated customer with a non-empty cart and a valid order payload (type, required address/table for the type), submitting the order should: (1) create an Order record with `status = pending` associated with the customer, (2) create OrderItem records snapshotting the item name and price, and (3) result in an empty cart for that customer.

**Validates: Requirements 6.5**

---

### Property 16: Customers only see their own orders

*For any* authenticated customer, the orders index response should contain only orders whose `user_id` matches the authenticated customer's ID. Orders belonging to other customers must not appear.

**Validates: Requirements 6.7**

---

### Property 17: Reservation date validation rejects past dates

*For any* date that is strictly before today's date, submitting a reservation request with that date should return a 422 validation error on the `reserved_date` field.

**Validates: Requirements 7.3**

---

### Property 18: Reservation party size validation enforces bounds

*For any* party size value less than 1 or greater than the configured maximum (default: 20), submitting a reservation request with that party size should return a 422 validation error on the `party_size` field.

**Validates: Requirements 7.4**

---

### Property 19: Valid reservation submission creates a pending reservation

*For any* valid reservation payload (future date, valid time, valid party size), submitting the reservation form should create a Reservation record with `status = pending` associated with the authenticated customer.

**Validates: Requirements 7.5**

---

### Property 20: Customers only see their own reservations

*For any* authenticated customer, the reservations index response should contain only reservations whose `user_id` matches the authenticated customer's ID.

**Validates: Requirements 7.6**

---

### Property 21: Cancelling a pending or confirmed reservation sets status to cancelled

*For any* reservation with status `pending` or `confirmed`, a customer cancellation request should update the reservation's status to `cancelled`.

**Validates: Requirements 7.7**

---

### Property 22: Profile update persists valid name and email

*For any* valid name and unique email address, submitting a profile update should persist those exact values to the authenticated user's record in the database.

**Validates: Requirements 8.2**

---

### Property 23: Creating a menu item makes it visible on the public menu

*For any* valid menu item payload (name, description, price, category, is_available=true), an admin creating the item should result in that item appearing in the public menu page response.

**Validates: Requirements 9.2**

---

### Property 24: Updating a menu item reflects changes on the public menu

*For any* existing menu item and any valid field update (name, description, price, availability), the updated values should appear in the public menu page response after the update.

**Validates: Requirements 9.3**

---

### Property 25: Unavailable items cannot be added to the cart

*For any* menu item with `is_available = false`, an authenticated customer attempting to add that item to the cart should receive a 422 error response, and the cart should remain unchanged.

**Validates: Requirements 9.4**

---

### Property 26: Soft-deleting a menu item preserves order item references

*For any* menu item that has associated order items, soft-deleting the menu item should set `deleted_at` on the menu item but leave all order items intact with their snapshotted `menu_item_name` and `menu_item_price` values.

**Validates: Requirements 9.5**

---

### Property 27: Category with items cannot be deleted

*For any* category that contains at least one menu item, an admin attempting to delete that category should receive a 422 validation error, and the category should remain in the database.

**Validates: Requirements 9.7**

---

### Property 28: Admin order status filter returns only matching orders

*For any* order status value, applying that status filter on the admin orders page should return only orders whose `status` field matches the filter value.

**Validates: Requirements 10.2**

---

### Property 29: Admin order status update persists the new status

*For any* order and any valid target status, an admin updating the order's status should result in the order record having the new status value persisted in the database.

**Validates: Requirements 10.3**

---

### Property 30: Admin reservation list includes all required fields

*For any* reservation in the database, the admin reservations list response should include the customer name, date, time, party size, status, and special requests for that reservation.

**Validates: Requirements 11.1**

---

### Property 31: Admin reservation filter returns only matching reservations

*For any* combination of date and/or status filter values, the admin reservations response should contain only reservations that match all applied filter criteria.

**Validates: Requirements 11.2**

---

### Property 32: User list pagination respects page size

*For any* number of users in the database, the admin users list response for any given page should contain at most the configured page size (default: 15) of user records.

**Validates: Requirements 12.1**

---

### Property 33: User search returns only matching users

*For any* search term, all users returned by the admin user search should have the search term present (case-insensitive) in either their `name` or `email` field.

**Validates: Requirements 12.2**

---

### Property 34: Role change is immediately enforced

*For any* user and any valid role name, an admin changing that user's role should result in the user having exactly the new role (and no other roles) on their next authenticated request.

**Validates: Requirements 12.3**

---

### Property 35: Deactivated users cannot authenticate

*For any* user with `is_active = false`, attempting to authenticate with their correct credentials should fail and not establish an authenticated session.

**Validates: Requirements 12.4**

---

### Property 36: Dashboard recent orders list never exceeds 5 items

*For any* number of orders in the database (including more than 5), the admin dashboard Inertia props should contain a `recent_orders` array with at most 5 items.

**Validates: Requirements 13.4**

---

### Property 37: Dashboard today's reservations contains only today's reservations

*For any* set of reservations spanning multiple dates, the admin dashboard `today_reservations` prop should contain only reservations where `reserved_date` equals the current date.

**Validates: Requirements 13.5**

---

### Property 38: All email notifications are dispatched as queued jobs

*For any* email-triggering event (order created, order status changed to ready/cancelled, reservation created, reservation status changed to confirmed/cancelled), the corresponding notification should be dispatched to the queue rather than sent synchronously. The queue should contain the job after the triggering action, and no email should be sent inline.

**Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**

---

## Testing Strategy

### Overview

The project uses **PHPUnit 11** for all backend testing. The testing approach combines:

1. **Property-based tests** — verify universal properties across many generated inputs using a custom `PropertyTest` trait built on top of PHPUnit's data providers and Faker.
2. **Feature tests** — verify specific HTTP request/response cycles (Inertia responses, redirects, validation errors).
3. **Unit tests** — verify isolated service logic (CartService subtotal calculation, OrderService transaction).
4. **Integration tests** — verify email queuing, file storage, and broadcasting behavior.

Property-based testing is appropriate for this feature because the core business logic (cart arithmetic, access control, filtering, validation) involves pure functions and data transformations where input variation reveals edge cases. Infrastructure concerns (email delivery, WebSocket broadcasting, file storage) use integration tests with representative examples instead.

### Property-Based Testing Approach

Since PHP does not have a mature PBT library equivalent to Hypothesis or fast-check, property tests are implemented using a custom `PropertyTest` trait that:

1. Uses Faker to generate random inputs within valid domains.
2. Runs each property assertion **100 times** with different generated inputs.
3. Reports the failing seed on failure for reproducibility.

```php
// tests/Support/PropertyTest.php
trait PropertyTest
{
    protected function forAll(callable $generator, callable $assertion, int $iterations = 100): void
    {
        $faker = \Faker\Factory::create();
        for ($i = 0; $i < $iterations; $i++) {
            $input = $generator($faker, $i);
            $assertion($input);
        }
    }
}
```

Each property test class is tagged with a comment referencing the design property:
```
// Feature: restaurant-web-app, Property 2: Registration assigns exactly the customer role
```

### Test File Structure

```
tests/
├── Feature/
│   ├── Auth/
│   │   ├── RegistrationTest.php          Properties 2, 3
│   │   ├── AuthenticationTest.php        Property 3
│   │   └── PasswordResetTest.php
│   ├── Menu/
│   │   ├── LandingPageTest.php           Property 1
│   │   └── MenuPageTest.php              Properties 6, 7, 8, 9
│   ├── Cart/
│   │   └── CartTest.php                  Properties 10, 11, 12, 13, 25
│   ├── Orders/
│   │   └── OrderTest.php                 Properties 14, 15, 16
│   ├── Reservations/
│   │   └── ReservationTest.php           Properties 17, 18, 19, 20, 21
│   ├── Profile/
│   │   └── ProfileTest.php               Property 22
│   ├── Rbac/
│   │   └── AccessControlTest.php         Properties 3, 4, 5
│   └── Admin/
│       ├── MenuManagementTest.php         Properties 23, 24, 26, 27
│       ├── OrderManagementTest.php        Properties 28, 29
│       ├── ReservationManagementTest.php  Properties 30, 31
│       ├── UserManagementTest.php         Properties 32, 33, 34, 35
│       ├── DashboardTest.php              Properties 36, 37
│       └── NotificationTest.php          Property 38
├── Unit/
│   ├── CartServiceTest.php               Properties 10, 11, 12, 13
│   └── OrderServiceTest.php              Property 15
└── Support/
    └── PropertyTest.php                  PBT trait
```

### Example Property Test

```php
// tests/Feature/Cart/CartTest.php

// Feature: restaurant-web-app, Property 13: Cart subtotal equals sum of price times quantity
public function test_cart_subtotal_equals_sum_of_price_times_quantity(): void
{
    $this->forAll(
        generator: function (Faker $faker) {
            $user = User::factory()->create();
            $user->assignRole('customer');
            $items = MenuItem::factory()
                ->count($faker->numberBetween(1, 8))
                ->create(['is_available' => true]);
            $cartItems = $items->map(fn($item) => [
                'item'     => $item,
                'quantity' => $faker->numberBetween(1, 10),
            ]);
            return compact('user', 'cartItems');
        },
        assertion: function (array $data) {
            ['user' => $user, 'cartItems' => $cartItems] = $data;
            $cartService = app(CartService::class);
            foreach ($cartItems as ['item' => $item, 'quantity' => $qty]) {
                $cartService->add($user, $item, $qty, null);
            }
            $expectedSubtotal = $cartItems->sum(
                fn($c) => $c['item']->price * $c['quantity']
            );
            $this->assertEqualsWithDelta(
                $expectedSubtotal,
                $cartService->subtotal($user),
                0.001
            );
        }
    );
}
```

### Unit Testing Balance

Unit tests focus on:
- Specific examples demonstrating correct behavior (e.g., order confirmation response shape)
- Integration points (e.g., OrderService dispatches the correct job)
- Edge cases not covered by property generators (e.g., cancelling an already-cancelled reservation)

Property tests handle broad input coverage. Avoid writing unit tests that duplicate what property tests already cover.

### Integration Tests

Integration tests use `Queue::fake()`, `Mail::fake()`, `Storage::fake()`, and `Event::fake()` to verify:
- Email jobs are dispatched to the correct queue on triggering events (Property 38)
- File uploads store the image and associate the path with the menu item
- Broadcasting events are fired on order/reservation status changes

### Frontend Testing

Frontend testing is out of scope for PHPUnit. The React components are validated through:
- Inertia's prop contracts (verified by feature tests checking the Inertia response shape)
- Manual testing for UI interactions, animations, and responsive layout
- The shared props contract is enforced by the `HandleInertiaRequests` middleware tests

### Running Tests

```bash
# All tests
php artisan test

# Specific test file
php artisan test tests/Feature/Cart/CartTest.php

# With coverage
php artisan test --coverage

# Property tests only (by group)
php artisan test --group=property
```

Tag property tests with `#[Group('property')]` attribute for selective execution.

### Test Database

Tests use an in-memory SQLite database configured in `phpunit.xml`:
```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
<env name="CACHE_STORE" value="array"/>
<env name="QUEUE_CONNECTION" value="sync"/>
<env name="SESSION_DRIVER" value="array"/>
```

For cart tests, Redis is replaced with the `array` cache driver to avoid requiring a live Redis instance in CI.
