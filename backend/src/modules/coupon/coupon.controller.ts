import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created } from '../../utils/response';
import * as service from './coupon.service';

export const listOffers = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.listActiveOffers(req.query.restaurantId as string | undefined);
  return ok(res, data, 'Active offers');
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await service.listAllCoupons(), 'Coupons');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  return created(res, await service.createCoupon(req.body), 'Coupon created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.updateCoupon(req.params.id, req.body), 'Coupon updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.deleteCoupon(req.params.id), 'Coupon deleted');
});
