import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                {/* Image Section - Left Side */}
                <div className="hidden lg:flex lg:w-2/5 bg-cover bg-center rounded-lg overflow-hidden shadow-lg" style={{
                    backgroundImage: "url('/images/recipe.jpg')",
                    height: '500px'
                }}>
                    <div className="w-full bg-black bg-opacity-20"></div>
                </div>

                {/* Form Section - Right Side */}
                <div className="w-full lg:w-2/5 flex items-center justify-center lg:ml-12">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                            <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm font-medium text-green-800">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div className="block">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData('remember', e.target.checked)
                                        }
                                    />
                                    <span className="ms-2 text-xs text-gray-600">
                                        Remember me
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <PrimaryButton 
                                    disabled={processing}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition"
                                >
                                    Sign In
                                </PrimaryButton>

                                <div className="flex items-center justify-between text-xs gap-2">
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                    <Link
                                        href={route('register')}
                                        className="text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        Create account
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
