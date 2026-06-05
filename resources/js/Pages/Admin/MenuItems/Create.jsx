import { useForm, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import AdminLayout from "../../../Layouts/AdminLayout";
import { ArrowLeft, Upload } from "lucide-react";
import { useState, useEffect } from "react";

export default function CreateMenuItem({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        category_id: "",
        price: "",
        image: null,
        is_available: "yes",
        sort_order: 0,
    });
    const [currentCategories, setCurrentCategories] = useState(categories);
    const [previewImage, setPreviewImage] = useState(null);

    // Reload categories when component mounts or when categories prop changes
    useEffect(() => {
        setCurrentCategories(categories);
    }, [categories]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("image", file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/admin/menu-items", {
            forceFormData: true,
            onSuccess: () => {
                // Success handled by Inertia redirect
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/admin/menu-items">
                            <motion.button
                                whileHover={{ x: -2 }}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Menu Items
                            </motion.button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Add New Menu Item
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Create a new menu item for your restaurant
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
                                Menu Item Details
                            </h2>
                        </div>

                        {/* Form Body */}
                        <form
                            onSubmit={handleSubmit}
                            className="p-6 md:p-8 space-y-6"
                        >
                            {/* Image Upload */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-3"
                            >
                                <label className="block text-sm font-semibold text-gray-700">
                                    Item Image
                                </label>
                                <div className="flex gap-6">
                                    {/* Upload Area */}
                                    <div className="flex-1">
                                        <label className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-colors cursor-pointer bg-gray-50 hover:bg-orange-50 group">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                disabled={processing}
                                            />
                                            <div className="text-center">
                                                <Upload className="mx-auto mb-3 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                                <p className="text-sm font-medium text-gray-700">
                                                    Click to upload image
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PNG, JPG, GIF up to 5MB
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Image Preview */}
                                    {previewImage && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-orange-200"
                                        >
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="text-sm text-red-500">
                                        {errors.image}
                                    </p>
                                )}
                            </motion.div>

                            {/* Name */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <label className="block text-sm font-semibold text-gray-700">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="e.g., Grilled Salmon"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </motion.div>

                            {/* Description */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-2"
                            >
                                <label className="block text-sm font-semibold text-gray-700">
                                    Description *
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Describe the dish in detail..."
                                    required
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </motion.div>

                            {/* Category and Price */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Category *
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) =>
                                            setData(
                                                "category_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">
                                            Select a category
                                        </option>
                                        {currentCategories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Price (₦) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData("price", e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-500">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Availability and Sort Order */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_available === "yes"}
                                            onChange={(e) =>
                                                setData(
                                                    "is_available",
                                                    e.target.checked ? "yes" : "no"
                                                )
                                            }
                                            className="w-5 h-5 text-orange-500 rounded cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">
                                            Available for order
                                        </span>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) =>
                                            setData(
                                                "sort_order",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
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
                                    {processing ? "Creating..." : "Create Item"}
                                </motion.button>
                                <Link href="/admin/menu-items">
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
