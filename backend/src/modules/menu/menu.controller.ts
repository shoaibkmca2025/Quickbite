import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import * as service from './menu.service';

function rid(req: Request): string {
  const id = req.user?.restaurantId;
  if (!id) throw ApiError.forbidden('No restaurant linked to this account');
  return id;
}

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.listForRestaurant(rid(req)), 'Menu items');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  return created(res, await service.createItem(rid(req), req.body), 'Item created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.updateItem(rid(req), req.params.id, req.body), 'Item updated');
});

export const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  const item = await service.setAvailability(rid(req), req.params.id, req.body.available);
  return ok(res, item, 'Availability updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.deleteItem(rid(req), req.params.id), 'Item deleted');
});
