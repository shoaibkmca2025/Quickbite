import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import * as riderService from './rider.service';
import * as orderService from '../order/order.service';

function riderId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.sub;
}

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await riderService.setStatus(riderId(req), req.body.status), 'Status updated');
});

export const assignments = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await riderService.getAssignments(riderId(req)), 'Assignments');
});

export const claim = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await orderService.riderClaimOrder(riderId(req), req.params.id), 'Order claimed');
});

export const pickedUp = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await orderService.riderTransition(riderId(req), req.params.id, 'picked_up'), 'Picked up');
});

export const outForDelivery = asyncHandler(async (req: Request, res: Response) => {
  return ok(
    res,
    await orderService.riderTransition(riderId(req), req.params.id, 'out_for_delivery'),
    'Out for delivery'
  );
});

export const delivered = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await orderService.riderTransition(riderId(req), req.params.id, 'delivered'), 'Delivered');
});

export const location = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await riderService.updateLocation(riderId(req), req.body), 'Location updated');
});

export const earnings = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await riderService.getEarnings(riderId(req)), 'Earnings');
});
