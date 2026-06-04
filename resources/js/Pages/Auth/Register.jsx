import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                {/* Form Section - Left Side */}
                <div className="w-full lg:w-2/5 flex items-center justify-center lg:mr-12">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                            <p className="mt-1 text-sm text-gray-600">Join us and start ordering</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="username"
                                    onChange={(e) => setData("email", e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone Number" />
                                <TextInput
                                    id="phone"
                                    name="phone"
                                    value={data.phone}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="tel"
                                    onChange={(e) => setData("phone", e.target.value)}
                                    required
                                />
                                <InputError message={errors.phone} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="new-password"
                                    onChange={(e) => setData("password", e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData("password_confirmation", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <PrimaryButton 
                                    disabled={processing}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition"
                                >
                                    Create Account
                                </PrimaryButton>

                                <div className="text-center">
                                    <p className="text-xs text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                            href={route("login")}
                                            className="text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Image Section - Right Side */}
                <div className="hidden lg:flex lg:w-2/5 bg-cover bg-center rounded-lg overflow-hidden shadow-lg" style={{
                    backgroundImage: "url('/images/recipe.jpg')",
                    height: '500px'
                }}>
                    <div className="w-full bg-black bg-opacity-20"></div>
                </div>
            </div>
        </>
    );
}
