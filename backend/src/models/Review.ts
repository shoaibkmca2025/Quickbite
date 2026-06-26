import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  restaurant: Types.ObjectId;
  rider?: Types.ObjectId;
  foodRating: number; // 1..5
  deliveryRating?: number; // 1..5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rider: { type: Schema.Types.ObjectId, ref: 'User' },
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);
