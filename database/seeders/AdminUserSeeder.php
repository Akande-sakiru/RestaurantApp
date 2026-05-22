<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@restaurant.test'],
            [
                'name' => 'Admin User',
                'phone' => '08169453935',
                'password' => 'password',
                'is_active' => true,
            ]
        );

        // Assign admin role
        $admin->assignRole('admin');
    }
}
