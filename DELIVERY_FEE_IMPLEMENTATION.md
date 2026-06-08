# Delivery Fee Implementation Guide

## Overview
This document outlines the professional implementation of distance-based delivery fees for the Restaurant App.

## Features Implemented

### 1. Distance Calculation
- **Algorithm**: Haversine Formula
- **Accuracy**: ±0.1 km for real-world distances
- **Unit**: Kilometers (practical and industry-standard)
- **Formula**: Great-circle distance between two geographic coordinates

### 2. Pricing Tiers (Nigerian Naira ₦)
```
0-2 km:        ₦500
2-5 km:        ₦1000
5-10 km:       ₦1300
10-15 km:      ₦1700
15+ km:        ₦2000 per km
```

### 3. Maximum Delivery Radius
- Default: 20 km
- Configurable per restaurant in admin panel
- Orders beyond this radius are rejected

## Database Schema Changes

### Users Table Additions
```sql
ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8) NULL;
ALTER TABLE users ADD COLUMN longitude DECIMAL(10, 8) NULL;
ALTER TABLE users ADD COLUMN max_delivery_radius_km INT DEFAULT 20;
```

### Orders Table Additions
```sql
ALTER TABLE orders ADD COLUMN customer_latitude DECIMAL(10, 8) NULL;
ALTER TABLE orders ADD COLUMN customer_longitude DECIMAL(10, 8) NULL;
ALTER TABLE orders ADD COLUMN delivery_distance_km DECIMAL(8, 2) NULL;
ALTER TABLE orders ADD COLUMN delivery_fee INT DEFAULT 0;
```

## API Endpoints

### Calculate Delivery Fee
**Endpoint**: `POST /api/delivery-fee/calculate`

**Request**:
```json
{
  "customer_latitude": 6.5244,
  "customer_longitude": 3.3792,
  "restaurant_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "distance_km": 5.2,
    "delivery_fee": 1000,
    "is_available": true,
    "max_radius_km": 20,
    "message": "Distance: 5.2km | Delivery Fee: ₦1000"
  }
}
```

### Get Pricing Tiers
**Endpoint**: `GET /api/delivery-fee/pricing-tiers`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "min_km": 0,
      "max_km": 2,
      "fee": 500,
      "is_per_km": false,
      "label": "0-2 km"
    },
    {
      "min_km": 2,
      "max_km": 5,
      "fee": 1000,
      "is_per_km": false,
      "label": "2-5 km"
    },
    ...
  ]
}
```

## Service Layer

### DeliveryFeeService
Located at: `app/Services/DeliveryFeeService.php`

**Key Methods**:

#### `calculateDistance(lat1, lon1, lat2, lon2): float`
Calculates distance using Haversine formula.

```php
$distance = $service->calculateDistance(6.5244, 3.3792, 6.5300, 3.3850);
// Returns: 0.65 (km)
```

#### `calculateDeliveryFee(distanceKm): int`
Returns delivery fee based on distance.

```php
$fee = $service->calculateDeliveryFee(5.2);
// Returns: 1000 (₦)
```

#### `isDeliveryAvailable(distanceKm, maxRadiusKm): bool`
Checks if delivery is within service radius.

```php
$available = $service->isDeliveryAvailable(5.2, 20);
// Returns: true
```

#### `getDeliveryDetails(...): array`
Complete delivery calculation in one call.

```php
$details = $service->getDeliveryDetails(
    6.5244, 3.3792,    // Restaurant lat/lon
    6.5300, 3.3850,    // Customer lat/lon
    20                 // Max radius
);
// Returns: [
//   'distance_km' => 0.65,
//   'delivery_fee' => 500,
//   'is_available' => true,
//   'max_radius_km' => 20,
//   'message' => 'Distance: 0.65km | Delivery Fee: ₦500'
// ]
```

## Implementation Steps

### For Checkout Page

#### 1. Get Customer Coordinates
```javascript
// Using Geolocation API (with user permission)
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    calculateDeliveryFee(latitude, longitude);
  }
);

