<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class MenuItemControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testCreatingMenuItemMakesItVisibleOnPublicMenu(): void
    {
        /**
         * Property 23: Creating a menu item makes it visible on the public menu
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $category = Category::factory()->create();
                $name = $faker->word();
                $description = $faker->sentence();
                $price = $faker->randomFloat(2, 1, 100);

                return [
                    'admin' => $admin,
                    'category' => $category,
                    'name' => $name,
                    'description' => $description,
                    'price' => $price,
                ];
            },
            assertion: function ($data) {
                // Create the menu item
                $this->post(route('admin.menu-items.store'), [
                    'category_id' => $data['category']->id,
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'price' => $data['price'],
                    'is_available' => true,
                ]);

                // Logout as admin, view as guest
                auth()->logout();

                // Menu item should be visible on public menu
                $response = $this->get(route('menu.index'));
                $response->assertStatus(200);

                $menuItems = $response->viewData('menuItems');
                $foundItem = collect($menuItems)->firstWhere('name', $data['name']);
                $this->assertNotNull($foundItem);
            },
            iterations: 10
        );
    }

    #[Group('property')]
    public function testUpdatingMenuItemReflectsChangesOnPublicMenu(): void
    {
        /**
         * Property 24: Updating a menu item reflects changes on the public menu
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $menuItem = MenuItem::factory()->create(['is_available' => true]);
                $newName = $faker->word();
                $newPrice = $faker->randomFloat(2, 1, 100);

                return [
                    'admin' => $admin,
                    'menuItem' => $menuItem,
                    'newName' => $newName,
                    'newPrice' => $newPrice,
                ];
            },
            assertion: function ($data) {
                // Update the menu item
                $this->patch(route('admin.menu-items.update', $data['menuItem']), [
                    'category_id' => $data['menuItem']->category_id,
                    'name' => $data['newName'],
                    'description' => $data['menuItem']->description,
                    'price' => $data['newPrice'],
                    'is_available' => true,
                ]);

                // Logout as admin, view as guest
                auth()->logout();

                // Updated menu item should be visible on public menu with new values
                $response = $this->get(route('menu.index'));
                $response->assertStatus(200);

                $menuItems = $response->viewData('menuItems');
                $foundItem = collect($menuItems)->firstWhere('name', $data['newName']);
                $this->assertNotNull($foundItem);
                $this->assertEqual($data['newPrice'], (float) $foundItem->price);
            },
            iterations: 10
        );
    }

    #[Group('property')]
    public function testSoftDeletingMenuItemPreservesOrderItemReferences(): void
    {
        /**
         * Property 26: Soft-deleting a menu item preserves order item references
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $menuItem = MenuItem::factory()->create();

                // Create an order with items referencing this menu item
                $order = Order::factory()->create();
                $orderItemCount = $faker->numberBetween(1, 3);
                OrderItem::factory($orderItemCount)->create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                ]);

                return [
                    'admin' => $admin,
                    'menuItem' => $menuItem,
                    'order' => $order,
                    'orderItemCount' => $orderItemCount,
                ];
            },
            assertion: function ($data) {
                // Soft delete the menu item
                $response = $this->delete(route('admin.menu-items.destroy', $data['menuItem']));

                // MenuItem should be soft-deleted
                $this->assertSoftDeleted('menu_items', ['id' => $data['menuItem']->id]);

                // OrderItems should still exist and reference the item
                $orderItems = OrderItem::where('order_id', $data['order']->id)
                    ->where('menu_item_id', $data['menuItem']->id)
                    ->get();

                $this->assertCount($data['orderItemCount'], $orderItems);
            },
            iterations: 10
        );
    }
}
