import { Types } from 'mongoose';
import { User, IAddress } from '../../models/User';
import { ApiError } from '../../utils/ApiError';

type AddressArray = Types.DocumentArray<IAddress & Types.Subdocument>;

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (updates.name !== undefined) user.name = updates.name as string;
  if (updates.avatar !== undefined) user.avatar = updates.avatar as string;
  if (updates.email !== undefined) user.email = updates.email as string;
  if (updates.notificationPrefs) {
    user.notificationPrefs = { ...user.notificationPrefs, ...(updates.notificationPrefs as object) };
  }
  await user.save();
  return user.toJSON();
}

export async function listAddresses(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user.addresses;
}

export async function addAddress(userId: string, address: IAddress) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (address.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
  }
  user.addresses.push(address);
  await user.save();
  return user.addresses;
}

export async function updateAddress(userId: string, addrId: string, updates: Partial<IAddress>) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const addr = (user.addresses as unknown as AddressArray).id(addrId);
  if (!addr) throw ApiError.notFound('Address not found');
  if (updates.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, updates);
  await user.save();
  return user.addresses;
}

export async function deleteAddress(userId: string, addrId: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const addr = (user.addresses as unknown as AddressArray).id(addrId);
  if (!addr) throw ApiError.notFound('Address not found');
  addr.deleteOne();
  await user.save();
  return user.addresses;
}
