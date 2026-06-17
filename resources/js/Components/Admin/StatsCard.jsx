import { motion } from 'framer-motion';

export default function StatsCard({
    title,
    value,
    icon: Icon,
    color = 'orange',
    trend,
    description,
}) {
    const colorClasses = {
        orange: {
            bg: 'bg-orange-50',
            icon: 'text-orange-500',
            border: 'border-orange-100',
        },
        blue: {
            bg: 'bg-blue-50',
            icon: 'text-blue-500',
            border: 'border-blue-100',
        },
        green: {
            bg: 'bg-green-50',
            icon: 'text-green-500',
            border: 'border-green-100',
        },
        red: {
            bg: 'bg-red-50',
            icon: 'text-red-500',
            border: 'border-red-100',
        },
    };

    const colorClass = colorClasses[color] || colorClasses.orange;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className={`${colorClass.bg} border ${colorClass.border} rounded-lg p-6 hover:shadow-lg transition-shadow`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`${colorClass.icon} bg-white p-3 rounded-lg`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span
                        className={`text-sm font-semibold px-2 py-1 rounded ${
                            trend.value > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {trend.value > 0 ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>

            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {description && (
                <p className="text-xs text-gray-500">{description}</p>
            )}
        </motion.div>
    );
}
