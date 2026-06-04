<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testUserListPaginationRespectsPageSize(): void
    {
        /**
         * Property 32: User list pagination respects page size
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                // Create many users
                User::factory(30)->create();

                return [
                    'admin' => $admin,
                ];
            },
            assertion: function ($data) {
                $response = $this->get(route('admin.users.index'));
                $response->assertStatus(200);

                $users = $response->viewData('users');

                // Should be paginated at 15 per page
                $this->assertLessThanOrEqual(15, count($users));
            },
            iterations: 5
        );
    }

    #[Group('property')]
    public function testUserSearchReturnsOnlyMatchingUsers(): void
    {
        /**
         * Property 33: User search returns only matching users
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $searchUser = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
                User::factory(5)->create();

                return [
                    'admin' => $admin,
                    'searchUser' => $searchUser,
                    'searchTerm' => 'John',
                ];
            },
            assertion: function ($data) {
                $response = $this->get(route('admin.users.index', ['search' => $data['searchTerm']]));
                $response->assertStatus(200);

                $users = $response->viewData('users');

                // All returned users should match the search term
                foreach ($users as $user) {
                    $matches = stripos($user->name, $data['searchTerm']) !== false ||
                        stripos($user->email, $data['searchTerm']) !== false;
                    $this->assertTrue($matches);
                }
            },
            iterations: 10
        );
    }

    #[Group('property')]
    public function testRoleChangeIsImmediatelyEnforced(): void
    {
        /**
         * Property 34: Role change is immediately enforced
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $user = User::factory()->create();
                $user->assignRole('customer');
                $newRole = 'admin';

                return [
                    'admin' => $admin,
                    'user' => $user,
                    'newRole' => $newRole,
                ];
            },
            assertion: function ($data) {
                // Change role
                $response = $this->patch(route('admin.users.role', $data['user']), [
                    'role' => $data['newRole'],
                ]);

                // Refresh user
                $data['user']->refresh();

                // Verify role was changed
                $this->assertTrue($data['user']->hasRole($data['newRole']));
                $this->assertFalse($data['user']->hasRole('customer'));
            },
            iterations: 10
        );
    }

    #[Group('property')]
    public function testDeactivatedUsersCannotAuthenticate(): void
    {
        /**
         * Property 35: Deactivated users cannot authenticate
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create([
                    'email' => 'deactivated@example.com',
                    'password' => bcrypt('password123'),
                    'is_active' => true,
                ]);
                $user->assignRole('customer');

                return [
                    'user' => $user,
                    'email' => 'deactivated@example.com',
                    'password' => 'password123',
                ];
            },
            assertion: function ($data) {
                // Deactivate the user
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $this->patch(route('admin.users.toggle-active', $data['user']));

                // Try to login as deactivated user
                auth()->logout();

                $response = $this->post(route('login'), [
                    'email' => $data['email'],
                    'password' => $data['password'],
                ]);

                // Should not be able to login
                $response->assertSessionHasErrors();
            },
            iterations: 10
        );
    }
}