// OR using Google Maps Places API
// (recommended for address autocomplete)
```

#### 2. Call Calculate Delivery Fee API
```javascript
async function calculateDeliveryFee(lat, lon) {
  const response = await fetch('/api/delivery-fee/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({
      customer_latitude: lat,
      customer_longitude: lon,
      restaurant_id: restaurantId, // Optional if authenticated
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    displayDeliveryFee(data.data);
  } else {
    showError(data.message);
  }
}
```

#### 3. Display Results
```javascript
function displayDeliveryFee(delivery) {
  if (delivery.is_available) {
    document.getElementById('delivery-fee').textContent = 
      `₦${delivery.delivery_fee}`;
    document.getElementById('distance').textContent = 
      `${delivery.distance_km} km`;
    document.getElementById('delivery-message').textContent = 
      delivery.message;
  } else {
    showOutOfRangeMessage(delivery);
  }
}
```

### For Order Creation

#### 1. Store Delivery Details
```php
$order = Order::create([
    'user_id' => auth()->id(),
    'type' => 'delivery',
    'customer_latitude' => $request->customer_latitude,
    'customer_longitude' => $request->customer_longitude,
    'delivery_distance_km' => $delivery['distance_km'],
    'delivery_fee' => $delivery['delivery_fee'],
    'delivery_address' => $request->delivery_address,
    'delivery_phone' => $request->delivery_phone,
    'total' => $subtotal + $delivery['delivery_fee'],
    // ... other fields
]);
```

#### 2. Update Order Total
```php
$total = $subtotal + $delivery_fee;
```

## Testing

### Unit Testing
Create tests in `tests/Unit/Services/DeliveryFeeServiceTest.php`:

```php
public function test_calculate_distance()
{
    $service = new DeliveryFeeService();
    $distance = $service->calculateDistance(6.5244, 3.3792, 6.5300, 3.3850);
    $this->assertGreaterThan(0, $distance);
    $this->assertLessThan(1, $distance);
}

public function test_calculate_delivery_fee()
{
    $service = new DeliveryFeeService();
    
    $fee = $service->calculateDeliveryFee(1.5);
    $this->assertEquals(500, $fee);
    
    $fee = $service->calculateDeliveryFee(5.2);
    $this->assertEquals(1000, $fee);
}
```

### API Testing
```bash
# Test delivery fee calculation
curl -X POST http://localhost/api/delivery-fee/calculate \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: token" \
  -d '{
    "customer_latitude": 6.5244,
    "customer_longitude": 3.3792
  }'

# Test pricing tiers
curl http://localhost/api/delivery-fee/pricing-tiers
```

## Admin Configuration

### Setup Restaurant Location
In Admin Dashboard → Settings:

1. **Set Restaurant Coordinates**
   - Latitude: 6.5244
   - Longitude: 3.3792
   
2. **Set Maximum Delivery Radius**
   - Default: 20 km
   - Can be adjusted per restaurant

### Get Restaurant Coordinates
1. Google Maps: Right-click on location → Copy coordinates
2. GPS Tools: Use your device's GPS
3. Geocoding API: Convert address to coordinates

## Performance Considerations

1. **Caching**: Cache pricing tiers in config
2. **Database Indexing**: Index latitude/longitude columns
3. **Accuracy**: Haversine formula is accurate enough; no real-time traffic data
4. **Rate Limiting**: Limit API calls to prevent abuse

## Future Enhancements

1. **Real-time traffic routing**: Integrate Google Maps Directions API
2. **Dynamic pricing**: Adjust fees based on demand/time
3. **Multiple restaurants**: Handle multi-restaurant orders
4. **Delivery time estimation**: Estimate based on distance/traffic
5. **Delivery partner assignment**: Assign based on location proximity

## Troubleshooting

### Invalid Coordinates
- Ensure latitude is between -90 and 90
- Ensure longitude is between -180 and 180
- Use decimal format (e.g., 6.5244, not 6°31'27"N)

### Out of Range
- Check max_delivery_radius_km setting
- Verify restaurant coordinates are correct
- Test distance calculation manually

### Fee Calculation Issues
- Check if distance is being calculated correctly
- Verify pricing tier logic
- Test with known distances

## Files Created/Modified

**Created**:
- `database/migrations/2026_06_07_000001_add_delivery_configuration_to_users_table.php`
- `app/Services/DeliveryFeeService.php`
- `app/Http/Controllers/Api/DeliveryFeeApiController.php`
- `DELIVERY_FEE_IMPLEMENTATION.md` (this file)

**Modified**:
- `app/Models/User.php` - Added fillable fields and casts
- `app/Models/Order.php` - Added fillable fields and casts
- `routes/web.php` - Added delivery fee API routes

## Support
For issues or questions, refer to the inline code documentation in each file.
