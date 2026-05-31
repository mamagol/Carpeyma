import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Vehicle, Service, Transaction } from '../types';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  vehicles: Vehicle[];
  services: Service[];
  transactions: Transaction[];
  isAuthenticated: boolean;
  loading: boolean;
  session: Session | null;
  login: (phoneNumber: string) => Promise<{ error: any }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  getVehicleServices: (vehicleId: string) => Service[];
  getVehicleTransactions: (vehicleId: string) => Transaction[];
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // بارگذاری داده‌های کاربر
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // بررسی userId در localStorage
      const storedUserId = localStorage.getItem('carpima_user_id');

      if (storedUserId) {
        // بارگذاری اطلاعات کاربر
        await loadUserData(storedUserId);
      }

      // همچنین session Supabase را بررسی می‌کنیم (در صورت وجود)
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user && !storedUserId) {
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // بارگذاری اطلاعات کاربر از جدول profiles
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      if (userData) {
        setUser({
          id: userData.id,
          phoneNumber: userData.phone_number,
          firstName: userData.first_name,
          lastName: userData.last_name,
          createdAt: new Date(userData.created_at),
        });
      }

      // بارگذاری خودروها
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      if (vehiclesData) {
        setVehicles(vehiclesData.map(v => ({
          id: v.id,
          userId: v.user_id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          plate: v.plate,
          currentKilometers: v.current_km,
          createdAt: new Date(v.created_at),
        })));
      }

      // بارگذاری سرویس‌ها
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .in('vehicle_id', vehiclesData?.map(v => v.id) || [])
        .order('service_date', { ascending: false });

      if (servicesError) throw servicesError;

      if (servicesData) {
        setServices(servicesData.map(s => ({
          id: s.id,
          vehicleId: s.vehicle_id,
          type: s.service_type as any,
          currentKilometers: s.km_at_service,
          nextServiceKilometers: s.next_service_km,
          serviceDate: new Date(s.date),
          notes: s.notes,
          cost: s.cost,
          createdAt: new Date(s.created_at),
        })));
      }

      // بارگذاری تراکنش‌ها
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      if (transactionsData) {
        setTransactions(transactionsData.map(t => ({
          id: t.id,
          vehicleId: t.vehicle_id,
          serviceId: t.service_id,
          amount: t.amount,
          date: new Date(t.date),
          description: t.description,
          status: t.type === 'expense' ? 'paid' : 'pending',
        })));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (phoneNumber: string) => {
    try {
      // فراخوانی function برای ایجاد OTP
      const { data, error } = await supabase.rpc('create_otp', {
        p_phone_number: phoneNumber,
      });

      if (error) {
        console.error('Error creating OTP:', error);
        return { error };
      }

      // در محیط توسعه، کد OTP را در console نمایش می‌دهیم
      if (process.env.NODE_ENV === 'development' && data?.code) {
        console.log('🔐 کد OTP:', data.code);
      }

      return { error: null };
    } catch (error) {
      console.error('Error in login:', error);
      return { error };
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      // فراخوانی function برای بررسی OTP و ایجاد/ورود کاربر
      const { data, error } = await supabase.rpc('verify_otp_and_login', {
        p_phone_number: phoneNumber,
        p_code: otp,
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        return { error };
      }

      if (!data?.success) {
        return { error: { message: data?.error || 'خطا در تایید کد' } };
      }

      // ذخیره userId در localStorage
      localStorage.setItem('carpima_user_id', data.user_id);

      // بارگذاری اطلاعات کاربر
      await loadUserData(data.user_id);

      return { error: null };
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      return { error };
    }
  };

  const logout = async () => {
    // پاک کردن userId از localStorage
    localStorage.removeItem('carpima_user_id');

    // خروج از Supabase Auth (در صورت وجود session)
    await supabase.auth.signOut();

    // پاک کردن state
    setUser(null);
    setVehicles([]);
    setServices([]);
    setTransactions([]);
    setSession(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ...userData });
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        plate: vehicle.plate,
        current_km: vehicle.currentKilometers,
      })
      .select()
      .single();

    if (!error && data) {
      const newVehicle: Vehicle = {
        id: data.id,
        userId: data.user_id,
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: data.plate,
        currentKilometers: data.current_km,
        createdAt: new Date(data.created_at),
      };
      setVehicles([...vehicles, newVehicle]);
    }
  };

  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    const { error } = await supabase
      .from('vehicles')
      .update({
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: data.plate,
        current_km: data.currentKilometers,
      })
      .eq('id', id);

    if (!error) {
      setVehicles(vehicles.map(v => v.id === id ? { ...v, ...data } : v));
    }
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (!error) {
      setVehicles(vehicles.filter(v => v.id !== id));
      setServices(services.filter(s => s.vehicleId !== id));
      setTransactions(transactions.filter(t => t.vehicleId !== id));
    }
  };

  const addService = async (service: Omit<Service, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        vehicle_id: service.vehicleId,
        service_type: service.type,
        km_at_service: service.currentKilometers,
        next_service_km: service.nextServiceKilometers,
        date: service.serviceDate.toISOString(),
        notes: service.notes,
        cost: service.cost,
      })
      .select()
      .single();

    if (!error && data) {
      const newService: Service = {
        id: data.id,
        vehicleId: data.vehicle_id,
        type: data.service_type,
        currentKilometers: data.km_at_service,
        nextServiceKilometers: data.next_service_km,
        serviceDate: new Date(data.date),
        notes: data.notes,
        cost: data.cost,
        createdAt: new Date(data.created_at),
      };
      setServices([...services, newService]);
    }
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    const { error } = await supabase
      .from('services')
      .update({
        service_type: data.type,
        km_at_service: data.currentKilometers,
        next_service_km: data.nextServiceKilometers,
        date: data.serviceDate?.toISOString(),
        notes: data.notes,
        cost: data.cost,
      })
      .eq('id', id);

    if (!error) {
      setServices(services.map(s => s.id === id ? { ...s, ...data } : s));
    }
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (!error) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        vehicle_id: transaction.vehicleId,
        service_id: transaction.serviceId,
        amount: transaction.amount,
        date: transaction.date.toISOString(),
        description: transaction.description,
        type: transaction.status === 'paid' ? 'expense' : 'income',
      })
      .select()
      .single();

    if (!error && data) {
      const newTransaction: Transaction = {
        id: data.id,
        vehicleId: data.vehicle_id,
        serviceId: data.service_id,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        status: data.type === 'expense' ? 'paid' : 'pending',
      };
      setTransactions([...transactions, newTransaction]);
    }
  };

  const getVehicleServices = (vehicleId: string) => {
    return services.filter(s => s.vehicleId === vehicleId);
  };

  const getVehicleTransactions = (vehicleId: string) => {
    return transactions.filter(t => t.vehicleId === vehicleId);
  };

  const refreshData = async () => {
    const storedUserId = localStorage.getItem('carpima_user_id');
    if (storedUserId) {
      await loadUserData(storedUserId);
    } else if (session?.user) {
      await loadUserData(session.user.id);
    }
  };

  const value: AppContextType = {
    user,
    vehicles,
    services,
    transactions,
    isAuthenticated: !!user,
    loading,
    session,
    login,
    verifyOTP,
    logout,
    updateUser,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addService,
    updateService,
    deleteService,
    addTransaction,
    getVehicleServices,
    getVehicleTransactions,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
