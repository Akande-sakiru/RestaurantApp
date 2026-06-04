import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '@/Components/UI/Button';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('profile');

    const { data: profileData, setData: setProfileData, patch: patchProfile, processing: profileProcessing, errors: profileErrors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        putPassword(route('profile.password'), {
            onSuccess: () => reset(),
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <GuestLayout>
            <Head title="Profile" />

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 py-12 md:py-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            My Profile
                        </h1>
                        <p className="text-orange-100">
                            Manage your account settings and preferences
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex gap-4 mb-8 border-b border-gray-200"
                    >
                        <motion.button
                            variants={itemVariants}
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                                activeTab === 'profile'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <User className="inline mr-2" size={18} />
                            Profile Information
                        </motion.button>
                        <motion.button
                            variants={itemVariants}
                            onClick={() => setActiveTab('password')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                                activeTab === 'password'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Lock className="inline mr-2" size={18} />
                            Change Password
                        </motion.button>
                    </motion.div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-lg shadow-lg p-6 md:p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Account Information
                            </h2>

                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Enter your full name"
                                    />
                                    {profileErrors.name && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {profileErrors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData('email', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Enter your email"
                                    />
                                    {profileErrors.email && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {profileErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Email Verification Notice */}
                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                        <p className="text-sm text-yellow-800">
                                            Your email address is unverified.
                                        </p>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={profileProcessing}
                                        isLoading={profileProcessing}
                                        className="flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <motion.div
                            key="password"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-lg shadow-lg p-6 md:p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Change Password
                            </h2>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData('current_password', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Enter your current password"
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {passwordErrors.current_password}
                                        </p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Enter your new password"
                                    />
                                    {passwordErrors.password && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {passwordErrors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Confirm your new password"
                                    />
                                    {passwordErrors.password_confirmation && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {passwordErrors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                {/* Update Button */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={passwordProcessing}
                                        isLoading={passwordProcessing}
                                        className="flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
