<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Guest Routes
Route::get('/menu', function () {
    return Inertia::render('Menu/Index');
})->name('menu.index');

Route::get('/category/{id}', function ($id) {
    return Inertia::render('Category/Show', ['category' => ['id' => $id, 'name' => 'Category']]);
})->name('category.show');

// Customer Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Cart
    Route::get('/cart', function () {
        return Inertia::render('Cart/Index');
    })->name('cart.index');

    // Orders
    Route::get('/orders', function () {
        return Inertia::render('Orders/Index');
    })->name('orders.index');

    Route::get('/orders/{id}', function ($id) {
        return Inertia::render('Orders/Show', ['order' => ['id' => $id]]);
    })->name('orders.show');

    // Reservations
    Route::get('/reservations', function () {
        return Inertia::render('Reservations/Index');
    })->name('reservations.index');

    Route::get('/reservations/create', function () {
        return Inertia::render('Reservations/Create');
    })->name('reservations.create');

    Route::post('/reservations', function () {
        return redirect()->route('reservations.index');
    })->name('reservations.store');

    Route::patch('/reservations/{id}/cancel', function ($id) {
        return redirect()->route('reservations.index');
    })->name('reservations.cancel');

    // Admin Routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return Inertia::render('Admin/Dashboard/Index');
        })->name('admin.dashboard');

        // Menu Items
        Route::get('/admin/menu-items', function () {
            return Inertia::render('Admin/MenuItems/Index');
        })->name('admin.menu-items.index');

        Route::get('/admin/menu-items/create', function () {
            return Inertia::render('Admin/MenuItems/Create');
        })->name('admin.menu-items.create');

        Route::get('/admin/menu-items/{id}/edit', function ($id) {
            return Inertia::render('Admin/MenuItems/Edit', ['id' => $id]);
        })->name('admin.menu-items.edit');

        Route::patch('/admin/menu-items/{id}/toggle-availability', function ($id) {
            return back();
        });

        // Categories
        Route::get('/admin/categories', function () {
            return Inertia::render('Admin/Categories/Index');
        })->name('admin.categories.index');

        Route::get('/admin/categories/create', function () {
            return Inertia::render('Admin/Categories/Create');
        })->name('admin.categories.create');

        Route::get('/admin/categories/{id}/edit', function ($id) {
            return Inertia::render('Admin/Categories/Edit', ['id' => $id]);
        })->name('admin.categories.edit');

        // Orders
        Route::get('/admin/orders', function () {
            return Inertia::render('Admin/Orders/Index');
        })->name('admin.orders.index');

        Route::get('/admin/orders/{id}', function ($id) {
            return Inertia::render('Admin/Orders/Show', ['id' => $id]);
        })->name('admin.orders.show');

        Route::patch('/admin/orders/{id}/status', function ($id) {
            return back();
        });

        // Reservations
        Route::get('/admin/reservations', function () {
            return Inertia::render('Admin/Reservations/Index');
        })->name('admin.reservations.index');

        Route::get('/admin/reservations/{id}', function ($id) {
            return Inertia::render('Admin/Reservations/Show', ['id' => $id]);
        })->name('admin.reservations.show');

        Route::patch('/admin/reservations/{id}/status', function ($id) {
            return back();
        });

        // Users
        Route::get('/admin/users', function () {
            return Inertia::render('Admin/Users/Index');
        })->name('admin.users.index');

        Route::patch('/admin/users/{id}/toggle-active', function ($id) {
            return back();
        });

        Route::patch('/admin/users/{id}/role', function ($id) {
            return back();
        });
    });
});

require __DIR__.'/auth.php';
