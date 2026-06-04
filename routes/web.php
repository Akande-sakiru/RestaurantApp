<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');

Route::get('/category/{id}', function ($id) {
    return Inertia::render('Category/Show', ['category' => ['id' => $id, 'name' => 'Category']]);
})->name('category.show');

// Auth routes (Breeze)
require __DIR__ . '/auth.php';

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
        Route::get('/dashboard', function () {
            return \Inertia\Inertia::render('Admin/Dashboard/Index');
        })->name('dashboard');

        // Menu Items
        Route::get('/menu-items', function () {
            return \Inertia\Inertia::render('Admin/MenuItems/Index');
        })->name('menu-items.index');

        Route::get('/menu-items/create', function () {
            $categories = \App\Models\Category::all();
            return \Inertia\Inertia::render('Admin/MenuItems/Create', ['categories' => $categories]);
        })->name('menu-items.create');

        Route::get('/menu-items/{menuItem}/edit', function (\App\Models\MenuItem $menuItem) {
            $categories = \App\Models\Category::all();
            return \Inertia\Inertia::render('Admin/MenuItems/Edit', ['menuItem' => $menuItem, 'categories' => $categories]);
        })->name('menu-items.edit');

        Route::patch('/menu-items/{id}/toggle-availability', function ($id) {
            return back();
        });

        // Categories
        Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', function () {
            return \Inertia\Inertia::render('Admin/Categories/Create');
        })->name('categories.create');
        Route::post('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', function (\App\Models\Category $category) {
            return \Inertia\Inertia::render('Admin/Categories/Edit', ['category' => $category->makeVisible($category->getHidden())]);
        })->name('categories.edit');
        Route::put('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');

        // Orders
        Route::get('/orders', function () {
            return \Inertia\Inertia::render('Admin/Orders/Index');
        })->name('orders.index');

        Route::get('/orders/{order}', function (\App\Models\Order $order) {
            return \Inertia\Inertia::render('Admin/Orders/Show', ['order' => $order->load('user', 'items')]);
        })->name('orders.show');

        Route::patch('/orders/{id}/status', function ($id) {
            return back();
        });

        // Reservations
        Route::get('/reservations', function () {
            return \Inertia\Inertia::render('Admin/Reservations/Index');
        })->name('reservations.index');

        Route::get('/reservations/{reservation}', function (\App\Models\Reservation $reservation) {
            return \Inertia\Inertia::render('Admin/Reservations/Show', ['reservation' => $reservation->load('user')]);
        })->name('reservations.show');

        Route::patch('/reservations/{id}/status', function ($id) {
            return back();
        });

        // Users
        Route::get('/users', function () {
            return \Inertia\Inertia::render('Admin/Users/Index');
        })->name('users.index');

        Route::patch('/users/{id}/toggle-active', function ($id) {
            return back();
        });

        Route::patch('/users/{id}/role', function ($id) {
            return back();
        });
    });
