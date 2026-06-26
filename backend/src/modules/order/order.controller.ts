import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, paginated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import * as service from './order.service';

function customerId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.sub;
}
function restaurantId(req: Request): string {
  const id = req.user?.restaurantId;
  if (!id) throw ApiError.forbidden('No restaurant linked to this account');
  return id;
}

// ---- Customer ----
export const quote = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.quote({ ...req.body, userId: customerId(req) });
  return ok(res, data, 'Quote');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.createOrder(customerId(req), req.body);
  return created(res, data, 'Order created');
});

export const pay = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.payOrder(customerId(req), req.params.id, req.body);
  return ok(res, data, 'Payment successful');
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const { items, total } = await service.listCustomerOrders(customerId(req), page, limit);
  return paginated(res, items, { page, limit, total });
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.getOrderById(req.params.id, {
    id: req.user.sub,
    role: req.user.role,
    restaurantId: req.user.restaurantId,
  });
  return ok(res, data, 'Order detail');
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.cancelOrder(customerId(req), req.params.id, req.body.reason);
  return ok(res, data, 'Order cancelled');
});

export const review = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.reviewOrder(customerId(req), req.params.id, req.body);
  return created(res, data, 'Review submitted');
});

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.reorder(customerId(req), req.params.id);
  return ok(res, data, 'Reorder');
});

// ---- Restaurant ----
export const restaurantOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const group = req.query.group as 'active' | 'completed' | 'all';
  const { items, total } = await service.listRestaurantOrders(restaurantId(req), group, page, limit);
  return paginated(res, items, { page, limit, total });
});

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.acceptOrder(restaurantId(req), req.params.id, req.body.prepTimeMins);
  return ok(res, data, 'Order accepted');
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.rejectOrder(restaurantId(req), req.params.id, req.body.reason);
  return ok(res, data, 'Order rejected');
});

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.restaurantSetStatus(restaurantId(req), req.params.id, req.body.status);
  return ok(res, data, 'Order status updated');
});
