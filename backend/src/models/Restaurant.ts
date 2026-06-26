import { Schema, model, Document, Types } from 'mongoose';

export interface IOperatingHours {
  day: number; // 0=Sun .. 6=Sat
  open: string; // "09:00"
  close: string; // "23:00"
  closed?: boolean;
}

export interface IRestaurant extends Document {
  name: string;
  partnerId: string; // human-friendly e.g. 8821
  cuisines: string[];
  description?: string;
  image?: string;
  rating: number;
  ratingCount: number;
  priceForTwo?: number;
  // location
  address: string;
  city: string;
  pincode: string;
  location: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
  deliveryRadiusKm: number;
  // operations
  isOpen: boolean; // manual toggle (PRD FR-RST-05)
  isApproved: boolean; // ops approval (PRD FR-RST-01 / FR-ADM-02)
  hours: IOperatingHours[];
  minOrderValue: number;
  avgPrepTimeMins: number;
  // commercial
  commissionRate: number; // overrides platform default if set
  owner?: Types.ObjectId; // the restaurant-staff User
  createdAt: Date;
  updatedAt: Date;
}

const hoursSchema = new Schema<IOperatingHours>(
  {
    day: { type: Number, required: true },
    open: { type: String, default: '09:00' },
    close: { type: String, default: '23:00' },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    partnerId: { type: String, required: true, unique: true },
    cuisines: { type: [String], default: [], index: true },
    description: String,
    image: String,
    rating: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 0 },
    priceForTwo: Number,
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    pincode: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    deliveryRadiusKm: { type: Number, default: 6 },
    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    hours: { type: [hoursSchema], default: [] },
    minOrderValue: { type: Number, default: 0 },
    avgPrepTimeMins: { type: Number, default: 20 },
    commissionRate: { type: Number },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: '2dsphere' });

export const Restaurant = model<IRestaurant>('Restaurant', restaurantSchema);
