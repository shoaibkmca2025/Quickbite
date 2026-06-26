import { Schema, model, Document, Types } from 'mongoose';
import {
  ORDER_STATUSES,
  OrderStatus,
  PAYMENT_METHODS,
  PaymentMethod,
  PAYMENT_STATUSES,
  PaymentStatus,
} from '../utils/constants';

export interface IOrderItemOption {
  groupName: string;
  label: string;
  priceDelta: number;
}

export interface IOrderItem {
  menuItem: Types.ObjectId;
  name: string; // snapshot
  unitPrice: number; // snapshot of base price
  quantity: number;
  options: IOrderItemOption[];
  lineTotal: number; // (unitPrice + options) * qty
  isVeg?: boolean;
}

export interface IStatusEvent {
  status: OrderStatus;
  at: Date;
  by?: string; // role/actor label
  note?: string;
}

export interface IOrder extends Document {
  code: string; // ORD-9925
  customer: Types.ObjectId;
  restaurant: Types.ObjectId;
  rider?: Types.ObjectId;
  items: IOrderItem[];
  // bill (PRD FR-CART-03)
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  commission: number;
  restaurantEarning: number;
  coupon?: { code: string; discount: number };
  // delivery
  deliveryAddress: {
    label?: string;
    line: string;
    city: string;
    pincode: string;
    lat?: number;
    lng?: number;
    instructions?: string;
  };
  // payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  payment?: Types.ObjectId;
  // lifecycle
  status: OrderStatus;
  statusHistory: IStatusEvent[];
  prepTimeMins?: number;
  etaAt?: Date;
  placedAt?: Date;
  deliveredAt?: Date;
  cancelledReason?: string;
  rating?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    options: {
      type: [
        new Schema<IOrderItemOption>(
          {
            groupName: String,
            label: String,
            priceDelta: { type: Number, default: 0 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    lineTotal: { type: Number, required: true },
    isVeg: Boolean,
  },
  { _id: false }
);

const statusEventSchema = new Schema<IStatusEvent>(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    by: String,
    note: String,
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    code: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rider: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    items: { type: [orderItemSchema], required: true },
    itemTotal: { type: Number, required: true },
    packagingFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    restaurantEarning: { type: Number, default: 0 },
    coupon: { code: String, discount: Number },
    deliveryAddress: {
      label: String,
      line: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      lat: Number,
      lng: Number,
      instructions: String,
    },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending', index: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending_payment', index: true },
    statusHistory: { type: [statusEventSchema], default: [] },
    prepTimeMins: Number,
    etaAt: Date,
    placedAt: Date,
    deliveredAt: Date,
    cancelledReason: String,
    rating: { type: Schema.Types.ObjectId, ref: 'Review' },
  },
  { timestamps: true }
);

orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });

export const Order = model<IOrder>('Order', orderSchema);
