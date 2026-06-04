<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testProfileUpdatePersistsValidNameAndEmail(): void
    {
        /**
         * Property 22: Profile update persists valid name and email
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create();
                $this->actingAs($user);

                $newName = $faker->name();
                $newEmail = $faker->unique()->safeEmail();

                return [
                    'user' => $user,
                    'newName' => $newName,
                    'newEmail' => $newEmail,
                ];
            },
            assertion: function ($data) {
                $response = $this->patch(route('profile.update'), [
                    'name' => $data['newName'],
                    'email' => $data['newEmail'],
                ]);

                $response->assertStatus(302); // Redirect on success
    
                // Refresh from database and verify changes persisted
                $data['user']->refresh();
                $this->assertEquals($data['newName'], $data['user']->name);
                $this->assertEquals($data['newEmail'], $data['user']->email);
            },
            iterations: 15
        );
    }
}
