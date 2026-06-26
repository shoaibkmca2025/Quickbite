import { Schema, model, Document, Types } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: 'flat' | 'percent';
  value: number; // flat amount or percent (0..100)
  maxDiscount?: number; // cap for percent coupons
  minOrderValue: number;
  validFrom?: Date;
  validTo?: Date;
  usageLimit?: number; // total redemptions allowed
  usageCount: number;
  perUserLimit?: number;
  restaurant?: Types.ObjectId; // null => platform-wide
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ['flat', 'percent'], required: true },
    value: { type: Number, required: true },
    maxDiscount: Number,
    minOrderValue: { type: Number, default: 0 },
    validFrom: Date,
    validTo: Date,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    perUserLimit: Number,
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = model<ICoupon>('Coupon', couponSchema);
