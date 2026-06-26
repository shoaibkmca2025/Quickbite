import { Response } from 'express';

export function ok<T>(res: Response, data: T, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function created<T>(res: Response, data: T, message = 'Created') {
  return ok(res, data, message, 201);
}

export function paginated<T>(
  res: Response,
  items: T[],
  meta: { page: number; limit: number; total: number },
  message = 'OK'
) {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    meta: {
      ...meta,
      pages: Math.max(1, Math.ceil(meta.total / meta.limit)),
    },
  });
}
