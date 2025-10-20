import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import menuRoutes from './public/menu';
import locationRoutes from './public/location';
import orderRoutes from './public/orders';
import getOrderDetail from './public/order-detail';
import adminAuthRoute from './admin/auth';
import adminMenuRoute from './admin/menu';
import adminOrderRoute from './admin/orders';

const app = new Hono();

// Route publik
app.route('/api/v1/menu', menuRoutes);
app.route('/api/v1/location-check', locationRoutes);
app.route('/api/v1/orders', orderRoutes);
app.get('/api/v1/orders/:order_uid', getOrderDetail);

// Route admin login - TANPA otentikasi
app.route('/api/v1/admin/login', adminAuthRoute);

// Route admin yang dilindungi - dengan otentikasi
// Cara ini memberlakukan middleware hanya pada path tertentu, bukan termasuk login
const adminApp = new Hono();
adminApp.use('*', authMiddleware); // terapkan otentikasi ke semua route di bawah ini
adminApp.route('/menu', adminMenuRoute);
adminApp.route('/orders', adminOrderRoute);

// Gabungkan aplikasi admin yang dilindungi ke aplikasi utama
app.route('/api/v1/admin', adminApp);

export default app;