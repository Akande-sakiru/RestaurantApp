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
                'latitude' => 6.5244,
                'longitude' => 3.3792,
                'max_delivery_radius_km' => 200,
            ]
        );

        // Assign admin role
        $admin->assignRole('admin');
        // Update existing admin user with default restaurant location (Lagos, Nigeria)
        $admin = User::where('email', 'admin@restaurant.test')->first();

        if ($admin) {
            $this->command->info('Admin user updated with default restaurant location (Lagos, Nigeria)');
        } else {
            $this->command->warn('Admin user (admin@example.com) not found. Please configure restaurant location in Admin Settings.');
        }
    }
}
