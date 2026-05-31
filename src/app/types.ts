export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  plate?: string;
  currentKilometers: number;
  createdAt: Date;
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
