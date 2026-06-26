import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, paginated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import * as service from './restaurant.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const { items, total } = await service.listRestaurants(req.query as never);
  return paginated(res, items, { page: Number(page), limit: Number(limit), total });
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getRestaurantWithMenu(req.params.id);
  return ok(res, data, 'Restaurant detail');
});

export const reviews = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.listReviews(req.params.id);
  return ok(res, data, 'Reviews');
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.registerRestaurant(req.body);
  return created(res, data, 'Restaurant registered — pending approval');
});

function requireRestaurant(req: Request): string {
  const id = req.user?.restaurantId;
  if (!id) throw ApiError.forbidden('No restaurant linked to this account');
  return id;
}

export const myRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getRestaurantWithMenu(requireRestaurant(req));
  return ok(res, data, 'My restaurant');
});

export const updateMine = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.updateRestaurant(requireRestaurant(req), req.body);
  return ok(res, data, 'Restaurant updated');
});

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getDashboardStats(requireRestaurant(req));
  return ok(res, data, 'Dashboard stats');
});

export const earnings = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.getEarnings(requireRestaurant(req));
  return ok(res, data, 'Earnings');
});
