import React, { useState } from "react";
import { useNavigate } from "react-router";
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
import { PlatePicker } from "../components/PlatePicker";
import {
  Car,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { ServiceStatus } from "../types";

export default function Dashboard() {
  const { user, vehicles, services, updateUser, addVehicle } =
    useApp();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);

  // ✨ تغییر: اضافه کردن brandFa و nameFa و modelFa
  const [formData, setFormData] = useState({
    brandFa: "", // برند خودرو (مثلاً: پژو)
    nameFa: "", // مدل خودرو (مثلاً: 206)
    modelFa: "", // تیپ خودرو (مثلاً: تیپ 5)
    year: 1405,
    currentKilometers: 0,
  });

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

  const [plateData, setPlateData] = useState({
    part1: "",
    letter: "",
    part2: "",
    cityCode: "",
  });

  // ... بقیه کدها بدون تغییر (getServiceStatus و غیره)

  // ✨ async کنیم handleSubmit رو
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brandFa || !formData.nameFa) {
      alert("لطفاً برند و مدل خودرو را وارد کنید");
      return;
    }

    const fullPlate =
      plateData.part1 &&
      plateData.letter &&
      plateData.part2 &&
      plateData.cityCode
        ? `${plateData.part1} ${plateData.letter} ${plateData.part2} ${plateData.cityCode}`
        : undefined;

    setIsAddingVehicle(true); // ✨ شروع لودینگ

    try {
      await addVehicle({
        brandFa: formData.brandFa,
        nameFa: formData.nameFa,
        modelFa: formData.modelFa || undefined,
        year: formData.year,
        currentKilometers: formData.currentKilometers,
        plate: fullPlate,
      });

      setIsSheetOpen(false);
      setFormData({
        brandFa: "",
        nameFa: "",
        modelFa: "",
        year: 1405,
        currentKilometers: 0,
      });
      setPlateData({
        part1: "",
        letter: "",
        part2: "",
        cityCode: "",
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("خطا در افزودن خودرو");
    } finally {
      setIsAddingVehicle(false); // ✨ پایان لودینگ
    }
  };

  const showProfilePrompt = !user?.firstName;

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/profile");
  };

  const allServicesWithStatus = services
    .map((service) => {
      const vehicle = vehicles.find(
        (v) => v.id === service.vehicleId,
      );
      if (!vehicle) return null;
      const status = getServiceStatus(
        vehicle.currentKilometers,
        service.nextServiceKilometers,
      );
      return { ...service, vehicle, status };
    })
    .filter(Boolean);

  const urgentCount = allServicesWithStatus.filter(
    (s) => s?.status === "urgent",
  ).length;
  const warningCount = allServicesWithStatus.filter(
    (s) => s?.status === "warning",
  ).length;

  // ... متدهای دیگه بدون تغییر

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl">داشبورد</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.firstName
            ? `سلام ${user.firstName}!`
            : "به کارپیما خوش آمدید"}
        </p>
      </div>
      {/* Profile Completion Prompt */}
      {showProfilePrompt && (
        <Card className="border-[#3B82F6] bg-[#3B82F6]/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium">تکمیل پروفایل</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  لطفاً نام و نام خانوادگی خود را در پروفایل
                  تکمیل کنید
                </p>
                <Button
                  onClick={handleCompleteProfile}
                  className="mt-3 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                  size="sm"
                >
                  تکمیل پروفایل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#3B82F6]">
                {vehicles.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                خودرو
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#3B82F6]">
                {services.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                سرویس
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Services Alert */}
      {urgentCount > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive">
                  نیاز به سرویس فوری
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {urgentCount} سرویس نیاز به انجام دارد
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Services Alert */}
      {warningCount > 0 && urgentCount === 0 && (
        <Card className="border-[#f59e0b] bg-[#f59e0b]/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-[#f59e0b]">
                  نزدیک به موعد سرویس
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {warningCount} سرویس به زودی نیاز به انجام
                  دارد
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">خودروهای من</h2>
          <Sheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
          >
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                <Plus className="w-4 h-4 ml-1" />
                افزودن خودرو
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[90vh] overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>افزودن خودرو جدید</SheetTitle>
                <SheetDescription>
                  اطلاعات خودرو خود را وارد کنید تا به لیست
                  خودروهای شما اضافه شود.
                </SheetDescription>
              </SheetHeader>

              {/* ✨ فرم اصلاح شده داخل باتم شیت */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 pb-4 px-4"
              >
                {/* ✨ برند خودرو */}
                <div className="space-y-2">
                  <Label htmlFor="brand">برند خودرو</Label>
                  <Input
                    id="brand"
                    value={formData.brandFa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandFa: e.target.value,
                      })
                    }
                    placeholder="مثلاً: پژو، سایپا، ایران خودرو"
                    required
                    autoFocus
                  />
                </div>

                {/* ✨ مدل خودرو */}
                <div className="space-y-2">
                  <Label htmlFor="name">مدل خودرو</Label>
                  <Input
                    id="name"
                    value={formData.nameFa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameFa: e.target.value,
                      })
                    }
                    placeholder="مثلاً: 206، پراید، سمند"
                    required
                  />
                </div>

                {/* ✨ تیپ خودرو */}
                <div className="space-y-2">
                  <Label htmlFor="model">تیپ (اختیاری)</Label>
                  <Input
                    id="model"
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

                <div className="space-y-2">
                  <Label htmlFor="year">سال تولید</Label>
                  <Input
                    id="year"
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

                <div className="space-y-2">
                  <Label htmlFor="kilometers">
                    کیلومتر فعلی
                  </Label>
                  <Input
                    id="kilometers"
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

                <div className="space-y-2">
                  <PlatePicker
                    value={plateData}
                    onChange={setPlateData}
                    label="پلاک خودرو (اختیاری)"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                    disabled={isAddingVehicle}
                  >
                    {isAddingVehicle ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        در حال افزودن...
                      </span>
                    ) : (
                      "افزودن خودرو"
                    )}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        {vehicles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                هنوز خودرویی اضافه نکرده‌اید
              </p>
              <Sheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                    <Plus className="w-4 h-4 ml-1" />
                    افزودن اولین خودرو
                  </Button>
                </SheetTrigger>
              </Sheet>
            </CardContent>
          </Card>
        ) : (
          vehicles.map((vehicle) => {
            const vehicleServices = services.filter(
              (s) => s.vehicleId === vehicle.id,
            );
            const nextService =
              vehicleServices.length > 0
                ? vehicleServices.reduce((prev, current) => {
                    const prevRemaining =
                      prev.nextServiceKilometers -
                      vehicle.currentKilometers;
                    const currentRemaining =
                      current.nextServiceKilometers -
                      vehicle.currentKilometers;
                    return currentRemaining < prevRemaining
                      ? current
                      : prev;
                  })
                : null;

            const status = nextService
              ? getServiceStatus(
                  vehicle.currentKilometers,
                  nextService.nextServiceKilometers,
                )
              : null;

            const remainingKm = nextService
              ? nextService.nextServiceKilometers -
                vehicle.currentKilometers
              : null;

            const progress = nextService
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    ((vehicle.currentKilometers -
                      nextService.currentKilometers) /
                      (nextService.nextServiceKilometers -
                        nextService.currentKilometers)) *
                      100,
                  ),
                )
              : 0;

            return (
              <Card
                key={vehicle.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  navigate(`/vehicles/${vehicle.id}`)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {/* ✨ تصویر خودرو */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={
                            vehicle.displayNameFa ||
                            vehicle.nameFa
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5">
                          <Car className="w-8 h-8 text-[#3B82F6]/50" />
                        </div>
                      )}
                    </div>

                    {/* ✨ اطلاعات خودرو */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {/* ✨ برند */}
                          {vehicle.brandFa && (
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {vehicle.brandFa}
                            </p>
                          )}

                          {/* ✨ نام خودرو + تیپ */}
                          <CardTitle className="text-base">
                            {vehicle.nameFa}
                            {vehicle.modelFa && (
                              <span className="text-sm text-muted-foreground mr-1">
                                ({vehicle.modelFa})
                              </span>
                            )}
                          </CardTitle>

                          {/* ✨ سال تولید + کیلومتر */}
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
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

                        {/* ✨ وضعیت سرویس */}
                        {status && (
                          <Badge
                            className={getStatusColor(status)}
                          >
                            {getStatusIcon(status)}
                            <span className="mr-1">
                              {status === "urgent"
                                ? "فوری"
                                : status === "warning"
                                  ? "هشدار"
                                  : "عادی"}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* ✨ بخش سرویس بعدی - حذف کیلومتر فعلی چون بالا نشون دادیم */}
                  {nextService && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          سرویس بعدی
                        </span>
                        <span
                          className={
                            remainingKm! <= 0
                              ? "text-destructive font-medium"
                              : remainingKm! <= 1000
                                ? "text-[#f59e0b] font-medium"
                                : "text-[#22c55e] font-medium"
                          }
                          dir="ltr"
                        >
                          {remainingKm! > 0
                            ? `${remainingKm!.toLocaleString("fa-IR")} کیلومتر`
                            : "گذشته از موعد"}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2"
                      />
                    </>
                  )}
                  {!nextService && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      سرویسی ثبت نشده است
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