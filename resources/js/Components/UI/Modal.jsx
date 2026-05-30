import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={onClose}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Dialog.Panel
                                            className={`w-full ${sizes[size]} transform overflow-hidden rounded-lg bg-white shadow-xl transition-all`}
                                        >
                                            {title && (
                                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                                                        {title}
                                                    </Dialog.Title>
                                                    <button
                                                        onClick={onClose}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="px-6 py-4">
                                                {children}
                                            </div>
                                        </Dialog.Panel>
                                    </motion.div>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            )}
        </AnimatePresence>
    );
};

export default Modal;
