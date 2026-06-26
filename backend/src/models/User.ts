import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, Role, RIDER_STATUSES, RiderStatus } from '../utils/constants';

export interface IAddress {
  _id?: Types.ObjectId;
  label: string; // Home, Work, ...
  line: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
  instructions?: string;
}

export interface IRiderProfile {
  status: RiderStatus;
  vehicle?: string;
  licenseNo?: string;
  area?: string;
  rating: number;
  totalTrips: number;
  lastLocation?: { lat: number; lng: number; at: Date };
}

export interface IUser extends Document {
  name: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  role: Role;
  avatar?: string;
  addresses: IAddress[];
  /** restaurant-staff accounts link to the restaurant they manage */
  restaurant?: Types.ObjectId;
  rider?: IRiderProfile;
  isActive: boolean;
  notificationPrefs: { push: boolean; sms: boolean; email: boolean };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: 'Home' },
    line: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: Number,
    lng: Number,
    isDefault: { type: Boolean, default: false },
    instructions: String,
  },
  { _id: true }
);

const riderProfileSchema = new Schema<IRiderProfile>(
  {
    status: { type: String, enum: RIDER_STATUSES, default: 'offline' },
    vehicle: String,
    licenseNo: String,
    area: String,
    rating: { type: Number, default: 5 },
    totalTrips: { type: Number, default: 0 },
    lastLocation: {
      lat: Number,
      lng: Number,
      at: Date,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, sparse: true, unique: true },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ROLES, default: 'customer', index: true },
    avatar: String,
    addresses: { type: [addressSchema], default: [] },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    rider: { type: riderProfileSchema, default: undefined },
    isActive: { type: Boolean, default: true },
    notificationPrefs: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

/** Helper used by services to hash a password before save. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = model<IUser>('User', userSchema);
