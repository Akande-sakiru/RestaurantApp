import { motion } from 'framer-motion';
import clsx from 'clsx';

export const Card = ({ children, className, hover = true, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -4 } : {}}
            className={clsx(
                'bg-white rounded-lg shadow-md border border-gray-100',
                'transition-all duration-200',
                hover && 'hover:shadow-lg',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ children, className }) => (
    <div className={clsx('px-6 py-4 border-b border-gray-100', className)}>
        {children}
    </div>
);

export const CardBody = ({ children, className }) => (
    <div className={clsx('px-6 py-4', className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
    <div className={clsx('px-6 py-4 border-t border-gray-100', className)}>
        {children}
    </div>
);
