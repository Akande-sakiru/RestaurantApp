<?php

namespace Tests\Support;

use Faker\Factory as FakerFactory;

/**
 * PropertyTest trait provides property-based testing infrastructure using Faker.
 * 
 * Since PHP does not have a mature PBT library equivalent to Hypothesis or fast-check,
 * this trait implements property tests using Faker to generate random inputs within
 * valid domains and runs each property assertion multiple times with different inputs.
 * 
 * Example usage:
 * 
 *     $this->forAll(
 *         generator: function (\Faker\Generator $faker) {
 *             return $faker->numberBetween(1, 100);
 *         },
 *         assertion: function ($number) {
 *             $this->assertGreaterThanOrEqual(1, $number);
 *             $this->assertLessThanOrEqual(100, $number);
 *         }
 *     );
 */
trait PropertyTest
{
    /**
     * Execute a property-based test by generating random inputs and asserting properties.
     * 
     * @param callable $generator A callable that accepts (\Faker\Generator $faker, int $iteration) and returns test input
     * @param callable $assertion A callable that accepts the generated input and runs assertions
     * @param int $iterations Number of times to run the test with different generated inputs (default: 100)
     * @return void
     */
    protected function forAll(callable $generator, callable $assertion, int $iterations = 100): void
    {
        $faker = FakerFactory::create();

        for ($i = 0; $i < $iterations; $i++) {
            $input = $generator($faker, $i);
            $assertion($input);
        }
    }
}
