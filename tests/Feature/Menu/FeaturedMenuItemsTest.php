<?php

namespace Tests\Feature\Menu;

use App\Models\Category;
use App\Models\MenuItem;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

#[Group('property')]
class FeaturedMenuItemsTest extends TestCase
{
    use PropertyTest;

    /**
     * Property 1: Featured menu items contain required fields
     * 
     * Validates: Requirements 1.3
     * 
     * Tests that the landing page returns featured menu items with all required fields:
     * - id
     * - name
     * - description
     * - price
     * - image_url
     * - category (with id and name)
     */
    public function test_featured_items_contain_required_fields(): void
    {
        $this->forAll(
            generator: function ($faker) {
                // Generate 1-3 categories per iteration
                $numCategories = $faker->numberBetween(1, 3);
                $categories = Category::factory($numCategories)->create();

                // Generate random number of featured items (1-6)
                $numItems = $faker->numberBetween(1, 6);
                MenuItem::factory($numItems)
                    ->state(fn() => [
                        'category_id' => $categories->random()->id,
                        'is_available' => true,
                    ])
                    ->create();

                return $categories;
            },
            assertion: function ($categories) {
                $response = $this->get(route('home'));
                $response->assertStatus(200);

                $props = $response->original['props'] ?? [];
                $featuredItems = $props['featuredItems'] ?? [];

                // Featured items should be an array
                $this->assertIsArray($featuredItems);

                // All featured items should contain required fields
                foreach ($featuredItems as $item) {
                    $this->assertArrayHasKey('id', $item, 'Item missing id field');
                    $this->assertArrayHasKey('name', $item, 'Item missing name field');
                    $this->assertArrayHasKey('description', $item, 'Item missing description field');
                    $this->assertArrayHasKey('price', $item, 'Item missing price field');
                    $this->assertArrayHasKey('image_url', $item, 'Item missing image_url field');
                    $this->assertArrayHasKey('category', $item, 'Item missing category field');

                    // Category should have required fields
                    $this->assertIsArray($item['category']);
                    $this->assertArrayHasKey('id', $item['category'], 'Category missing id field');
                    $this->assertArrayHasKey('name', $item['category'], 'Category missing name field');
                }

                // Should never exceed 6 featured items
                $this->assertLessThanOrEqual(6, count($featuredItems));
            },
            iterations: 20
        );
    }

    /**
     * Property: Featured items are always available
     * 
     * Tests that the landing page only returns items marked as available.
     */
    public function test_featured_items_are_always_available(): void
    {
        $this->forAll(
            generator: function ($faker) {
                $category = Category::factory()->create();

                // Mix of available and unavailable items
                MenuItem::factory(3)
                    ->state([
                        'category_id' => $category->id,
                        'is_available' => true,
                    ])
                    ->create();

                $unavailable = MenuItem::factory(3)
                    ->state([
                        'category_id' => $category->id,
                        'is_available' => false,
                    ])
                    ->create();

                return $unavailable->pluck('id')->toArray();
            },
            assertion: function ($unavailableIds) {
                $response = $this->get(route('home'));
                $response->assertStatus(200);

                $props = $response->original['props'] ?? [];
                $featuredItems = $props['featuredItems'] ?? [];

                // All featured items should be available
                $featuredIds = array_column($featuredItems, 'id');
                foreach ($unavailableIds as $id) {
                    $this->assertNotContains($id, $featuredIds, "Unavailable item should not be in featured items");
                }
            },
            iterations: 20
        );
    }

    /**
     * Property: Featured items never exceed 6
     * 
     * Tests that even with many available items, only up to 6 are returned.
     */
    public function test_featured_items_limited_to_six(): void
    {
        $this->forAll(
            generator: function ($faker) {
                $category = Category::factory()->create();

                // Create more than 6 available items
                MenuItem::factory(10)
                    ->state([
                        'category_id' => $category->id,
                        'is_available' => true,
                    ])
                    ->create();

                return true;
            },
            assertion: function () {
                $response = $this->get(route('home'));
                $response->assertStatus(200);

                $props = $response->original['props'] ?? [];
                $featuredItems = $props['featuredItems'] ?? [];

                $this->assertLessThanOrEqual(
                    6,
                    count($featuredItems),
                    'Featured items should never exceed 6'
                );
            },
            iterations: 20
        );
    }
}
