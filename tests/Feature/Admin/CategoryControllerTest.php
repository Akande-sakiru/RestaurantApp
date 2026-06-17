<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testCategoryWithItemsCannotBeDeleted(): void
    {
        /**
         * Property 27: Category with items cannot be deleted
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $category = Category::factory()->create();
                $itemCount = $faker->numberBetween(1, 5);
                MenuItem::factory($itemCount)->create(['category_id' => $category->id]);

                return [
                    'admin' => $admin,
                    'category' => $category,
                    'itemCount' => $itemCount,
                ];
            },
            assertion: function ($data) {
                // Use withoutMiddleware to bypass CSRF for testing
                $response = $this->delete(route('admin.categories.destroy', $data['category']));

                // Should get a 422 Unprocessable Entity error
                $response->assertStatus(422);

                // Category should still exist in database
                $this->assertDatabaseHas('categories', ['id' => $data['category']->id]);
            },
            iterations: 10
        );
    }
}
