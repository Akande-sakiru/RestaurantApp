import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

export default function SearchInput({
    value = '',
    onChange,
    placeholder = 'Search dishes...',
}) {
    return (
        <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search Menu
            </label>
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {value && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => onChange('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </motion.button>
                )}
            </div>
        </div>
    );
}
