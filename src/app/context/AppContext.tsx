import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  Vehicle,
  Service,
  Transaction,
  ServiceItem,
} from "../types";
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { otpManager } from "../../lib/otpHelper";
import { normalizeCarInfo } from "../../lib/carService";
import { config } from "../../config";

interface AppContextType {
  user: User | null;
  vehicles: Vehicle[];
  services: Service[];
  transactions: Transaction[];
  serviceItems: ServiceItem[];
  isAuthenticated: boolean;
  loading: boolean;
  session: Session | null;
  login: (phoneNumber: string) => Promise<{ error: any }>;
  verifyOTP: (
    phoneNumber: string,
    otp: string,
  ) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  addVehicle: (vehicleInput: {
    brandFa: string;
    nameFa: string;
    modelFa?: string;
    year: number;
    plate?: string;
    currentKilometers: number;
  }) => Promise<void>;
  updateVehicle: (
    id: string,
    vehicleInput: {
      brandFa?: string;
      nameFa?: string;
      modelFa?: string;
      year?: number;
      plate?: string;
      currentKilometers?: number;
    },
  ) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addService: (
    service: Omit<Service, "id" | "createdAt">,
  ) => Promise<void>;
  updateService: (
    id: string,
    data: Partial<Service>,
  ) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addTransaction: (
    transaction: Omit<Transaction, "id">,
  ) => Promise<void>;
  getVehicleServices: (vehicleId: string) => Service[];
  getVehicleTransactions: (vehicleId: string) => Transaction[];
  loadServiceItems: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(
  undefined,
);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [serviceItems, setServiceItems] = useState<
    ServiceItem[]
  >([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!config.USE_DATABASE && user) {
      localStorage.setItem(
        "carpima_vehicles",
        JSON.stringify(vehicles),
      );
    }
  }, [vehicles, user]);

  useEffect(() => {
    if (!config.USE_DATABASE && user) {
      localStorage.setItem(
        "carpima_services",
        JSON.stringify(services),
      );
    }
  }, [services, user]);

  useEffect(() => {
    if (!config.USE_DATABASE && user) {
      localStorage.setItem(
        "carpima_transactions",
        JSON.stringify(transactions),
      );
    }
  }, [transactions, user]);

  const loadLocalData = async (userId: string) => {
    try {
      const storedUser = localStorage.getItem("carpima_user");
      const storedVehicles = localStorage.getItem(
        "carpima_vehicles",
      );
      const storedServices = localStorage.getItem(
        "carpima_services",
      );
      const storedTransactions = localStorage.getItem(
        "carpima_transactions",
      );

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
        });
      }

      if (storedVehicles) {
        setVehicles(
          JSON.parse(storedVehicles).map((v: any) => ({
            ...v,
            createdAt: new Date(v.createdAt),
            updatedAt: v.updatedAt
              ? new Date(v.updatedAt)
              : undefined,
          })),
        );
      }

      if (storedServices) {
        setServices(
          JSON.parse(storedServices).map((s: any) => ({
            ...s,
            serviceDate: new Date(s.serviceDate),
            createdAt: new Date(s.createdAt),
          })),
        );
      }

      if (storedTransactions) {
        setTransactions(
          JSON.parse(storedTransactions).map((t: any) => ({
            ...t,
            date: new Date(t.date),
          })),
        );
      }
    } catch (error) {
      console.error("Error loading local data:", error);
    }
  };

  const loadUserData = async (userId: string) => {
    if (!config.USE_DATABASE) {
      await loadLocalData(userId);
      return;
    }

    try {
      const { data: userData, error: userError } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

      if (userError && userError.code !== "PGRST116")
        throw userError;

      if (userData) {
        console.log("✅ User loaded:", userData.phone_number);
        setUser({
          id: userData.id,
          phoneNumber: userData.phone_number,
          firstName: userData.first_name,
          lastName: userData.last_name,
          province: userData.province,
          city: userData.city,
          createdAt: new Date(userData.created_at),
        });
      } else {
        console.log("❌ No userData found for userId:", userId);
      }

      const { data: vehiclesData, error: vehiclesError } =
        await supabase
          .from("vehicles")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

      if (vehiclesError) throw vehiclesError;

      if (vehiclesData) {
        setVehicles(
          vehiclesData.map((v) => ({
            id: v.id,
            userId: v.user_id,
            brandFa: v.brand_fa,
            brandEn: v.brand_en,
            nameFa: v.name_fa,
            nameEn: v.name_en,
            modelFa: v.model_fa,
            modelEn: v.model_en,
            displayNameFa: v.display_name_fa,
            normalizedNameEn: v.normalized_name_en,
            year: v.production_year,
            plate: v.plate_number,
            currentKilometers: v.current_km,
            imageUrl: v.image_url,
            simpleImageQueryFa: v.simple_image_query_fa,
            imageSource: v.image_source,
            confidence: v.confidence,
            needsReview: v.needs_review,
            createdAt: new Date(v.created_at),
            updatedAt: v.updated_at
              ? new Date(v.updated_at)
              : undefined,
          })),
        );
      }

      const vehicleIds = vehiclesData?.map((v) => v.id) || [];
      if (vehicleIds.length > 0) {
        // به جای services.vehicle_id
        const { data: servicesData, error: servicesError } =
          await supabase
            .from("user_vehicle_services")
            .select("*")
            .eq("user_id", userId)
            .order("service_date", { ascending: false });

        if (!servicesError && servicesData) {
          setServices(
            servicesData.map((s) => ({
              id: s.id,
              vehicleId: s.vehicle_id,
              type: s.service_type || "",
              currentKilometers: s.current_km_at_service,
              nextServiceKilometers: 0, // باید از product بیاد
              serviceDate: new Date(s.service_date),
              notes: s.notes,
              cost: 0,
              createdAt: new Date(s.created_at),
            })),
          );
        }
      }

      const {
        data: transactionsData,
        error: transactionsError,
      } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (!transactionsError && transactionsData) {
        setTransactions(
          transactionsData.map((t) => ({
            id: t.id,
            vehicleId: t.vehicle_id,
            serviceId: t.service_id,
            amount: t.amount,
            date: new Date(t.date),
            description: t.description,
            status: t.type === "expense" ? "paid" : "pending",
          })),
        );
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const initializeAuth = async () => {
    try {
      const storedUserId = localStorage.getItem(
        "carpima_user_id",
      );
      if (storedUserId) {
        await loadUserData(storedUserId);
      }
      if (config.USE_DATABASE) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user && !storedUserId) {
          await loadUserData(session.user.id);
        }
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber: string) => {
    try {
      if (!config.USE_DATABASE) {
        const code = otpManager.generateOTP(phoneNumber);
        console.log("🔐 کد OTP (Local):", code);
        return { error: null };
      }
      const { data, error } = await supabase.rpc("create_otp", {
        p_phone_number: phoneNumber,
      });
      if (error) {
        console.warn("Database error, using fallback:", error);
        const code = otpManager.generateOTP(phoneNumber);
        console.log("🔐 کد OTP (Fallback):", code);
        return { error: null };
      }
      if (data && data.length > 0 && data[0].code) {
        console.log("🔐 کد OTP (Database):", data[0].code);
      }
      return { error: null };
    } catch (error) {
      console.warn("Error, using fallback:", error);
      const code = otpManager.generateOTP(phoneNumber);
      console.log("🔐 کد OTP (Fallback):", code);
      return { error: null };
    }
  };

  const verifyOTP = async (
    phoneNumber: string,
    otp: string,
  ) => {
    try {
      if (!config.USE_DATABASE) {
        const result = otpManager.verifyOTP(phoneNumber, otp);
        if (!result.success) {
          return { error: { message: result.error } };
        }
        const fakeUserId = `local_${phoneNumber}`;
        localStorage.setItem("carpima_user_id", fakeUserId);
        localStorage.setItem("carpima_phone", phoneNumber);
        const devUser: User = {
          id: fakeUserId,
          phoneNumber: phoneNumber,
          createdAt: new Date(),
        };
        setUser(devUser);
        localStorage.setItem(
          "carpima_user",
          JSON.stringify(devUser),
        );
        await loadLocalData(fakeUserId);
        return { error: null };
      }

      const { data, error } = await supabase.rpc(
        "verify_otp_and_login",
        {
          p_phone_number: phoneNumber,
          p_code: otp,
        },
      );

      if (
        error ||
        !data ||
        data.length === 0 ||
        !data[0].success
      ) {
        const result = otpManager.verifyOTP(phoneNumber, otp);
        if (!result.success) {
          return {
            error: {
              message: data?.[0]?.error || result.error,
            },
          };
        }
        const fakeUserId = `local_${phoneNumber}`;
        localStorage.setItem("carpima_user_id", fakeUserId);
        localStorage.setItem("carpima_phone", phoneNumber);
        const devUser: User = {
          id: fakeUserId,
          phoneNumber: phoneNumber,
          createdAt: new Date(),
        };
        setUser(devUser);
        localStorage.setItem(
          "carpima_user",
          JSON.stringify(devUser),
        );
        await loadLocalData(fakeUserId);
        return { error: null };
      }

      const userId = data[0].user_id;
      localStorage.setItem("carpima_user_id", userId);

      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!profileCheck) {
        await supabase
          .from("profiles")
          .insert({ id: userId, phone_number: phoneNumber });
      }

      await loadUserData(userId);
      console.log("✅ verifyOTP success, userId:", userId);
      return { error: null };
    } catch (error) {
      console.warn("Error, using fallback:", error);
      const result = otpManager.verifyOTP(phoneNumber, otp);
      if (!result.success) {
        return { error: { message: result.error } };
      }
      const fakeUserId = `local_${phoneNumber}`;
      localStorage.setItem("carpima_user_id", fakeUserId);
      const devUser: User = {
        id: fakeUserId,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
      };
      setUser(devUser);
      await loadLocalData(fakeUserId);
      return { error: null };
    }
  };

  const logout = async () => {
    localStorage.removeItem("carpima_user_id");
    localStorage.removeItem("carpima_phone");
    localStorage.removeItem("carpima_user");
    localStorage.removeItem("carpima_vehicles");
    localStorage.removeItem("carpima_services");
    localStorage.removeItem("carpima_transactions");
    if (config.USE_DATABASE) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setVehicles([]);
    setServices([]);
    setTransactions([]);
    setSession(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    if (!config.USE_DATABASE) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(
        "carpima_user",
        JSON.stringify(updatedUser),
      );
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        province: userData.province,
        city: userData.city,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) {
      console.warn("Error updating user, using local:", error);
    }
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
  };

  const addVehicle = async (vehicleInput: {
    brandFa: string;
    nameFa: string;
    modelFa?: string;
    year: number;
    plate?: string;
    currentKilometers: number;
  }) => {
    if (!user) return;
    try {
      const normalizedData = await normalizeCarInfo(
        user.id,
        vehicleInput.nameFa,
        vehicleInput.brandFa,
      );

      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        userId: user.id,
        brandFa: normalizedData.car.brand_fa,
        brandEn: normalizedData.car.brand_en,
        nameFa: normalizedData.car.name_fa,
        nameEn: normalizedData.car.name_en,
        modelFa: normalizedData.car.model_fa,
        modelEn: normalizedData.car.model_en,
        displayNameFa: normalizedData.car.display_name_fa,
        normalizedNameEn: normalizedData.car.normalized_name_en,
        year: vehicleInput.year,
        plate: vehicleInput.plate,
        currentKilometers: vehicleInput.currentKilometers,
        imageUrl: normalizedData.car.image_url,
        simpleImageQueryFa:
          normalizedData.car.simple_image_query_fa,
        imageSource: normalizedData.car.image_source,
        confidence: normalizedData.car.confidence,
        needsReview: normalizedData.car.needs_review,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!config.USE_DATABASE) {
        setVehicles([...vehicles, newVehicle]);
        return;
      }

      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          user_id: user.id,
          brand_fa: newVehicle.brandFa,
          brand_en: newVehicle.brandEn,
          name_fa: newVehicle.nameFa,
          name_en: newVehicle.nameEn,
          model_fa: newVehicle.modelFa,
          model_en: newVehicle.modelEn,
          display_name_fa: newVehicle.displayNameFa,
          normalized_name_en: newVehicle.normalizedNameEn,
          production_year: newVehicle.year,
          current_km: newVehicle.currentKilometers,
          plate_number: newVehicle.plate,
          image_url: newVehicle.imageUrl,
          simple_image_query_fa: newVehicle.simpleImageQueryFa,
          image_source: newVehicle.imageSource,
          confidence: newVehicle.confidence,
          needs_review: newVehicle.needsReview,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.warn(
          "Error saving to database, using local:",
          error,
        );
        setVehicles([...vehicles, newVehicle]);
      } else if (data) {
        setVehicles([
          ...vehicles,
          { ...newVehicle, id: data.id },
        ]);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  const updateVehicle = async (
    id: string,
    vehicleInput: {
      brandFa?: string;
      nameFa?: string;
      modelFa?: string;
      year?: number;
      plate?: string;
      currentKilometers?: number;
    },
  ) => {
    if (!user) return;
    try {
      const existingVehicle = vehicles.find((v) => v.id === id);
      if (!existingVehicle) return;

      let updatedData: Partial<Vehicle> = {
        year: vehicleInput.year,
        plate: vehicleInput.plate,
        currentKilometers: vehicleInput.currentKilometers,
        updatedAt: new Date(),
      };

      if (vehicleInput.nameFa || vehicleInput.brandFa) {
        const normalizedData = await normalizeCarInfo(
          user.id,
          vehicleInput.nameFa || existingVehicle.nameFa,
          vehicleInput.brandFa || existingVehicle.brandFa,
        );
        updatedData = {
          ...updatedData,
          brandFa: normalizedData.car.brand_fa,
          brandEn: normalizedData.car.brand_en,
          nameFa: normalizedData.car.name_fa,
          nameEn: normalizedData.car.name_en,
          modelFa: normalizedData.car.model_fa,
          modelEn: normalizedData.car.model_en,
          displayNameFa: normalizedData.car.display_name_fa,
          normalizedNameEn:
            normalizedData.car.normalized_name_en,
          imageUrl: normalizedData.car.image_url,
          simpleImageQueryFa:
            normalizedData.car.simple_image_query_fa,
          imageSource: normalizedData.car.image_source,
          confidence: normalizedData.car.confidence,
          needsReview: normalizedData.car.needs_review,
        };
      }

      if (!config.USE_DATABASE) {
        setVehicles(
          vehicles.map((v) =>
            v.id === id ? { ...v, ...updatedData } : v,
          ),
        );
        return;
      }

      const { error } = await supabase
        .from("vehicles")
        .update({
          brand_fa: updatedData.brandFa,
          brand_en: updatedData.brandEn,
          name_fa: updatedData.nameFa,
          name_en: updatedData.nameEn,
          model_fa: updatedData.modelFa,
          model_en: updatedData.modelEn,
          display_name_fa: updatedData.displayNameFa,
          normalized_name_en: updatedData.normalizedNameEn,
          production_year: updatedData.year,
          current_km: updatedData.currentKilometers,
          plate_number: updatedData.plate,
          image_url: updatedData.imageUrl,
          simple_image_query_fa: updatedData.simpleImageQueryFa,
          image_source: updatedData.imageSource,
          confidence: updatedData.confidence,
          needs_review: updatedData.needsReview,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.warn(
          "Error updating in database, using local:",
          error,
        );
      }
      setVehicles(
        vehicles.map((v) =>
          v.id === id ? { ...v, ...updatedData } : v,
        ),
      );
    } catch (error) {
      console.error("Error updating vehicle:", error);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!config.USE_DATABASE) {
      setVehicles(vehicles.filter((v) => v.id !== id));
      setServices(services.filter((s) => s.vehicleId !== id));
      setTransactions(
        transactions.filter((t) => t.vehicleId !== id),
      );
      return;
    }
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);
    if (error) {
      console.warn(
        "Error deleting from database, using local:",
        error,
      );
    }
    setVehicles(vehicles.filter((v) => v.id !== id));
    setServices(services.filter((s) => s.vehicleId !== id));
    setTransactions(
      transactions.filter((t) => t.vehicleId !== id),
    );
  };

  const addService = async (
    service: Omit<Service, "id" | "createdAt">,
  ) => {
    if (!user) return;

    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    if (!config.USE_DATABASE) {
      setServices([...services, newService]);
      return;
    }

    const { data, error } = await supabase
      .from("user_vehicle_services")
      .insert({
        user_id: user.id,
        vehicle_id: service.vehicleId,
        service_id: service.serviceId, // باید از فرم بیاد
        service_date: service.serviceDate.toISOString(),
        current_km_at_service: service.currentKilometers,
        notes: service.notes,
      })
      .select()
      .maybeSingle();
    if (error) {
      console.warn(
        "Error saving to database, using local:",
        error,
      );
      setServices([...services, newService]);
    } else if (data) {
      setServices([
        ...services,
        { ...newService, id: data.id },
      ]);
    }
  };

  const updateService = async (
    id: string,
    data: Partial<Service>,
  ) => {
    if (!config.USE_DATABASE) {
      setServices(
        services.map((s) =>
          s.id === id ? { ...s, ...data } : s,
        ),
      );
      return;
    }
    const { error } = await supabase
      .from("services")
      .update({
        service_type: data.type,
        km_at_service: data.currentKilometers,
        next_service_km: data.nextServiceKilometers,
        date: data.serviceDate?.toISOString(),
        notes: data.notes,
        cost: data.cost,
      })
      .eq("id", id);
    if (error) {
      console.warn(
        "Error updating in database, using local:",
        error,
      );
    }
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, ...data } : s,
      ),
    );
  };

  const deleteService = async (id: string) => {
    if (!config.USE_DATABASE) {
      setServices(services.filter((s) => s.id !== id));
      return;
    }
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);
    if (error) {
      console.warn(
        "Error deleting from database, using local:",
        error,
      );
    }
    setServices(services.filter((s) => s.id !== id));
  };

  const addTransaction = async (
    transaction: Omit<Transaction, "id">,
  ) => {
    if (!user) return;
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    if (!config.USE_DATABASE) {
      setTransactions([...transactions, newTransaction]);
      return;
    }
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        vehicle_id: transaction.vehicleId,
        service_id: transaction.serviceId,
        amount: transaction.amount,
        date: transaction.date.toISOString(),
        description: transaction.description,
        type:
          transaction.status === "paid" ? "expense" : "income",
      })
      .select()
      .maybeSingle();
    if (error) {
      console.warn(
        "Error saving to database, using local:",
        error,
      );
      setTransactions([...transactions, newTransaction]);
    } else if (data) {
      setTransactions([
        ...transactions,
        { ...newTransaction, id: data.id },
      ]);
    }
  };

  const getVehicleServices = (vehicleId: string) =>
    services.filter((s) => s.vehicleId === vehicleId);
  const getVehicleTransactions = (vehicleId: string) =>
    transactions.filter((t) => t.vehicleId === vehicleId);

  const loadServiceItems = async () => {
    if (!config.USE_DATABASE) {
      setServiceItems([
        { id: "1", nameFa: "تعویض روغن", nameEn: "Oil Change" },
        {
          id: "2",
          nameFa: "تعویض فیلتر روغن",
          nameEn: "Oil Filter Change",
        },
        {
          id: "3",
          nameFa: "تعویض فیلتر هوا",
          nameEn: "Air Filter Change",
        },
        {
          id: "4",
          nameFa: "تعویض فیلتر کابین",
          nameEn: "Cabin Filter Change",
        },
        {
          id: "5",
          nameFa: "تعویض تسمه تایم",
          nameEn: "Timing Belt Change",
        },
      ]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name_fa", { ascending: true });
      if (error) throw error;
      if (data) {
        setServiceItems(
          data.map((s) => ({
            id: s.id,
            nameFa: s.name_fa,
            nameEn: s.name_en,
            imageUrl: s.image_url,
            createdAt: s.created_at
              ? new Date(s.created_at)
              : undefined,
            updatedAt: s.updated_at
              ? new Date(s.updated_at)
              : undefined,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading service items:", error);
    }
  };

  const refreshData = async () => {
    const storedUserId = localStorage.getItem(
      "carpima_user_id",
    );
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
    serviceItems,
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
    loadServiceItems,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};