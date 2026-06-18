import { forwardRef } from 'react';
import clsx from 'clsx';

const Select = forwardRef(
    (
        {
            label,
            error,
            options = [],
            placeholder,
            className,
            containerClassName,
            size = 'md',
            ...props
        },
        ref
    ) => {
        const sizeClasses = {
            sm: 'px-2 sm:px-3 py-1 text-xs sm:text-sm',
            md: 'px-3 sm:px-4 py-2 text-sm sm:text-base',
            lg: 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg',
        };

        return (
            <div className={clsx('w-full', containerClassName)}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={clsx(
                        'w-full border border-gray-300 rounded-lg',
                        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                        'transition-all duration-200',
                        'font-medium cursor-pointer',
                        'appearance-none bg-white',
                        sizeClasses[size],
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled hidden>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value || option}
                            value={option.value || option}
                            className="text-xs sm:text-sm py-1 px-2"
                        >
                            {option.label || option}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
