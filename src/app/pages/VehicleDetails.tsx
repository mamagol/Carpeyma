import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../components/ui/sheet";
import { Textarea } from "../components/ui/textarea";
import { PlatePicker } from "../components/PlatePicker";
import { PlateDisplay } from "../components/PlateDisplay";
import { PersianDatePicker } from "../components/PersianDatePicker";
import { getProductRecommendations } from "../../lib/serviceRecommendation";
import {
  ArrowRight,
  Edit2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Car, // ✨ اضافه کنید
  Droplets,
  Filter,
  Wind,
  AirVent,
  Cog,
  Wrench,
  Info,
  ChevronRight,
} from "lucide-react";
import {
  ServiceStatus,
  SERVICE_TYPES,
  ServiceType,
} from "../types";

type AddServiceStep =
  | "select-service"
  | "select-product"
  | "submit";

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    user,
    vehicles,
    services,
    serviceItems,
    loadServiceItems,
    updateVehicle,
    getVehicleServices,
    deleteService,
    addService,
    addTransaction,
  } = useApp(); // ✨ user رو اضافه کنید

  useEffect(() => {
    loadServiceItems();
  }, []);

  const vehicle = vehicles.find((v) => v.id === id);
  const vehicleServices = getVehicleServices(id || "");

  const [isEditKmOpen, setIsEditKmOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] =
    useState(false);
  const [addServiceStep, setAddServiceStep] =
    useState<AddServiceStep>("select-service");
  const [selectedServiceType, setSelectedServiceType] =
    useState<ServiceType>("engine-oil");
  const [selectedProduct, setSelectedProduct] =
    useState<any>(null); // ✨ any

  const [recommendedProducts, setRecommendedProducts] =
    useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] =
    useState(false);

  const [formData, setFormData] = useState({
    brandFa: vehicle?.brandFa || "",
    nameFa: vehicle?.nameFa || "",
    modelFa: vehicle?.modelFa || "",
    year: vehicle?.year || 1405,
    currentKilometers: vehicle?.currentKilometers || 0,
  });

  const [plateData, setPlateData] = useState({
    part1: "",
    letter: "",
    part2: "",
    cityCode: "",
  });

  const [serviceFormData, setServiceFormData] = useState({
    currentKilometers: vehicle?.currentKilometers || 0,
    nextServiceKilometers:
      (vehicle?.currentKilometers || 0) + 5000,
    serviceDate: new Date(),
    notes: "",
    cost: 0,
  });

  if (!vehicle) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>خودرو یافت نشد</p>
            <Button
              onClick={() => navigate("/")}
              className="mt-4"
            >
              بازگشت به داشبورد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getServiceStatus = (
    currentKm: number,
    nextServiceKm: number,
  ): ServiceStatus => {
    const remaining = nextServiceKm - currentKm;
    if (remaining <= 0) return "urgent";
    if (remaining <= 1000) return "warning";
    return "normal";
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "warning":
        return "bg-[#f59e0b] text-white";
      case "normal":
        return "bg-[#22c55e] text-white";
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "urgent":
        return <AlertCircle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "normal":
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleUpdateKilometers = () => {
    if (formData.currentKilometers < vehicle.currentKilometers)
      return;

    const fullPlate =
      plateData.part1 &&
      plateData.letter &&
      plateData.part2 &&
      plateData.cityCode
        ? `${plateData.part1} ${plateData.letter} ${plateData.part2} ${plateData.cityCode}`
        : undefined;

    updateVehicle(vehicle.id, {
      brandFa: formData.brandFa,
      nameFa: formData.nameFa,
      modelFa: formData.modelFa,
      year: formData.year,
      currentKilometers: formData.currentKilometers,
      plate: fullPlate,
    });
    setIsEditKmOpen(false);
  };

  const handleOpenEditDialog = () => {
    setFormData({
      brandFa: vehicle.brandFa,
      nameFa: vehicle.nameFa,
      modelFa: vehicle.modelFa,
      year: vehicle.year,
      currentKilometers: vehicle.currentKilometers,
    });

    if (vehicle.plate) {
      const parts = vehicle.plate.split("-");
      if (parts.length === 2) {
        const firstPart = parts[0];
        const cityCode = parts[1];
        const part1Match = firstPart.match(/^(\d{2})/);
        const letterMatch = firstPart.match(/[آ-ی]/);
        const part2Match = firstPart.match(/(\d{3})$/);
        setPlateData({
          part1: part1Match ? part1Match[1] : "",
          letter: letterMatch ? letterMatch[0] : "",
          part2: part2Match ? part2Match[1] : "",
          cityCode: cityCode,
        });
      }
    } else {
      setPlateData({
        part1: "",
        letter: "",
        part2: "",
        cityCode: "",
      });
    }

    setIsEditKmOpen(true); // ✨ این خط رو اضافه کن!
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm("آیا از حذف این سرویس اطمینان دارید؟")) {
      deleteService(serviceId);
    }
  };

  const handleOpenAddService = () => {
    setAddServiceStep("select-service");
    setSelectedProduct(null);
    setRecommendedProducts([]); // ✨ پاک کردن محصولات قبلی
    setServiceFormData({
      currentKilometers: vehicle.currentKilometers,
      nextServiceKilometers: vehicle.currentKilometers + 5000,
      serviceDate: new Date(),
      notes: "",
      cost: 0,
    });
    setSelectedServiceType("engine-oil");
    setIsAddServiceOpen(true);
  };

  // ✨ اصلاح شده
  const handleSelectService = async (
    serviceType: ServiceType,
  ) => {
    setSelectedServiceType(serviceType);
    setAddServiceStep("select-product");
    setIsLoadingProducts(true);

    try {
      const response = await getProductRecommendations({
        userId: user?.id || "unknown", // ✨ استفاده از user.id
        serviceName: SERVICE_TYPES[serviceType],
        carBrand: vehicle?.brandFa || "",
        carName: vehicle?.nameFa || "",
        carModel: vehicle?.modelFa || "",
        year: vehicle?.year || 1400,
        currentKm: vehicle?.currentKilometers || 0,
        city: user?.city || "", // ✨ از پروفایل کاربر
      });

      setRecommendedProducts(response.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setRecommendedProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // ✨ اصلاح شده
  const handleSelectProduct = (product: any) => {
    setServiceFormData({
      ...serviceFormData,
      nextServiceKilometers:
        product.next_service_km ||
        vehicle.currentKilometers + 5000,
      notes: product.reason_fa || "",
      cost: 0,
    });

    setSelectedProduct({
      id: Date.now().toString(),
      name: product.product_name_fa,
      brand: product.product_brand_fa,
      price: 0,
      imageUrl: product.image_url,
      // ✨ اینارو اضافه کن:
      replacement_after_months:
        product.replacement_after_months,
      usable_km: product.usable_km,
    });

    setAddServiceStep("submit");
  };

  const handleBackInAddService = () => {
    if (addServiceStep === "select-product") {
      setAddServiceStep("select-service");
    } else if (addServiceStep === "submit") {
      setAddServiceStep("select-product");
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedService = serviceItems.find(
      (s) =>
        s.nameFa === selectedServiceName ||
        s.nameEn === selectedServiceType,
    );

    addService({
      vehicleId: vehicle.id,
      serviceId: selectedService?.id || selectedServiceType,
      type: selectedServiceType,
      currentKilometers: serviceFormData.currentKilometers,
      nextServiceKilometers:
        serviceFormData.nextServiceKilometers,
      serviceDate: new Date(serviceFormData.serviceDate),
      notes: serviceFormData.notes,
      cost: serviceFormData.cost,
      serviceProduct: selectedProduct,
    });

    if (serviceFormData.cost > 0) {
      addTransaction({
        vehicleId: vehicle.id,
        amount: serviceFormData.cost,
        date: new Date(serviceFormData.serviceDate),
        description: `${SERVICE_TYPES[selectedServiceType]} - ${vehicle.displayNameFa || vehicle.nameFa}`,
        status: "paid",
      });
    }

    setIsAddServiceOpen(false);
  };

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case "engine-oil":
        return <Droplets className="w-6 h-6" />;
      case "oil-filter":
        return <Filter className="w-6 h-6" />;
      case "air-filter":
        return <Wind className="w-6 h-6" />;
      case "cabin-filter":
        return <AirVent className="w-6 h-6" />;
      case "timing-belt":
        return <Cog className="w-6 h-6" />;
      case "other":
        return <Wrench className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">
            {vehicle.displayNameFa ||
              `${vehicle.brandFa} ${vehicle.nameFa}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدل {vehicle.year}
          </p>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* ✨ تصویر + اطلاعات + پلاک */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* ردیف بالا: تصویر + مشخصات + پلاک (دسکتاپ) */}
              <div className="flex items-start gap-4 w-full">
                {/* تصویر خودرو */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm">
                  {vehicle.imageUrl ? (
                    <img
                      src={vehicle.imageUrl}
                      alt={
                        vehicle.displayNameFa || vehicle.nameFa
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5">
                      <Car className="w-8 h-8 sm:w-10 sm:h-10 text-[#3B82F6]/50" />
                    </div>
                  )}
                </div>

                {/* اطلاعات خودرو */}
                <div className="flex-1 min-w-0">
                  {vehicle.brandFa && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {vehicle.brandFa}
                    </p>
                  )}
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {vehicle.nameFa}
                    {vehicle.modelFa && (
                      <span className="text-base sm:text-lg text-muted-foreground font-normal mr-1">
                        ({vehicle.modelFa})
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span>مدل {vehicle.year}</span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                    <span dir="ltr">
                      {vehicle.currentKilometers.toLocaleString(
                        "fa-IR",
                      )}{" "}
                      کیلومتر
                    </span>
                  </div>
                </div>

                {/* پلاک - فقط در دسکتاپ کنار مشخصات */}
                {vehicle.plate && (
                  <div className="hidden sm:block flex-shrink-0">
                    <PlateDisplay plate={vehicle.plate} />
                  </div>
                )}
              </div>

              {/* پلاک - فقط در موبایل زیر مشخصات */}
              {vehicle.plate && (
                <div className="sm:hidden w-full flex justify-center">
                  <PlateDisplay plate={vehicle.plate} />
                </div>
              )}
            </div>

            {/* دکمه‌های افزودن سرویس و ویرایش */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                onClick={handleOpenAddService}
              >
                <Plus className="w-4 h-4 ml-1" />
                سرویس جدید
              </Button>

              {/* دکمه ویرایش */}
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleOpenEditDialog}
              >
                <Edit2 className="w-4 h-4 ml-1" />
                ویرایش
              </Button>
            </div>

            {/* Sheet ویرایش - جدا از دکمه */}
            <Sheet
              open={isEditKmOpen}
              onOpenChange={setIsEditKmOpen}
            >
              <SheetContent
                side="bottom"
                className="max-h-[90vh] overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle>ویرایش اطلاعات خودرو</SheetTitle>
                  <SheetDescription>
                    اطلاعات خودرو خود را ویرایش کنید
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 pb-4 px-4">
                  {/* برند خودرو */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-brand">
                      برند خودرو
                    </Label>
                    <Input
                      id="edit-brand"
                      value={formData.brandFa}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandFa: e.target.value,
                        })
                      }
                      placeholder="مثلاً: پژو، سایپا، ایران خودرو"
                      autoFocus
                    />
                  </div>

                  {/* مدل خودرو */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">مدل خودرو</Label>
                    <Input
                      id="edit-name"
                      value={formData.nameFa}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nameFa: e.target.value,
                        })
                      }
                      placeholder="مثلاً: 206، پراید، سمند"
                    />
                  </div>

                  {/* تیپ خودرو */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-model">
                      تیپ (اختیاری)
                    </Label>
                    <Input
                      id="edit-model"
                      value={formData.modelFa}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          modelFa: e.target.value,
                        })
                      }
                      placeholder="مثلاً: تیپ 5، صندوقدار، هاچبک"
                    />
                  </div>

                  {/* سال تولید */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-year">سال تولید</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          year: parseInt(e.target.value),
                        })
                      }
                      min="1300"
                      max="1410"
                      dir="ltr"
                    />
                  </div>

                  {/* کیلومتر فعلی */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-kilometers">
                      کیلومتر فعلی
                    </Label>
                    <Input
                      id="edit-kilometers"
                      type="number"
                      value={formData.currentKilometers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentKilometers:
                            parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      dir="ltr"
                    />
                  </div>

                  {/* پلاک خودرو */}
                  <div className="space-y-2">
                    <PlatePicker
                      value={plateData}
                      onChange={setPlateData}
                      label="پلاک خودرو (اختیاری)"
                    />
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleUpdateKilometers}
                      className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                    >
                      ذخیره تغییرات
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditKmOpen(false)}
                    >
                      لغو
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Add Service Sheet */}
      <Sheet
        open={isAddServiceOpen}
        onOpenChange={setIsAddServiceOpen}
      >
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto"
        >
          <SheetHeader>
            <div className="flex items-center gap-3">
              {(addServiceStep === "select-product" ||
                addServiceStep === "submit") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackInAddService}
                  type="button"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
              <div className="flex-1">
                <SheetTitle>
                  {addServiceStep === "select-service" &&
                    "انتخاب نوع سرویس"}
                  {addServiceStep === "select-product" &&
                    "انتخاب محصول"}
                  {addServiceStep === "submit" && "ثبت سرویس"}
                </SheetTitle>
                <SheetDescription>
                  {addServiceStep === "select-service" &&
                    "نوع سرویس مورد نظر را انتخاب کنید"}
                  {addServiceStep === "select-product" &&
                    "محصول مورد نیاز را انتخاب کنید"}
                  {addServiceStep === "submit" &&
                    "اطلاعات سرویس را تکمیل کنید"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="pb-4 px-4">
            {/* Step 1: Select Service Type */}
            {addServiceStep === "select-service" && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {Object.entries(SERVICE_TYPES).map(
                  ([key, value]) => (
                    <button
                      key={key}
                      onClick={() =>
                        handleSelectService(key as ServiceType)
                      }
                      className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-border hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-colors aspect-square"
                    >
                      <div className="text-[#3B82F6] mb-2">
                        {getServiceIcon(key as ServiceType)}
                      </div>
                      <span className="text-sm text-center">
                        {value}
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}

            {/* Step 2: Select Product */}
            {addServiceStep === "select-product" && (
              <div className="space-y-3 mt-4">
                {isLoadingProducts ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      در حال دریافت محصولات پیشنهادی...
                    </p>
                  </div>
                ) : recommendedProducts.length > 0 ? (
                  recommendedProducts.map((product, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:border-[#3B82F6] transition-colors"
                      onClick={() =>
                        handleSelectProduct(product)
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          {product.image_url && (
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                              <img
                                src={product.image_url}
                                alt={product.product_name_fa}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (
                                    e.target as HTMLImageElement
                                  ).style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm line-clamp-2">
                                  {product.product_name_fa}
                                </h3>
                                {product.product_brand_fa && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {product.product_brand_fa}
                                  </p>
                                )}
                              </div>
                              <button
                                className="text-[#3B82F6] flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(product.reason_fa);
                                }}
                              >
                                <Info className="w-5 h-5" />
                              </button>
                            </div>

                            {/* ✨ جایگزینی specs با usable_km و replacement_after_months */}
                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              {/* مدت زمان تعویض */}
                              {product.replacement_after_months && (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <rect
                                      x="3"
                                      y="4"
                                      width="18"
                                      height="18"
                                      rx="2"
                                      ry="2"
                                    />
                                    <line
                                      x1="16"
                                      y1="2"
                                      x2="16"
                                      y2="6"
                                    />
                                    <line
                                      x1="8"
                                      y1="2"
                                      x2="8"
                                      y2="6"
                                    />
                                    <line
                                      x1="3"
                                      y1="10"
                                      x2="21"
                                      y2="10"
                                    />
                                  </svg>
                                  <span>
                                    هر{" "}
                                    {
                                      product.replacement_after_months
                                    }{" "}
                                    ماه
                                  </span>
                                </div>
                              )}

                              {/* کیلومتر قابل استفاده */}
                              {product.usable_km && (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                    />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span dir="ltr">
                                    {product.usable_km.min?.toLocaleString(
                                      "fa-IR",
                                    )}{" "}
                                    -{" "}
                                    {product.usable_km.max?.toLocaleString(
                                      "fa-IR",
                                    )}{" "}
                                    کیلومتر
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Confidence */}
                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {product.confidence > 0 &&
                                  `اطمینان: ${Math.round(product.confidence * 100)}%`}
                              </span>
                              <ChevronRight className="w-5 h-5 rotate-180" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      محصولی یافت نشد
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      می‌توانید مجدداً تلاش کنید
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        handleSelectService(selectedServiceType)
                      }
                      disabled={isLoadingProducts}
                    >
                      {isLoadingProducts ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full"></div>
                          در حال دریافت...
                        </span>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 ml-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M23 4v6h-6M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                          </svg>
                          تلاش مجدد
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {/* Step 3: Submit Form */}
            {addServiceStep === "submit" && (
              <form
                onSubmit={handleSubmitService}
                className="space-y-4 mt-4"
              >
                {/* Selected Product Display */}
                {selectedProduct && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {selectedProduct.imageUrl && (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-background">
                            <img
                              src={selectedProduct.imageUrl}
                              alt={selectedProduct.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {selectedProduct.name}
                          </h4>
                          {selectedProduct.brand && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {selectedProduct.brand}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {SERVICE_TYPES[selectedServiceType]}
                          </p>

                          {/* ✨ Specs - اصلاح شده */}
                          {selectedProduct.specs &&
                            typeof selectedProduct.specs ===
                              "object" &&
                            Object.keys(selectedProduct.specs)
                              .length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(
                                  selectedProduct.specs,
                                )
                                  .slice(0, 3)
                                  .map(([key, value]) => (
                                    <Badge
                                      key={key}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {String(value)}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* بقیه فرم بدون تغییر */}
                <div className="space-y-2">
                  <Label htmlFor="serviceCurrentKm">
                    کیلومتر انجام سرویس
                  </Label>
                  <Input
                    id="serviceCurrentKm"
                    type="number"
                    value={serviceFormData.currentKilometers}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        currentKilometers:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextKm">
                    کیلومتر سرویس بعدی
                  </Label>
                  <Input
                    id="nextKm"
                    type="number"
                    value={
                      serviceFormData.nextServiceKilometers
                    }
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        nextServiceKilometers:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    min={serviceFormData.currentKilometers}
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceDate">
                    تاریخ انجام سرویس
                  </Label>
                  <PersianDatePicker
                    value={serviceFormData.serviceDate}
                    onChange={(date) =>
                      setServiceFormData({
                        ...serviceFormData,
                        serviceDate: date,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">هزینه (تومان)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={serviceFormData.cost}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        cost: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    توضیحات (اختیاری)
                  </Label>
                  <Textarea
                    id="notes"
                    value={serviceFormData.notes}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                  >
                    ثبت سرویس
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddServiceOpen(false)}
                  >
                    لغو
                  </Button>
                </div>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Services List */}
      <div className="space-y-4">
        <h2 className="text-xl">تاریخچه سرویس‌ها</h2>
        {vehicleServices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>هنوز سرویسی ثبت نشده است</p>
            </CardContent>
          </Card>
        ) : (
          vehicleServices.map((service) => {
            const status = getServiceStatus(
              vehicle.currentKilometers,
              service.nextServiceKilometers,
            );
            const remainingKm =
              service.nextServiceKilometers -
              vehicle.currentKilometers;
            const progress = Math.min(
              100,
              Math.max(
                0,
                ((vehicle.currentKilometers -
                  service.currentKilometers) /
                  (service.nextServiceKilometers -
                    service.currentKilometers)) *
                  100,
              ),
            );

            return (
              <Card key={service.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {SERVICE_TYPES[service.type]}
                        <Badge
                          className={getStatusColor(status)}
                        >
                          {getStatusIcon(status)}
                          <span className="mr-1">
                            {status === "urgent"
                              ? "نیاز به سرویس"
                              : status === "warning"
                                ? "نزدیک به سرویس"
                                : "عادی"}
                          </span>
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(
                          service.serviceDate,
                        ).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteService(service.id)
                      }
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      کیلومتر انجام شده
                    </span>
                    <span dir="ltr">
                      {service.currentKilometers.toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      سرویس بعدی
                    </span>
                    <span dir="ltr">
                      {service.nextServiceKilometers.toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      باقی‌مانده
                    </span>
                    <span
                      className={
                        remainingKm <= 0
                          ? "text-destructive font-medium"
                          : remainingKm <= 1000
                            ? "text-[#f59e0b] font-medium"
                            : "text-[#22c55e] font-medium"
                      }
                      dir="ltr"
                    >
                      {remainingKm > 0
                        ? `${remainingKm.toLocaleString("fa-IR")} کیلومتر`
                        : "گذشته از موعد"}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {service.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        {service.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}