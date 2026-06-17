<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ConfigureRestaurant extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'restaurant:configure 
                            {latitude : Restaurant latitude (e.g., 6.5244)}
                            {longitude : Restaurant longitude (e.g., 3.3792)}
                            {--user-id=3 : User ID to configure (default: 3)}
                            {--radius=20 : Maximum delivery radius in km (default: 20)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configure restaurant location and delivery settings';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $latitude = (float) $this->argument('latitude');
        $longitude = (float) $this->argument('longitude');
        $userId = (int) $this->option('user-id');
        $radius = (int) $this->option('radius');

        // Validate coordinates
        if ($latitude < -90 || $latitude > 90) {
            $this->error('Latitude must be between -90 and 90');
            return;
        }

        if ($longitude < -180 || $longitude > 180) {
            $this->error('Longitude must be between -180 and 180');
            return;
        }

        if ($radius < 1 || $radius > 100) {
            $this->error('Radius must be between 1 and 100 km');
            return;
        }

        // Get the specified user
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return;
        }

        // Update restaurant configuration
        $user->update([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'max_delivery_radius_km' => $radius,
        ]);

        $this->info('✓ Restaurant location configured successfully!');
        $this->info("  User: {$user->name} (ID: {$user->id})");
        $this->info("  Latitude: {$latitude}");
        $this->info("  Longitude: {$longitude}");
        $this->info("  Max Delivery Radius: {$radius} km");
        $this->newLine();
        $this->info('Delivery fee calculation is now active for your restaurant.');
    }
}
