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
            ...props
        },
        ref
    ) => {
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
                        'w-full px-4 py-2 border border-gray-300 rounded-lg',
                        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                        'transition-all duration-200',
                        'bg-white',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="">{placeholder}</option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
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
