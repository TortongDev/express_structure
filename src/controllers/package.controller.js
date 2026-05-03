import { post_package, list_packages } from '../services/package.service.js';
import { ZodError } from 'zod';

export const showCreatePackage = (req, res) => {
  return res.render('package/create', { error: null });
};

export const ejsPostPackage = async (req, res) => {
  const { name, description, price } = req.body;
  try {
    await post_package(name, description, Number(price));
    return res.redirect('/packages');
  } catch (err) {
    if (err instanceof ZodError) {
      const error = err.errors.map(e => e.message).join(', ');
      return res.render('package/create', { error });
    }
    console.error('[package] ejsPostPackage:', err);
    return res.render('package/create', { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
  }
};
export const listPackages = async (req, res) => {
    try {
        const packages = await list_packages();
        return res.render('package/list', { packages });
    } catch (err) {
        console.error('[package] listPackages:', err);
        return res.render('package/list', { packages: [], error: 'เกิดข้อผิดพลาดในการโหลดแพ็กเกจ' });
    }
}