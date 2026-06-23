<?php

namespace App\Jobs;

use App\Models\MenuItem;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

class ProcessMenuItemImage implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public readonly MenuItem $menuItem)
    {
    }

    /**
     * Execute the job.
     */


    // public function handle(): void
    // {
    //     if (!$this->menuItem->image_path) {
    //         return;
    //     }

    //     $storagePath = Storage::path($this->menuItem->image_path);

    //     if (!file_exists($storagePath)) {
    //         return;
    //     }

    //     try {
    //         // Create image manager with GD driver
    //         $manager = ImageManager::gd();
    //         $image = $manager->read($storagePath);

    //         // Resize to max 800x600 while maintaining aspect ratio
    //         $image->scaleDown(width: 800, height: 600);

    //         // Save back to storage
    //         $image->save($storagePath, quality: 80);
    //     } catch (\Exception $e) {
    //         // Log the error but don't fail the job
    //         Log::error('Failed to process menu item image', [
    //             'menu_item_id' => $this->menuItem->id,
    //             'image_path' => $this->menuItem->image_path,
    //             'error' => $e->getMessage(),
    //         ]);
    //     }
    // }
    public function handle(): void
    {
        if (!$this->menuItem->image_path) {
            return;
        }

        if (!Storage::disk('uploads')->exists($this->menuItem->image_path)) {
            return;
        }

        try {
            $manager = ImageManager::gd();
            $contents = Storage::disk('uploads')->get($this->menuItem->image_path);
            $image = $manager->read($contents);

            $image->scaleDown(width: 800, height: 600);

            // encode and write back to the disk (no local path involved)
            $encoded = $image->toJpeg(quality: 80); // adjust encoder to match your file's extension
            Storage::disk('uploads')->put($this->menuItem->image_path, (string) $encoded);
        } catch (\Exception $e) {
            Log::error('Failed to process menu item image', [
                'menu_item_id' => $this->menuItem->id,
                'image_path' => $this->menuItem->image_path,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
