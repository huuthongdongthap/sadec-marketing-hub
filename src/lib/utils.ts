import clsx from 'clsx';

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return clsx(inputs);
}

export function formatPrice(price: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const MEKONG_REGIONS = [
  'Sa Đéc',
  'Tam Nông',
  'Cao Lãnh',
  'Hồng Ngự',
  'Lai Vung',
  'Lấp Vò',
  'Châu Thành',
  'Tháp Mười',
  'Tân Hồng',
  'Thanh Bình',
] as const;

export type MekongRegion = typeof MEKONG_REGIONS[number];

export const EXPERIENCE_CATEGORIES = [
  'Mùa Nước Nổi',
  'Làng Hoa Sa Đéc',
  'Di Sản Kiến Trúc',
  'Ẩm Thực Bản Địa',
  'Làng Nghề Truyền Thống',
] as const;

export type ExperienceCategory = typeof EXPERIENCE_CATEGORIES[number];