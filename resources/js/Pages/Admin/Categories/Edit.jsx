import { useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';

export default function EditCategory({ category }) {
    const { data, setData, post, processing, errors } = useForm({
        name: category.name || '',
        description: category.description || '',
        sort_order: category.sort_order || 0,
        image: null,
        _method: 'PATCH',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/admin/categories/${category.id}`, {
            forceFormData: true,
            onSuccess: () => {
                // Success handled by Inertia redirect
            },
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
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/admin/categories">
                            <motion.button
                                whileHover={{ x: -2 }}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Categories
                            </motion.button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Category
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Update details for {category.name}
                        </p>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white rounded-lg shadow-lg overflow-hidden"
                    >
                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-8 py-6">
                            <h2 className="text-2xl font-bold text-white">
                                Category Details
                            </h2>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                            {/* Name */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </motion.div>

                            {/* Description */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Brief description of this category"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </motion.div>

                            {/* Image Upload */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Category Image
                                </label>
                                {category.image_path && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                                        <img
                                            src={`/storage/${category.image_path}`}
                                            alt={category.name}
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                        className="hidden"
                                        id="image-input"
                                    />
                                    <label htmlFor="image-input" className="cursor-pointer block">
                                        <div className="text-gray-600">
                                            <p className="text-sm font-medium mb-1">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 5MB (optional)
                                            </p>
                                        </div>
                                    </label>
                                    {data.image && (
                                        <p className="text-sm text-green-600 mt-2">
                                            ✓ {data.image.name}
                                        </p>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="text-sm text-red-500">{errors.image}</p>
                                )}
                            </motion.div>

                            {/* Sort Order */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData('sort_order', e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500">
                                    Lower numbers appear first
                                </p>
                            </motion.div>

                            {/* Info Box */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                            >
                                <p className="text-sm text-orange-800">
                                    <span className="font-semibold">Note:</span> Changing this category name will update the menu for all customers.
                                </p>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                variants={itemVariants}
                                className="flex gap-4 pt-6 border-t border-gray-200"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-3 px-6 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Updating...' : 'Update Category'}
                                </motion.button>
                                <Link href="/admin/categories">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
