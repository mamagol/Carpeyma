import { ServiceType } from '../types';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  specifications: string[];
  imageUrl: string;
  brand?: string;
}

export const PRODUCTS: Record<ServiceType, Product[]> = {
  'engine-oil': [
    {
      id: 'oil-1',
      name: 'روغن موتور سینتتیک ۵W-۳۰',
      brand: 'کاسترول',
      price: 1500000,
      description: 'روغن موتور تمام سینتتیک با کیفیت بالا برای خودروهای مدرن',
      specifications: [
        'ویسکوزیته: ۵W-۳۰',
        'نوع: تمام سینتتیک',
        'حجم: ۴ لیتر',
        'مناسب برای: خودروهای بنزینی و دیزلی',
        'استاندارد: API SN, ACEA A3/B4',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1727233432251-b254881e01a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvciUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NzE5MTU1NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'oil-2',
      name: 'روغن موتور نیمه سینتتیک ۱۰W-۴۰',
      brand: 'موبیل',
      price: 950000,
      description: 'روغن موتور نیمه سینتتیک با محافظت عالی در برابر سایش',
      specifications: [
        'ویسکوزیته: ۱۰W-۴۰',
        'نوع: نیمه سینتتیک',
        'حجم: ۴ لیتر',
        'مناسب برای: خودروهای بنزینی',
        'استاندارد: API SL, ACEA A3/B3',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1590227763209-821c686b932f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aGV0aWMlMjBlbmdpbmUlMjBvaWx8ZW58MXx8fHwxNzcyMDAwMjAxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'oil-3',
      name: 'روغن موتور معدنی ۲۰W-۵۰',
      brand: 'شل',
      price: 650000,
      description: 'روغن موتور معدنی مناسب برای خودروهای قدیمی',
      specifications: [
        'ویسکوزیته: ۲۰W-۵۰',
        'نوع: معدنی',
        'حجم: ۴ لیتر',
        'مناسب برای: خودروهای کارکرده',
        'استاندارد: API SJ',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1727233432251-b254881e01a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvciUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NzE5MTU1NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ],
  'oil-filter': [
    {
      id: 'filter-oil-1',
      name: 'فیلتر روغن اصلی',
      brand: 'بوش',
      price: 250000,
      description: 'فیلتر روغن اصلی با کیفیت بالا و عمر طولانی',
      specifications: [
        'نوع: اسپین آن',
        'کارایی فیلتراسیون: ۹۸٪',
        'ضمانت: ۱۰,۰۰۰ کیلومتر',
        'ساخت: آلمان',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1764869427688-3e97480f4b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBvaWwlMjBmaWx0ZXJ8ZW58MXx8fHwxNzcyMDAwMjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'filter-oil-2',
      name: 'فیلتر روغن متا',
      brand: 'متا',
      price: 180000,
      description: 'فیلتر روغن با کیفیت خوب و قیمت مناسب',
      specifications: [
        'نوع: اسپین آن',
        'کارایی فیلتراسیون: ۹۵٪',
        'ضمانت: ۸,۰۰۰ کیلومتر',
        'ساخت: ایران',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1764869427688-3e97480f4b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBvaWwlMjBmaWx0ZXJ8ZW58MXx8fHwxNzcyMDAwMjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ],
  'air-filter': [
    {
      id: 'filter-air-1',
      name: 'فیلتر هوای اصلی',
      brand: 'مان فیلتر',
      price: 320000,
      description: 'فیلتر هوای اصلی با قدرت تصفیه بالا',
      specifications: [
        'نوع: کاغذی',
        'کارایی فیلتراسیون: ۹۹٪',
        'ضمانت: ۱۵,۰۰۰ کیلومتر',
        'ساخت: آلمان',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1627828984312-0edb069fa988?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBhaXIlMjBmaWx0ZXJ8ZW58MXx8fHwxNzcyMDAwMjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'filter-air-2',
      name: 'فیلتر هوای استاندارد',
      brand: 'سرکان',
      price: 220000,
      description: 'فیلتر هوای با کیفیت مناسب',
      specifications: [
        'نوع: کاغذی',
        'کارایی فیلتراسیون: ۹۶٪',
        'ضمانت: ۱۲,۰۰۰ کیلومتر',
        'ساخت: ترکیه',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1627828984312-0edb069fa988?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBhaXIlMjBmaWx0ZXJ8ZW58MXx8fHwxNzcyMDAwMjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ],
  'cabin-filter': [
    {
      id: 'filter-cabin-1',
      name: 'فیلتر کابین کربن اکتیو',
      brand: 'بوش',
      price: 450000,
      description: 'فیلتر کابین با کربن فعال برای حذف بو و آلودگی',
      specifications: [
        'نوع: کربن اکتیو',
        'کارایی فیلتراسیون: ۹۹٪',
        'ویژگی: ضد بو و آلرژی',
        'ضمانت: ۲۰,۰۰۰ کیلومتر',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1692708028037-f68bcd2a9615?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWJpbiUyMGFpciUyMGZpbHRlcnxlbnwxfHx8fDE3NzIwMDAyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'filter-cabin-2',
      name: 'فیلتر کابین استاندارد',
      brand: 'هپکو',
      price: 280000,
      description: 'فیلتر کابین استاندارد با کیفیت مناسب',
      specifications: [
        'نوع: کاغذی',
        'کارایی فیلتراسیون: ۹۵٪',
        'ضمانت: ۱۵,۰۰۰ کیلومتر',
        'ساخت: ایران',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1692708028037-f68bcd2a9615?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWJpbiUyMGFpciUyMGZpbHRlcnxlbnwxfHx8fDE3NzIwMDAyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ],
  'timing-belt': [
    {
      id: 'belt-1',
      name: 'تسمه تایم اصلی',
      brand: 'گیتس',
      price: 1800000,
      description: 'تسمه تایم اصلی با دوام بالا',
      specifications: [
        'نوع: تقویت شده',
        'عمر: ۱۰۰,۰۰۰ کیلومتر',
        'ضمانت: ۲ سال',
        'ساخت: آمریکا',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1767884162326-54d3e26d444a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1pbmclMjBiZWx0JTIwYXV0b21vdGl2ZXxlbnwxfHx8fDE3NzIwMDAyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'belt-2',
      name: 'تسمه تایم متا',
      brand: 'متا',
      price: 1200000,
      description: 'تسمه تایم با کیفیت مناسب',
      specifications: [
        'نوع: استاندارد',
        'عمر: ۸۰,۰۰۰ کیلومتر',
        'ضمانت: ۱ سال',
        'ساخت: ایران',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1767884162326-54d3e26d444a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1pbmclMjBiZWx0JTIwYXV0b21vdGl2ZXxlbnwxfHx8fDE3NzIwMDAyMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ],
  'other': [
    {
      id: 'other-1',
      name: 'سایر خدمات',
      price: 0,
      description: 'سایر خدمات نگهداری خودرو',
      specifications: ['قیمت‌گذاری دستی'],
      imageUrl: 'https://images.unsplash.com/photo-1727233432251-b254881e01a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvciUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NzE5MTU1NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ],
};
