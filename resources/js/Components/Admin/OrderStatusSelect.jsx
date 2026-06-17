import { motion } from 'framer-motion';
import {
    Clock,
    CheckCircle,
    ChefHat,
    AlertCircle,
    XCircle,
} from 'lucide-react';

const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'blue' },
    { value: 'preparing', label: 'Preparing', icon: ChefHat, color: 'purple' },
    { value: 'ready', label: 'Ready', icon: AlertCircle, color: 'green' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'gray' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
];

export default function OrderStatusSelect({
    value = 'pending',
    onChange,
    disabled = false,
}) {
    const currentStatus = statusOptions.find((s) => s.value === value);
    const Icon = currentStatus?.icon || Clock;

    const colorClasses = {
        yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
        green: 'bg-green-100 text-green-700 hover:bg-green-200',
        red: 'bg-red-100 text-red-700 hover:bg-red-200',
        gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };

    return (
        <div className="relative inline-block w-full group">
            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={disabled}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2 border-gray-200 ${
                    currentStatus
                        ? colorClasses[currentStatus.color]
                        : 'bg-gray-50 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <Icon size={18} />
                <span>{currentStatus?.label}</span>
            </motion.button>

            {/* Dropdown Menu */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 hidden group-hover:block z-10 w-full"
            >
                {statusOptions.map((status) => {
                    const StatusIcon = status.icon;
                    const isSelected = value === status.value;

                    return (
                        <motion.button
                            key={status.value}
                            whileHover={{ x: 4 }}
                            onClick={() => onChange(status.value)}
                            disabled={disabled}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                isSelected
                                    ? colorClasses[status.color]
                                    : 'text-gray-700 hover:bg-gray-50'
                            } disabled:opacity-50`}
                        >
                            <StatusIcon size={18} />
                            <span className="font-medium">{status.label}</span>
                            {isSelected && (
                                <span className="ml-auto text-lg">✓</span>
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
