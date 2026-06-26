import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/response';
import * as service from './admin.service';
import { OrderStatus } from '../../utils/constants';

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await service.overview(), 'Overview');
});

export const liveOrders = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.liveOrders(req.query.status as OrderStatus | undefined), 'Live orders');
});

export const listRestaurants = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await service.listRestaurants(), 'Restaurants');
});

export const setRestaurantStatus = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.setRestaurantStatus(req.params.id, req.body), 'Restaurant updated');
});

export const listRiders = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await service.listRiders(), 'Riders');
});

export const setUserActive = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.setUserActive(req.params.id, req.body.isActive), 'User updated');
});

export const assignRider = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.assignRider(req.params.id, req.body.riderId), 'Rider assigned');
});

export const refund = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.refund(req.params.id, req.body.reason), 'Refund initiated');
});
