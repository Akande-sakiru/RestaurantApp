import { useState } from 'react';
import { MapPin, X, AlertCircle } from 'lucide-react';

/**
 * AddressAutocomplete with Google Places fallback
 * 
 * For testing/development: Set REACT_APP_USE_MOCK_GEOCODING=true in .env
 * This will use manual coordinate entry instead of Google Places API
 */
export default function AddressAutocomplete({ onAddressSelect, initialValue = '', placeholder = 'Enter your address' }) {
    const [address, setAddress] = useState(initialValue);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [mode, setMode] = useState('address'); // 'address' or 'coordinates'
    const [error, setError] = useState(null);

    // Check if we're in mock mode (for testing without Google billing)
    const useMockMode = import.meta.env.VITE_USE_MOCK_GEOCODING === 'true';

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
        setError(null);
    };

    const handleLatitudeChange = (e) => {
        setLatitude(e.target.value);
        setError(null);
    };

    const handleLongitudeChange = (e) => {
        setLongitude(e.target.value);
        setError(null);
    };

    const handleSubmit = () => {
        if (mode === 'address') {
            if (!address.trim()) {
                setError('Please enter an address');
                return;
            }
            
            if (useMockMode) {
                // For testing: show instructions
                setError('Mock Mode: Please switch to "Manual Coordinates" and enter lat/lng for testing');
            } else {
                // Real mode would use Google Places API here
                setError('Please enable Google billing to use address search');
            }
        } else {
            // Manual coordinates mode
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            if (!latitude || !longitude) {
                setError('Please enter both latitude and longitude');
                return;
            }

            if (isNaN(lat) || isNaN(lng)) {
                setError('Please enter valid numbers');
                return;
            }

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                setError('Invalid coordinates range');
                return;
            }

            // Return the coordinates
            onAddressSelect({
                address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                latitude: lat,
                longitude: lng,
                placeId: null,
            });

            // Clear form
            setLatitude('');
            setLongitude('');
            setError(null);
        }
    };

    const handleClear = () => {
        setAddress('');
        setLatitude('');
        setLongitude('');
        setError(null);
    };

    // Test coordinates for Nigeria
    const testCoordinates = [
        { name: 'Lagos (Lekki)', lat: 6.4281, lng: 3.5890 },
        { name: 'Lagos (VI)', lat: 6.4369, lng: 3.4272 },
        { name: 'Ibadan (Center)', lat: 7.3869, lng: 3.9455 },
        { name: 'Abuja (Central)', lat: 9.0765, lng: 7.3986 },
    ];

    return (
        <div className="w-full space-y-3">
            {/* Mode Selection */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setMode('address')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                        mode === 'address'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <MapPin size={16} className="inline mr-1" />
                    Address
                </button>
                <button
                    onClick={() => setMode('coordinates')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                        mode === 'coordinates'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    📍 Coordinates
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-yellow-700 font-medium">{error}</p>
                        {useMockMode && mode === 'address' && (
                            <p className="text-xs text-yellow-600 mt-1">💡 Use "Manual Coordinates" tab for testing</p>
                        )}
                    </div>
                </div>
            )}

            {/* Address Mode */}
            {mode === 'address' && (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={address}
                        onChange={handleAddressChange}
                        placeholder={placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        disabled={useMockMode}
                    />
                    {useMockMode && (
                        <p className="text-xs text-gray-500 italic">
                            ℹ️ Google Places requires billing to be enabled. Switch to "Manual Coordinates" for testing.
                        </p>
                    )}
                </div>
            )}

            {/* Coordinates Mode */}
            {mode === 'coordinates' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                min="-90"
                                max="90"
                                value={latitude}
                                onChange={handleLatitudeChange}
                                placeholder="e.g., 6.4281"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                min="-180"
                                max="180"
                                value={longitude}
                                onChange={handleLongitudeChange}
                                placeholder="e.g., 3.5890"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Test Presets */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-2">🧪 Test Locations:</p>
                        <div className="space-y-1">
                            {testCoordinates.map((loc) => (
                                <button
                                    key={loc.name}
                                    onClick={() => {
                                        setLatitude(loc.lat.toString());
                                        setLongitude(loc.lng.toString());
                                    }}
                                    className="w-full text-left text-xs px-2 py-1 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                                >
                                    {loc.name}: ({loc.lat}, {loc.lng})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
                >
                    {mode === 'address' ? 'Search Address' : 'Use Coordinates'}
                </button>
                {(address || latitude || longitude) && (
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-medium mb-1">📝 Testing Guide:</p>
                <p>• Use the "Coordinates" tab to test with your restaurant location</p>
                <p>• Click test locations to auto-fill coordinates</p>
                <p>• To enable address search: Enable Google Cloud billing</p>
            </div>
        </div>
    );
}

