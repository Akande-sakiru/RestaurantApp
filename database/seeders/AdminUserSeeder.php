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
        // Update existing admin user with default restaurant location (Lagos, Nigeria)
        $admin = User::where('email', 'admin@example.com')->first();
        
        if ($admin) {
            $admin->update([
                'latitude' => 6.5244,
                'longitude' => 3.3792,
                'max_delivery_radius_km' => 200,
            ]);
            
            $this->command->info('Admin user updated with default restaurant location (Lagos, Nigeria)');
        } else {
            $this->command->warn('Admin user (admin@example.com) not found. Please configure restaurant location in Admin Settings.');
        }
    }
}
