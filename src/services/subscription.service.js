import prisma from '../lib/prisma.js';
import z from 'zod';

export const subscribe_user_to_package = async (user_id, package_id) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user) {
    throw new Error('User not found');
  }
  // Check if package exists
  const package = await prisma.package.findUnique({ where: { id: package_id } });
  if (!package) {
    throw new Error('Package not found');
  }
  // Subscribe user to package
  return await prisma.subscription.create({
    data: {
      userId: user_id,
      packageId: package_id,
    },
  });
};