import { PlateNumber } from '../app/types';

/**
 * تبدیل پلاک از رشته به object
 * فرمت: "xx $ yyy zz"
 */
export function parsePlate(plateString?: string): PlateNumber | null {
  if (!plateString) return null;

  const parts = plateString.split(' ');
  if (parts.length !== 4) return null;

  return {
    section1: parts[0] || '',
    letter: parts[1] || '',
    section2: parts[2] || '',
    section3: parts[3] || '',
  };
}

/**
 * تبدیل پلاک از object به رشته
 * فرمت: "xx $ yyy zz"
 */
export function formatPlate(plate: PlateNumber): string {
  return `${plate.section1} ${plate.letter} ${plate.section2} ${plate.section3}`;
}

/**
 * اعتبارسنجی پلاک
 */
export function validatePlate(plate: PlateNumber): boolean {
  // بررسی section1 (2 رقمی)
  if (!/^\d{2}$/.test(plate.section1)) return false;

  // بررسی letter (یک کاراکتر فارسی)
  if (!plate.letter || plate.letter.length !== 1) return false;

  // بررسی section2 (3 رقمی)
  if (!/^\d{3}$/.test(plate.section2)) return false;

  // بررسی section3 (2 رقمی)
  if (!/^\d{2}$/.test(plate.section3)) return false;

  return true;
}

/**
 * لیست حروف مجاز برای پلاک
 */
export const PLATE_LETTERS = [
  'الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'د', 'ز', 'س', 'ش',
  'ص', 'ط', 'ع', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن',
  'و', 'ه', 'ی'
];
