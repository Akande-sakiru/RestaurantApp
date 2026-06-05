<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\UserController;

// Public routes
Route::get('/', [LandingController::class, 'index'])->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');

Route::get('/category/{id}', function ($id) {
    return Inertia::render('Category/Show', ['category' => ['id' => $id, 'name' => 'Category']]);
})->name('category.show');

// Payment webhook (public, but verify signature)
Route::post('/payment/webhook', [\App\Http\Controllers\PaymentController::class, 'webhook'])->name('payment.webhook');

// Auth routes (Breeze)
require __DIR__ . '/auth.php';

// Customer routes - Apply StoreIntendedUrl middleware for unauthenticated access
Route::middleware(['auth', 'verified', 'role:customer|admin'])->group(function () {
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{menuItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{menuItem}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

    // Payment routes
    Route::get('/payment', [\App\Http\Controllers\PaymentController::class, 'show'])->name('payment.show');
    Route::post('/payment', [\App\Http\Controllers\PaymentController::class, 'create'])->name('payment.create');
    Route::post('/payment/initialize', [\App\Http\Controllers\PaymentController::class, 'initialize'])->name('payment.initialize');
    Route::post('/payment/verify', [\App\Http\Controllers\PaymentController::class, 'verify'])->name('payment.verify');
    Route::post('/payment/fail', [\App\Http\Controllers\PaymentController::class, 'fail'])->name('payment.fail');

    // Order routes
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('/orders/{order}/confirmation', [OrderController::class, 'confirmation'])->name('orders.confirmation');
    
    // Order API endpoints (for real-time status)
    Route::get('/api/orders', [\App\Http\Controllers\Api\OrderApiController::class, 'index'])->name('api.orders.index');
    Route::get('/api/orders/{order}', [\App\Http\Controllers\Api\OrderApiController::class, 'show'])->name('api.orders.show');

    // Cart sync API (for syncing pending cart after login)
    Route::post('/api/cart/sync', [\App\Http\Controllers\Api\CartApiController::class, 'syncPending'])->name('api.cart.sync');

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
        Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        // Menu Items
        Route::get('/menu-items', [MenuItemController::class, 'index'])->name('menu-items.index');
        Route::get('/menu-items/create', [MenuItemController::class, 'create'])->name('menu-items.create');
        Route::post('/menu-items', [MenuItemController::class, 'store'])->name('menu-items.store');
        Route::get('/menu-items/{menuItem}/edit', [MenuItemController::class, 'edit'])->name('menu-items.edit');
        Route::patch('/menu-items/{menuItem}', [MenuItemController::class, 'update'])->name('menu-items.update');
        Route::delete('/menu-items/{menuItem}', [MenuItemController::class, 'destroy'])->name('menu-items.destroy');
        Route::patch('/menu-items/{menuItem}/toggle-availability', function ($menuItem) {
            $newStatus = $menuItem->is_available === 'yes' ? 'no' : 'yes';
            $menuItem->update(['is_available' => $newStatus]);
            return back();
        });

        // Categories
        Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', function () {
            return \Inertia\Inertia::render('Admin/Categories/Create');
        })->name('categories.create');
        Route::post('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', function (\App\Models\Category $category) {
            return \Inertia\Inertia::render('Admin/Categories/Edit', ['category' => $category]);
        })->name('categories.edit');
        Route::patch('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');

        // Orders
        Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
        Route::patch('/orders/{order}/status', [\App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('orders.update-status');

        // Reservations
        Route::get('/reservations', [\App\Http\Controllers\Admin\ReservationController::class, 'index'])->name('reservations.index');
        Route::get('/reservations/{reservation}', [\App\Http\Controllers\Admin\ReservationController::class, 'show'])->name('reservations.show');
        Route::patch('/reservations/{reservation}/status', [\App\Http\Controllers\Admin\ReservationController::class, 'updateStatus'])->name('reservations.update-status');

        // Users
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
    });
