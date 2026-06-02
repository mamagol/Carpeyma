import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Settings, Users, ListChecks, Pencil, Trash2, Plus, ChevronLeft } from 'lucide-react';
import { ServiceItem, User, Vehicle, UserVehicleService } from '../types';
import { supabase } from '../../lib/supabase';
import { config } from '../../config';
import { formatPlate } from '../../lib/plateHelper';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState('services');

  // Services Management
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceNameEn, setServiceNameEn] = useState('');
  const [serviceImageUrl, setServiceImageUrl] = useState('');

  // Users Management
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [userSheet, setUserSheet] = useState(false);

  // Service History
  const [allServices, setAllServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadServices();
      loadUsers();
      loadAllServiceHistory();
    }
  }, [isAuthenticated]);

  // Load services from database or localStorage
  const loadServices = async () => {
    if (config.USE_DATABASE) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name_fa', { ascending: true });

        if (error) throw error;

        setServices(
          data.map((s: any) => ({
            id: s.id,
            nameFa: s.name_fa,
            nameEn: s.name_en,
            imageUrl: s.image_url,
            createdAt: new Date(s.created_at),
            updatedAt: s.updated_at ? new Date(s.updated_at) : undefined,
          }))
        );
      } catch (error) {
        console.error('Error loading services:', error);
        loadServicesFromLocalStorage();
      }
    } else {
      loadServicesFromLocalStorage();
    }
  };

  const loadServicesFromLocalStorage = () => {
    const stored = localStorage.getItem('carpima_services');
    if (stored) {
      setServices(JSON.parse(stored));
    }
  };

  const saveService = async () => {
    if (!serviceName.trim() || !serviceNameEn.trim()) {
      toast.error('نام فارسی و انگلیسی الزامی است');
      return;
    }

    const serviceData = {
      name_fa: serviceName,
      name_en: serviceNameEn,
      image_url: serviceImageUrl || null,
    };

    if (config.USE_DATABASE) {
      try {
        if (editingService) {
          // Update
          const { error } = await supabase
            .from('services')
            .update({ ...serviceData, updated_at: new Date().toISOString() })
            .eq('id', editingService.id);

          if (error) throw error;
          toast.success('سرویس با موفقیت به‌روزرسانی شد');
        } else {
          // Insert
          const { error } = await supabase.from('services').insert([serviceData]);

          if (error) throw error;
          toast.success('سرویس با موفقیت اضافه شد');
        }
        loadServices();
      } catch (error) {
        console.error('Error saving service:', error);
        toast.error('خطا در ذخیره سرویس');
      }
    } else {
      // localStorage mode
      let updatedServices: ServiceItem[];
      if (editingService) {
        updatedServices = services.map((s) =>
          s.id === editingService.id
            ? { ...s, nameFa: serviceName, nameEn: serviceNameEn, imageUrl: serviceImageUrl }
            : s
        );
      } else {
        const newService: ServiceItem = {
          id: Date.now().toString(),
          nameFa: serviceName,
          nameEn: serviceNameEn,
          imageUrl: serviceImageUrl || undefined,
          createdAt: new Date(),
        };
        updatedServices = [...services, newService];
      }
      setServices(updatedServices);
      localStorage.setItem('carpima_services', JSON.stringify(updatedServices));
      toast.success(editingService ? 'سرویس به‌روزرسانی شد' : 'سرویس اضافه شد');
    }

    closeServiceDialog();
  };

  const deleteService = async (service: ServiceItem) => {
    if (!confirm(`آیا از حذف "${service.nameFa}" اطمینان دارید؟`)) return;

    if (config.USE_DATABASE) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', service.id);

        if (error) throw error;
        toast.success('سرویس حذف شد');
        loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('خطا در حذف سرویس');
      }
    } else {
      const updated = services.filter((s) => s.id !== service.id);
      setServices(updated);
      localStorage.setItem('carpima_services', JSON.stringify(updated));
      toast.success('سرویس حذف شد');
    }
  };

  const openServiceDialog = (service?: ServiceItem) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.nameFa);
      setServiceNameEn(service.nameEn);
      setServiceImageUrl(service.imageUrl || '');
    } else {
      setEditingService(null);
      setServiceName('');
      setServiceNameEn('');
      setServiceImageUrl('');
    }
    setServiceDialog(true);
  };

  const closeServiceDialog = () => {
    setServiceDialog(false);
    setEditingService(null);
    setServiceName('');
    setServiceNameEn('');
    setServiceImageUrl('');
  };

  // Load users
  const loadUsers = async () => {
    if (config.USE_DATABASE) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setUsers(
          data.map((u: any) => ({
            id: u.id,
            phoneNumber: u.phone_number,
            firstName: u.first_name,
            lastName: u.last_name,
            province: u.province,
            city: u.city,
            createdAt: new Date(u.created_at),
          }))
        );
      } catch (error) {
        console.error('Error loading users:', error);
      }
    } else {
      // localStorage mode - read from carpima_user
      const storedUser = localStorage.getItem('carpima_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUsers([user]);
      }
    }
  };

  const viewUserDetails = async (user: User) => {
    setSelectedUser(user);

    // Load user's vehicles
    if (config.USE_DATABASE) {
      try {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id);

        if (vehiclesError) throw vehiclesError;

        const vehicles = vehiclesData.map((v: any) => ({
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
          confidence: v.confidence,
          needsReview: v.needs_review,
          createdAt: new Date(v.created_at),
        }));

        setUserVehicles(vehicles);

        // Load service history for this user
        const { data: servicesData, error: servicesError } = await supabase
          .from('user_vehicle_services')
          .select(
            `
            *,
            vehicles(name_fa, model_fa, display_name_fa),
            services(name_fa)
          `
          )
          .eq('user_id', user.id)
          .order('service_date', { ascending: false });

        if (servicesError) throw servicesError;

        setUserServices(servicesData || []);
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    } else {
      // localStorage mode
      const storedVehicles = localStorage.getItem('carpima_vehicles');
      if (storedVehicles) {
        const vehicles = JSON.parse(storedVehicles);
        setUserVehicles(vehicles.filter((v: Vehicle) => v.userId === user.id));
      }

      const storedServices = localStorage.getItem('carpima_user_services');
      if (storedServices) {
        const services = JSON.parse(storedServices);
        setUserServices(services.filter((s: any) => s.userId === user.id));
      }
    }

    setUserSheet(true);
  };

  // Load all service history
  const loadAllServiceHistory = async () => {
    if (config.USE_DATABASE) {
      try {
        const { data, error } = await supabase
          .from('user_vehicle_services')
          .select(
            `
            *,
            profiles(phone_number, first_name, last_name),
            vehicles(name_fa, model_fa, display_name_fa, plate_number),
            services(name_fa)
          `
          )
          .order('service_date', { ascending: false });

        if (error) throw error;

        setAllServices(data || []);
        setFilteredServices(data || []);
      } catch (error) {
        console.error('Error loading service history:', error);
      }
    } else {
      // localStorage mode
      const storedServices = localStorage.getItem('carpima_user_services');
      if (storedServices) {
        const services = JSON.parse(storedServices);
        setAllServices(services);
        setFilteredServices(services);
      }
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredServices(allServices);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allServices.filter((service: any) => {
        const userName = config.USE_DATABASE
          ? `${service.profiles?.first_name || ''} ${service.profiles?.last_name || ''}`.toLowerCase()
          : '';
        const serviceName = config.USE_DATABASE ? service.services?.name_fa?.toLowerCase() || '' : '';
        const vehicleName = config.USE_DATABASE
          ? service.vehicles?.display_name_fa?.toLowerCase() || ''
          : '';

        return userName.includes(term) || serviceName.includes(term) || vehicleName.includes(term);
      });
      setFilteredServices(filtered);
    }
  }, [searchTerm, allServices]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fa-IR');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">پنل مدیریت</h1>
              <p className="text-sm text-muted-foreground">مدیریت سرویس‌ها، کاربران و تاریخچه</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="gap-2">
              <Settings className="h-4 w-4" />
              <span>مدیریت سرویس‌ها</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span>کاربران</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <ListChecks className="h-4 w-4" />
              <span>تاریخچه سرویس‌ها</span>
            </TabsTrigger>
          </TabsList>

          {/* Services Management */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>لیست سرویس‌ها</CardTitle>
                    <CardDescription>مدیریت انواع سرویس‌های سیستم</CardDescription>
                  </div>
                  <Button onClick={() => openServiceDialog()}>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن سرویس
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>تصویر</TableHead>
                      <TableHead>نام فارسی</TableHead>
                      <TableHead>نام انگلیسی</TableHead>
                      <TableHead className="text-left">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          {service.imageUrl ? (
                            <img src={service.imageUrl} alt={service.nameFa} className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <Settings className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{service.nameFa}</TableCell>
                        <TableCell className="text-muted-foreground">{service.nameEn}</TableCell>
                        <TableCell className="text-left">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => openServiceDialog(service)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteService(service)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>لیست کاربران</CardTitle>
                <CardDescription>مشاهده اطلاعات کاربران و خودروها</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شماره تماس</TableHead>
                      <TableHead>نام و نام خانوادگی</TableHead>
                      <TableHead>استان / شهر</TableHead>
                      <TableHead>تاریخ عضویت</TableHead>
                      <TableHead className="text-left">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono">{user.phoneNumber}</TableCell>
                        <TableCell>
                          {user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {user.province && user.city ? `${user.province} / ${user.city}` : '-'}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt.toISOString())}</TableCell>
                        <TableCell className="text-left">
                          <Button variant="outline" size="sm" onClick={() => viewUserDetails(user)}>
                            مشاهده جزئیات
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>تاریخچه همه سرویس‌ها</CardTitle>
                    <CardDescription>مشاهده تمام سرویس‌های انجام شده</CardDescription>
                  </div>
                  <div className="w-64">
                    <Input
                      placeholder="جستجو..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>کاربر</TableHead>
                      <TableHead>خودرو</TableHead>
                      <TableHead>نوع سرویس</TableHead>
                      <TableHead>کیلومتر</TableHead>
                      <TableHead>یادداشت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service: any) => (
                      <TableRow key={service.id}>
                        <TableCell>{formatDate(service.service_date)}</TableCell>
                        <TableCell>
                          {config.USE_DATABASE
                            ? `${service.profiles?.first_name || ''} ${service.profiles?.last_name || ''}`.trim() ||
                              service.profiles?.phone_number
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {config.USE_DATABASE ? service.vehicles?.display_name_fa || '-' : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {config.USE_DATABASE ? service.services?.name_fa || '-' : '-'}
                        </TableCell>
                        <TableCell className="font-mono">{service.current_km_at_service?.toLocaleString('fa-IR')}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {service.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Service Add/Edit Dialog */}
      <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'ویرایش سرویس' : 'افزودن سرویس جدید'}</DialogTitle>
            <DialogDescription>
              اطلاعات سرویس را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name-fa">نام فارسی *</Label>
              <Input
                id="name-fa"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="مثال: تعویض روغن موتور"
              />
            </div>
            <div>
              <Label htmlFor="name-en">نام انگلیسی *</Label>
              <Input
                id="name-en"
                value={serviceNameEn}
                onChange={(e) => setServiceNameEn(e.target.value)}
                placeholder="Example: Engine Oil Change"
              />
            </div>
            <div>
              <Label htmlFor="image-url">آدرس تصویر</Label>
              <Input
                id="image-url"
                value={serviceImageUrl}
                onChange={(e) => setServiceImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeServiceDialog}>
              لغو
            </Button>
            <Button onClick={saveService}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Sheet */}
      <Sheet open={userSheet} onOpenChange={setUserSheet}>
        <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>جزئیات کاربر</SheetTitle>
            <SheetDescription>
              {selectedUser?.firstName || selectedUser?.lastName
                ? `${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}`.trim()
                : selectedUser?.phoneNumber}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اطلاعات کاربر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">شماره تماس:</span>
                  <span className="font-mono">{selectedUser?.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نام:</span>
                  <span>{selectedUser?.firstName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نام خانوادگی:</span>
                  <span>{selectedUser?.lastName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">استان:</span>
                  <span>{selectedUser?.province || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">شهر:</span>
                  <span>{selectedUser?.city || '-'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">خودروها ({userVehicles.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userVehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">خودرویی ثبت نشده است</p>
                ) : (
                  userVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {vehicle.imageUrl ? (
                        <img src={vehicle.imageUrl} alt={vehicle.displayNameFa} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">بدون تصویر</div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{vehicle.displayNameFa || vehicle.nameFa}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.year} • {vehicle.currentKilometers.toLocaleString('fa-IR')} کیلومتر
                        </p>
                        {vehicle.plate && <p className="text-xs font-mono">{formatPlate(vehicle.plate)}</p>}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Service History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">سرویس‌های انجام شده ({userServices.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">سرویسی ثبت نشده است</p>
                ) : (
                  userServices.map((service: any) => (
                    <div key={service.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {config.USE_DATABASE ? service.services?.name_fa || 'نامشخص' : 'نامشخص'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {config.USE_DATABASE ? service.vehicles?.display_name_fa || '-' : '-'}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDate(service.service_date)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">کیلومتر: </span>
                        <span className="font-mono">{service.current_km_at_service?.toLocaleString('fa-IR')}</span>
                      </div>
                      {service.notes && (
                        <p className="text-sm text-muted-foreground">{service.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
