import { Schema, model, Document, Types } from 'mongoose';
import {
  PAYMENT_METHODS,
  PaymentMethod,
  PAYMENT_STATUSES,
  PaymentStatus,
} from '../utils/constants';

export interface IPayment extends Document {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayRef?: string;
  /** idempotency key prevents double-charge on retries (PRD NFR-REL-01) */
  idempotencyKey?: string;
  refundedAmount: number;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    gatewayRef: String,
    idempotencyKey: { type: String, index: true, sparse: true },
    refundedAmount: { type: Number, default: 0 },
    failureReason: String,
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', paymentSchema);
