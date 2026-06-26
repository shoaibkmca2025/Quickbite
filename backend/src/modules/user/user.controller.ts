import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import * as service from './user.service';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.sub;
}

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.updateProfile(uid(req), req.body), 'Profile updated');
});

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.listAddresses(uid(req)), 'Addresses');
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  return created(res, await service.addAddress(uid(req), req.body), 'Address added');
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.updateAddress(uid(req), req.params.addrId, req.body), 'Address updated');
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await service.deleteAddress(uid(req), req.params.addrId), 'Address deleted');
});
