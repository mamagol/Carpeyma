// Helper برای مدیریت OTP در محیط Development (بدون نیاز به database functions)
import { config } from '../config';

interface OTPData {
  phoneNumber: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

class OTPManager {
  private static instance: OTPManager;
  private otps: Map<string, OTPData> = new Map();

  private constructor() {}

  static getInstance(): OTPManager {
    if (!OTPManager.instance) {
      OTPManager.instance = new OTPManager();
    }
    return OTPManager.instance;
  }

  generateOTP(phoneNumber: string): string {
    // استفاده از کد ثابت از config
    const code = config.FIXED_OTP_CODE;

    // ذخیره با زمان انقضای 5 دقیقه
    this.otps.set(phoneNumber, {
      phoneNumber,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    console.log(`🔐 کد OTP برای ${phoneNumber}: ${code}`);
    return code;
  }

  verifyOTP(phoneNumber: string, code: string): { success: boolean; error?: string } {
    const otpData = this.otps.get(phoneNumber);

    if (!otpData) {
      return { success: false, error: 'کد تایید یافت نشد' };
    }

    // بررسی انقضا
    if (Date.now() > otpData.expiresAt) {
      this.otps.delete(phoneNumber);
      return { success: false, error: 'کد تایید منقضی شده است' };
    }

    // بررسی تعداد تلاش‌ها
    if (otpData.attempts >= 5) {
      this.otps.delete(phoneNumber);
      return { success: false, error: 'تعداد تلاش‌های مجاز تمام شده است' };
    }

    // افزایش تعداد تلاش‌ها
    otpData.attempts++;

    // بررسی کد
    if (otpData.code !== code) {
      return { success: false, error: 'کد تایید اشتباه است' };
    }

    // موفقیت - پاک کردن OTP
    this.otps.delete(phoneNumber);
    return { success: true };
  }

  clearOTP(phoneNumber: string): void {
    this.otps.delete(phoneNumber);
  }
}

export const otpManager = OTPManager.getInstance();
