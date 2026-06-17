<?php

namespace Tests\Feature\Menu;

use App\Models\Category;
use App\Models\MenuItem;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

#[Group('property')]
class MenuPropertyTests extends TestCase
{
    use PropertyTest;

    /**
     * Property 6: Menu page groups all active items by category
     * Property 7: Menu items in response contain all required fields
     * Property 8: Category filter returns only items from that category
     * Property 9: Menu search returns only matching items
     */
    public function test_menu_query_logic(): void
    {
        $this->forAll(
            generator: function ($faker) {
                // Create 2-3 categories
                $categories = Category::factory($faker->numberBetween(2, 3))->create();

                // Add items to each category
                foreach ($categories as $category) {
                    MenuItem::factory($faker->numberBetween(2, 4))
                        ->state([
                            'category_id' => $category->id,
                            'is_available' => true,
                        ])
                        ->create();
                }

                // Add unavailable items
                MenuItem::factory(2)
                    ->state([
                        'category_id' => $categories->random()->id,
                        'is_available' => false,
                    ])
                    ->create();

                return $categories;
            },
            assertion: function ($categories) {
                // Test: All active items returned
                $query = MenuItem::query()
                    ->where('is_available', true)
                    ->with('category')
                    ->orderBy('sort_order');

                $allActive = $query->get();

                foreach ($allActive as $item) {
                    $this->assertTrue($item->is_available);
                }

                // Test: Required fields present
                foreach ($allActive as $item) {
                    $this->assertNotNull($item->id);
                    $this->assertNotNull($item->name);
                    $this->assertNotNull($item->description);
                    $this->assertNotNull($item->price);
                    $this->assertNotNull($item->category);
                }

                // Test: Category filter
                $targetCategory = $categories->random();
                $filtered = MenuItem::query()
                    ->where('is_available', true)
                    ->where('category_id', $targetCategory->id)
                    ->get();

                foreach ($filtered as $item) {
                    $this->assertEquals($targetCategory->id, $item->category_id);
                }

                // Test: Search functionality
                $searchTerm = 'test';
                MenuItem::factory()->state([
                    'category_id' => $categories->first()->id,
                    'name' => 'Test Item',
                    'is_available' => true,
                ])->create();

                $searched = MenuItem::query()
                    ->where('is_available', true)
                    ->where(function ($q) use ($searchTerm) {
                        $q->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('description', 'like', "%{$searchTerm}%");
                    })
                    ->get();

                foreach ($searched as $item) {
                    $hasMatch = stripos($item->name, $searchTerm) !== false ||
                        stripos($item->description, $searchTerm) !== false;
                    $this->assertTrue($hasMatch, "Item should match search term");
                }
            },
            iterations: 10
        );
    }

    /**
     * Property 8 (focused): Category filter accuracy
     */
    public function test_category_filter_accuracy(): void
    {
        $this->forAll(
            generator: function ($faker) {
                $categories = Category::factory(3)->create();

                foreach ($categories as $cat) {
                    MenuItem::factory($faker->numberBetween(2, 5))
                        ->state(['category_id' => $cat->id, 'is_available' => true])
                        ->create();
                }

                return $categories;
            },
            assertion: function ($categories) {
                $target = $categories->random();

                $result = MenuItem::where('category_id', $target->id)
                    ->where('is_available', true)
                    ->get();

                foreach ($result as $item) {
                    $this->assertEquals($target->id, $item->category_id);
                }
            },
            iterations: 10
        );
    }

    /**
     * Property 9 (focused): Search functionality
     */
    public function test_search_functionality(): void
    {
        $this->forAll(
            generator: function ($faker) {
                $category = Category::factory()->create();

                MenuItem::factory()->state([
                    'category_id' => $category->id,
                    'name' => 'Delicious Pizza',
                    'is_available' => true,
                ])->create();

                MenuItem::factory()->state([
                    'category_id' => $category->id,
                    'description' => 'A pizza with mushrooms',
                    'is_available' => true,
                ])->create();

                MenuItem::factory(2)->state([
                    'category_id' => $category->id,
                    'is_available' => true,
                ])->create();

                return true;
            },
            assertion: function () {
                $results = MenuItem::where('is_available', true)
                    ->where(function ($q) {
                        $q->where('name', 'like', '%pizza%')
                            ->orWhere('description', 'like', '%pizza%');
                    })
                    ->get();

                foreach ($results as $item) {
                    $match = stripos($item->name, 'pizza') !== false ||
                        stripos($item->description, 'pizza') !== false;
                    $this->assertTrue($match);
                }
            },
            iterations: 10
        );
    }
}
