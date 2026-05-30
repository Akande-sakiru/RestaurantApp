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
    });
});

require __DIR__.'/auth.php';
