import { motion } from 'framer-motion';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    ChefHat,
    Truck,
} from 'lucide-react';

const statusConfig = {
    pending: {
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: Clock,
        label: 'Pending',
    },
    confirmed: {
        color: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: CheckCircle,
        label: 'Confirmed',
    },
    preparing: {
        color: 'bg-purple-100',
        textColor: 'text-purple-800',
        icon: ChefHat,
        label: 'Preparing',
    },
    ready: {
        color: 'bg-green-100',
        textColor: 'text-green-800',
        icon: AlertCircle,
        label: 'Ready',
    },
    completed: {
        color: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: CheckCircle,
        label: 'Completed',
    },
    cancelled: {
        color: 'bg-red-100',
        textColor: 'text-red-800',
        icon: XCircle,
        label: 'Cancelled',
    },
};

export default function OrderStatusBadge({ status = 'pending', size = 'md' }) {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${config.color} ${config.textColor} ${sizeClasses[size]} rounded-full font-semibold inline-flex items-center gap-2 w-fit`}
        >
            <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
            <span>{config.label}</span>
        </motion.div>
    );
}
