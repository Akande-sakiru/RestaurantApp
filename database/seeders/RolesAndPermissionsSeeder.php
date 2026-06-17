<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()['cache']->forget('spatie.permission.cache');

        // Define all permissions
        $permissions = [
            // Menu permissions
            'menu.view',
            'menu.create',
            'menu.update',
            'menu.delete',
            // Orders permissions
            'orders.view-own',
            'orders.view-all',
            'orders.update-status',
            // Reservations permissions
            'reservations.view-own',
            'reservations.view-all',
            'reservations.update-status',
            // Users permissions
            'users.view',
            'users.manage',
            // Cart permissions
            'cart.manage',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create customer role and assign permissions
        $customerRole = Role::firstOrCreate(['name' => 'customer']);
        $customerRole->syncPermissions([
            'menu.view',
            'orders.view-own',
            'reservations.view-own',
            'cart.manage',
        ]);

        // Create admin role and assign all permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());
    }
}
