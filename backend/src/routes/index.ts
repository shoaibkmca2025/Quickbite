import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import restaurantRoutes from '../modules/restaurant/restaurant.routes';
import menuRoutes from '../modules/menu/menu.routes';
import orderRoutes from '../modules/order/order.routes';
import riderRoutes from '../modules/rider/rider.routes';
import userRoutes from '../modules/user/user.routes';
import couponRoutes from '../modules/coupon/coupon.routes';
import adminRoutes from '../modules/admin/admin.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'QuickBite API healthy' }));

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/rider', riderRoutes);
router.use('/users', userRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);

export default router;
