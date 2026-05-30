import { forwardRef } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef(
    (
        {
            label,
            error,
            placeholder,
            className,
            containerClassName,
            rows = 4,
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
                <textarea
                    ref={ref}
                    placeholder={placeholder}
                    rows={rows}
                    className={clsx(
                        'w-full px-4 py-2 border border-gray-300 rounded-lg',
                        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                        'transition-all duration-200',
                        'placeholder-gray-400 resize-none',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
