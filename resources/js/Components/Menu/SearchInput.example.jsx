/**
 * SearchInput Component - Usage Examples
 * 
 * This file demonstrates how to use the SearchInput component
 * in various scenarios throughout the restaurant app.
 */

import { useState, useRef } from 'react';
import SearchInput from './SearchInput';

// Example 1: Basic usage in Menu Page
export function MenuPageExample() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Filter menu items based on query
        // This would typically trigger an Inertia visit or TanStack Query refetch
    };

    return (
        <div className="mb-6">
            <SearchInput
                placeholder="Search by name or category..."
                onSearch={handleSearch}
                debounceDelay={300}
                className="w-full max-w-md"
            />
        </div>
    );
}

// Example 2: Controlled component with ref access
export function AdminMenuSearchExample() {
    const searchRef = useRef(null);
    const [results, setResults] = useState([]);

    const handleSearch = (query) => {
        // Search through menu items
        if (query.length > 0) {
            // API call or local filter
            console.log('Searching for:', query);
        } else {
            setResults([]);
        }
    };

    const handleQuickClear = () => {
        searchRef.current?.clear();
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <SearchInput
                    ref={searchRef}
                    placeholder="Find menu items..."
                    onSearch={handleSearch}
                    debounceDelay={250}
                    className="flex-1"
                />
                <button
                    onClick={handleQuickClear}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    Reset
                </button>
            </div>
            {results.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Found {results.length} items</p>
                </div>
            )}
        </div>
    );
}

// Example 3: In a modal or dialog
export function SearchModalExample() {
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            searchRef.current?.focus();
        }
    }, [isOpen]);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                Open Search
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <SearchInput
                            ref={searchRef}
                            placeholder="What are you looking for?"
                            onSearch={(query) => {
                                // Handle search logic
                            }}
                            isFocused={true}
                            className="w-full"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

// Example 4: Real-time search with external callback
export function RealTimeSearchExample() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (query) => {
        if (query.length === 0) {
            setItems([]);
            return;
        }

        setIsLoading(true);
        try {
            // Simulate API call - in real app, this would use TanStack Query or Inertia
            const results = await fetch(`/api/menu-items?search=${query}`).then(r => r.json());
            setItems(results);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <SearchInput
                placeholder="Search 200+ menu items..."
                onSearch={handleSearch}
                debounceDelay={400}
                className="w-full"
            />

            {isLoading && <div className="text-center text-gray-500">Searching...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-orange-600 font-semibold mt-2">${item.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Component API
 * 
 * Props:
 *   - placeholder?: string (default: "Search menu items...")
 *   - onSearch?: (query: string) => void - Called after debounce delay
 *   - debounceDelay?: number (default: 300ms)
 *   - className?: string - Additional Tailwind classes
 *   - isFocused?: boolean - Auto-focus on mount
 *   - ...props - Any other input attributes (disabled, etc.)
 * 
 * Ref Methods:
 *   - focus() - Programmatically focus the input
 *   - getValue() - Get current search value
 *   - setValue(value: string) - Set value and trigger onSearch
 *   - clear() - Clear the input and trigger onSearch with empty string
 * 
 * Features:
 *   - Search icon (left)
 *   - Animated clear button (right) - appears when value is not empty
 *   - Debounced search callback (default 300ms)
 *   - Orange focus ring (focus:ring-orange-500)
 *   - Responsive width (use in flex containers)
 *   - Smooth animations and transitions
 *   - Accessible (proper ARIA labels, keyboard support)
 */
