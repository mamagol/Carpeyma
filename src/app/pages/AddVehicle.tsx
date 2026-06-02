import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowRight } from "lucide-react";

export default function AddVehicle() {
  const navigate = useNavigate();
  const { addVehicle } = useApp();

  console.log("✅ AddVehicle component rendered");

  const [formData, setFormData] = useState({
    brandFa: "",
    nameFa: "",
    modelFa: "",
    year: 1405,
    currentKilometers: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Form submitted:", formData);

    if (!formData.brandFa || !formData.nameFa) {
      alert("لطفاً برند و مدل خودرو را وارد کنید");
      return;
    }

    await addVehicle({
      brandFa: formData.brandFa,
      nameFa: formData.nameFa,
      modelFa: formData.modelFa || undefined,
      year: formData.year,
      currentKilometers: formData.currentKilometers,
    });

    navigate("/");
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl">افزودن خودرو جدید</h1>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ۱. برند خودرو */}
            <div className="space-y-2">
              <Label htmlFor="brand">برند خودرو *</Label>
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
              />
            </div>

            {/* ۲. مدل خودرو */}
            <div className="space-y-2">
              <Label htmlFor="name">مدل خودرو *</Label>
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

            {/* ۳. تیپ خودرو */}
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

            {/* ۴. سال تولید */}
            <div className="space-y-2">
              <Label htmlFor="year">سال تولید</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: parseInt(e.target.value) || 1400,
                  })
                }
                min="1300"
                max="1410"
                dir="ltr"
              />
            </div>

            {/* ۵. کیلومتر فعلی */}
            <div className="space-y-2">
              <Label htmlFor="kilometers">کیلومتر فعلی</Label>
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

            {/* دکمه‌ها */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                افزودن خودرو
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                لغو
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}