import { MenuItem } from '../../models/MenuItem';
import { ApiError } from '../../utils/ApiError';

export async function listForRestaurant(restaurantId: string) {
  const items = await MenuItem.find({ restaurant: restaurantId })
    .sort({ category: 1, sortOrder: 1 })
    .lean();
  const stats = {
    total: items.length,
    available: items.filter((i) => i.available).length,
    soldOut: items.filter((i) => !i.available).length,
  };
  return { items, stats };
}

export async function createItem(restaurantId: string, data: Record<string, unknown>) {
  return MenuItem.create({ ...data, restaurant: restaurantId });
}

async function ownItemOrThrow(restaurantId: string, itemId: string) {
  const item = await MenuItem.findById(itemId);
  if (!item) throw ApiError.notFound('Menu item not found');
  if (String(item.restaurant) !== restaurantId) {
    throw ApiError.forbidden('This item belongs to another restaurant');
  }
  return item;
}

export async function updateItem(
  restaurantId: string,
  itemId: string,
  data: Record<string, unknown>
) {
  const item = await ownItemOrThrow(restaurantId, itemId);
  Object.assign(item, data);
  await item.save();
  return item;
}

export async function setAvailability(restaurantId: string, itemId: string, available: boolean) {
  const item = await ownItemOrThrow(restaurantId, itemId);
  item.available = available;
  await item.save();
  return item;
}

export async function deleteItem(restaurantId: string, itemId: string) {
  const item = await ownItemOrThrow(restaurantId, itemId);
  await item.deleteOne();
  return { id: itemId };
}
