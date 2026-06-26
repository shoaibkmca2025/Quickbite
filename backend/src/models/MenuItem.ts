import { Schema, model, Document, Types } from 'mongoose';

export interface IOptionChoice {
  label: string; // "Large"
  priceDelta: number; // +50
}

export interface IOptionGroup {
  name: string; // "Size", "Add-ons"
  required: boolean;
  multi: boolean; // allow multiple selections
  choices: IOptionChoice[];
}

export interface IMenuItem extends Document {
  restaurant: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: string; // Starters, Mains, Beverages, ...
  image?: string;
  isVeg: boolean;
  available: boolean; // sold-out toggle (PRD FR-MENU-03)
  optionGroups: IOptionGroup[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const choiceSchema = new Schema<IOptionChoice>(
  { label: { type: String, required: true }, priceDelta: { type: Number, default: 0 } },
  { _id: true }
);

const groupSchema = new Schema<IOptionGroup>(
  {
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    multi: { type: Boolean, default: false },
    choices: { type: [choiceSchema], default: [] },
  },
  { _id: true }
);

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true, index: 'text' },
    description: String,
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'Mains', index: true },
    image: String,
    isVeg: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    optionGroups: { type: [groupSchema], default: [] },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);
