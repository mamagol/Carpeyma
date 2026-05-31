import { useEffect, useState } from 'react';
import { supabase, User, Vehicle, Service, Transaction } from './supabase';
import { Session } from '@supabase/supabase-js';

// هوک برای مدیریت احراز هویت
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // دریافت session فعلی
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // گوش دادن به تغییرات احراز هویت
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithOTP = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { error };
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    session,
    user,
    loading,
    signInWithOTP,
    verifyOTP,
    signOut,
  };
}

// هوک برای دریافت خودروهای کاربر
export function useVehicles(userId?: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadVehicles();
    }
  }, [userId]);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return { vehicles, loading, reload: loadVehicles };
}

// هوک برای دریافت سرویس‌های یک خودرو
export function useServices(vehicleId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      loadServices();
    }
  }, [vehicleId]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  return { services, loading, reload: loadServices };
}

// هوک برای دریافت تراکنش‌های کاربر
export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return { transactions, loading, reload: loadTransactions };
}
