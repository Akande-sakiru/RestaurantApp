import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'orange',
}) {
    const colorClasses = {
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`${colorClasses[color]} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                    {trend && (
                        <div className="flex items-center space-x-1 mt-2 text-sm text-green-600">
                            <TrendingUp size={16} />
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className="p-3 bg-white rounded-lg">
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
