import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Button = forwardRef(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            disabled = false,
            isLoading = false,
            className,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary:
                'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
            secondary:
                'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
            danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
            ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
            outline:
                'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                disabled={disabled || isLoading}
                className={clsx(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
