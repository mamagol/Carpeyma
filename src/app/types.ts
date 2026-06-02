export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  province?: string;
  city?: string;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  userId: string;
  brandFa?: string;
  brandEn?: string;
  nameFa: string;
  nameEn?: string;
  modelFa?: string;
  modelEn?: string;
  displayNameFa?: string;
  normalizedNameEn?: string;
  year: number;
  plate?: string;
  currentKilometers: number;
  imageUrl?: string;
  simpleImageQueryFa?: string;
  imageSource?: string;
  confidence?: number;
  needsReview?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// تایپ برای پاسخ webhook
export interface NormalizeCarResponse {
  success: boolean;
  user_id: string;
  car: {
    brand_fa?: string;
    brand_en?: string;
    name_fa: string;
    name_en?: string;
    model_fa?: string;
    model_en?: string;
    display_name_fa?: string;
    normalized_name_en?: string;
    image_url?: string;
    simple_image_query_fa?: string;
    image_source?: string;
    confidence?: number;
    needs_review?: boolean;
  };
}

// تایپ برای پلاک خودرو
export interface PlateNumber {
  section1: string; // xx
  letter: string;   // $
  section2: string; // yyy
  section3: string; // zz
}

export type ServiceType = 
  | 'engine-oil'
  | 'oil-filter'
  | 'air-filter'
  | 'cabin-filter'
  | 'timing-belt'
  | 'other';

export interface Service {
  id: string;
  vehicleId: string;
  type: ServiceType;
  currentKilometers: number;
  nextServiceKilometers: number;
  serviceDate: Date;
  notes?: string;
  cost?: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  vehicleId: string;
  serviceId?: string;
  amount: number;
  date: Date;
  description: string;
  status: 'paid' | 'pending';
}

export type ServiceStatus = 'normal' | 'warning' | 'urgent';

export const SERVICE_TYPES: Record<ServiceType, string> = {
  'engine-oil': 'روغن موتور',
  'oil-filter': 'فیلتر روغن',
  'air-filter': 'فیلتر هوا',
  'cabin-filter': 'فیلتر کابین',
  'timing-belt': 'تسمه تایم',
  'other': 'سایر',
};

// تایپ برای سرویس‌های سیستم (از جدول public.services)
export interface ServiceItem {
  id: string;
  nameFa: string;
  nameEn: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// تایپ برای محصول پیشنهادی
export interface RecommendedProduct {
  productNameFa: string;
  productBrandFa: string;
  productCategoryFa: string;
  imageUrl?: string;
  productSearchQueryFa?: string;
  replacementAfterMonths?: number;
  usableKm?: {
    min: number;
    max: number;
  };
  nextServiceKm?: number;
  specs?: {
    viscosity?: string;
    oilType?: string;
    volumeLiter?: number;
    standard?: string;
    [key: string]: any;
  };
  reasonFa?: string;
  confidence?: number;
  needsReview?: boolean;
}

// تایپ برای پاسخ webhook پیشنهاد محصول
export interface RecommendProductsResponse {
  success: boolean;
  user_id: string;
  service_name: string;
  vehicle: {
    brand_fa?: string;
    name_fa?: string;
    model_fa?: string;
    year: number;
    current_km: number;
    city?: string;
  };
  products: Array<{
    product_name_fa: string;
    product_brand_fa: string;
    product_category_fa: string;
    image_url?: string;
    product_search_query_fa?: string;
    replacement_after_months?: number;
    usable_km?: {
      min: number;
      max: number;
    };
    next_service_km?: number;
    specs?: any;
    reason_fa?: string;
    confidence?: number;
    needs_review?: boolean;
  }>;
}

// تایپ برای رکورد سرویس کاربر
export interface UserVehicleService {
  id: string;
  userId: string;
  vehicleId: string;
  serviceId: string;
  serviceDate: Date;
  currentKmAtService: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
