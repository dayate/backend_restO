import { Hono } from 'hono';

const app = new Hono();

// Fungsi untuk menghitung jarak menggunakan rumus haversine
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Jarak dalam meter
};

// Lokasi restoran (ini harus disesuaikan dengan lokasi sebenarnya)
const RESTAURANT_LOCATION = {
  lat: -6.200000, // Contoh: Jakarta
  long: 106.816666
};

// POST /api/v1/location-check - Validasi lokasi pelanggan
app.post('/', async (c) => {
  try {
    const { lat, long } = await c.req.json();

    // Validasi input
    if (typeof lat !== 'number' || typeof long !== 'number') {
      return c.json({
        isValid: false,
        message: 'Invalid coordinates provided. Latitude and longitude must be numbers.'
      }, 400);
    }

    // Hitung jarak antara lokasi pelanggan dan restoran
    const distance = calculateDistance(
      lat,
      long,
      RESTAURANT_LOCATION.lat,
      RESTAURANT_LOCATION.long
    );

    // Radius maksimum dalam meter (50 meter sesuai dokumentasi)
    const MAX_RADIUS = 50;

    if (distance <= MAX_RADIUS) {
      return c.json({
        isValid: true,
        message: `Lokasi valid, jarak dari restoran: ${distance.toFixed(2)} meter`
      });
    } else {
      return c.json({
        isValid: false,
        message: `Lokasi tidak valid, terlalu jauh dari restoran. Jarak: ${distance.toFixed(2)} meter (maksimal ${MAX_RADIUS} meter)`
      }, 400);
    }
  } catch (error) {
    console.error('Error validating location:', error);
    return c.json({
      isValid: false,
      message: 'Failed to validate location',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;