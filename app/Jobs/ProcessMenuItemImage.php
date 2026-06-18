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

    public function __construct(public readonly MenuItem $menuItem)
    {
    }

    public function handle(): void
    {
        if (!$this->menuItem->image_path) {
            return;
        }

        $disk = Storage::disk('s3');

        if (!$disk->exists($this->menuItem->image_path)) {
            return;
        }

        try {
            $manager = ImageManager::gd();

            // Read file contents from S3 into memory
            $contents = $disk->get($this->menuItem->image_path);
            $image = $manager->read($contents);

            $image->scaleDown(width: 800, height: 600);

            // Encode and write back up to S3
            $encoded = $image->encode(new \Intervention\Image\Encoders\AutoEncoder(quality: 80));
            $disk->put($this->menuItem->image_path, (string) $encoded);
        } catch (\Exception $e) {
            Log::error('Failed to process menu item image', [
                'menu_item_id' => $this->menuItem->id,
                'image_path' => $this->menuItem->image_path,
                'error' => $e->getMessage(),
            ]);
        }
    }
}