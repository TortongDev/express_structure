import prisma from '../lib/prisma.js';
import z from 'zod';

// ── Validation schema ──────────────────────────────────────────────────────────
const postPackageSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price:       z.number().positive(),
});

// ── Service ────────────────────────────────────────────────────────────────────
export const post_package = async (name, description, price) => {
  // validate — throws ZodError if invalid
  const data = postPackageSchema.parse({ name, description, price });

  const pkg = await prisma.package.create({ data });
  return pkg;
};
export const list_packages = async () => {
  const packages = await prisma.package.findMany();
  return packages;
}