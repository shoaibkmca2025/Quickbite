import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/response';
import * as authService from './auth.service';
import { ApiError } from '../../utils/ApiError';

export const requestOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestOtp(req.body.phone);
  return ok(res, result, 'OTP sent');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body);
  return ok(res, result, 'Authenticated');
});

export const passwordLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.passwordLogin(req.body.email, req.body.password);
  return ok(res, result, 'Logged in');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  return ok(res, tokens, 'Token refreshed');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.getMe(req.user.sub);
  if (!user) throw ApiError.notFound('User not found');
  return ok(res, user, 'Current user');
});
