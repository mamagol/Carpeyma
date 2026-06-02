import React, { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";

interface PlateData {
  part1: string;
  letter: string;
  part2: string;
  cityCode: string;
}

interface PlatePickerProps {
  value: PlateData;
  onChange: (value: PlateData) => void;
  label?: string;
  required?: boolean;
}

const PLATE_LETTERS = [
  { label: "الف", value: "الف" },
  { label: "ب", value: "ب" },
  { label: "پ", value: "پ" },
  { label: "ت", value: "ت" },
  { label: "ث", value: "ث" },
  { label: "ج", value: "ج" },
  { label: "د", value: "د" },
  { label: "ز", value: "ز" },
  { label: "س", value: "س" },
  { label: "ش", value: "ش" },
  { label: "ص", value: "ص" },
  { label: "ط", value: "ط" },
  { label: "ع", value: "ع" },
  { label: "ف", value: "ف" },
  { label: "ق", value: "ق" },
  { label: "ک", value: "ک" },
  { label: "گ", value: "گ" },
  { label: "ل", value: "ل" },
  { label: "م", value: "م" },
  { label: "ن", value: "ن" },
  { label: "و", value: "و" },
  { label: "ه", value: "ه" },
  { label: "ی", value: "ی" },
];

const SPECIAL_PLATES = [
  { label: "معلولین", value: "معلولین", icon: "♿" },
  { label: "تشریفات", value: "تشریفات", icon: "⭐" },
  { label: "دیپلمات", value: "دیپلمات", icon: "🎖️" },
];

export function PlatePicker({
  value,
  onChange,
  label,
  required = false,
}: PlatePickerProps) {
  const [isLetterSheetOpen, setIsLetterSheetOpen] =
    useState(false);

  // ✨ استفاده از ID به جای ref برای فوکوس
  const part2InputId = "plate-part2-input";
  const cityCodeInputId = "plate-citycode-input";

  const plateValue = value || {
    part1: "",
    letter: "",
    part2: "",
    cityCode: "",
  };

  const getLetterDisplay = (letter: string) => {
    const specialPlate = SPECIAL_PLATES.find(
      (p) => p.value === letter,
    );
    return specialPlate ? specialPlate.icon : letter || "؟";
  };

  const handlePart1Change = (val: string) => {
    const numeric = val.replace(/\D/g, "").slice(0, 2);
    onChange({ ...plateValue, part1: numeric });

    // وقتی ۲ رقم کامل شد، باتم شیت رو باز کن
    if (numeric.length === 2) {
      setTimeout(() => {
        setIsLetterSheetOpen(true);
      }, 200);
    }
  };

  const handlePart2Change = (val: string) => {
    const numeric = val.replace(/\D/g, "").slice(0, 3);
    onChange({ ...plateValue, part2: numeric });

    // وقتی ۳ رقم کامل شد، برو به کد شهر
    if (numeric.length === 3) {
      setTimeout(() => {
        const cityCodeInput =
          document.getElementById(cityCodeInputId);
        cityCodeInput?.focus();
      }, 100);
    }
  };

  const handleCityCodeChange = (val: string) => {
    const numeric = val.replace(/\D/g, "").slice(0, 2);
    onChange({ ...plateValue, cityCode: numeric });
  };

  const handleLetterSelect = (letter: string) => {
    onChange({ ...plateValue, letter });
    setIsLetterSheetOpen(false);

    // فوکوس روی فیلد ۳ رقمی بعد از بسته شدن شیت
    setTimeout(() => {
      const part2Input = document.getElementById(part2InputId);
      part2Input?.focus();
    }, 300);
  };

  const handlePart2KeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !plateValue.part2) {
      e.preventDefault();
      setIsLetterSheetOpen(true);
    }
  };

  const handleCityCodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !plateValue.cityCode) {
      const part2Input = document.getElementById(part2InputId);
      part2Input?.focus();
    }
  };

  const handleLetterButtonClick = () => {
    if (plateValue.part1.length === 2) {
      setIsLetterSheetOpen(true);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <Label>
          {label}
          {required && (
            <span className="text-destructive mr-1">*</span>
          )}
        </Label>
      )}

      <div className="relative mx-auto w-fit">
        <div
          className="flex items-stretch gap-0 bg-white border-[3px] border-[#1a1a1a] rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-shadow"
          dir="ltr"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-3 bg-white">
            {/* دو رقم اول */}
            <Input
              type="tel"
              inputMode="numeric"
              value={plateValue.part1}
              onChange={(e) =>
                handlePart1Change(e.target.value)
              }
              placeholder="12"
              maxLength={2}
              className="w-10 sm:w-14 h-10 sm:h-12 text-center text-xl sm:text-3xl font-black bg-transparent text-[#1a1a1a] border-2 border-border hover:border-[#3B82F6] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all rounded-md p-0"
              dir="ltr"
            />

            {/* حرف */}
            <button
              id="plate-letter-btn"
              type="button"
              onClick={handleLetterButtonClick}
              className={`w-10 sm:w-14 h-10 sm:h-12 text-center text-xl sm:text-3xl font-black bg-gradient-to-b from-[#3B82F6]/10 to-[#3B82F6]/5 text-[#1a1a1a] border-2 rounded-md transition-all active:scale-95 ${
                plateValue.part1.length === 2
                  ? "border-[#3B82F6] hover:bg-[#3B82F6]/20 hover:scale-105 focus:bg-[#3B82F6]/20 focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2"
                  : "border-gray-300 opacity-50 cursor-not-allowed"
              }`}
              disabled={plateValue.part1.length !== 2}
            >
              {getLetterDisplay(plateValue.letter)}
            </button>

            {/* سه رقم وسط */}
            <Input
              id={part2InputId}
              type="tel"
              inputMode="numeric"
              value={plateValue.part2}
              onChange={(e) =>
                handlePart2Change(e.target.value)
              }
              onKeyDown={handlePart2KeyDown}
              placeholder="345"
              maxLength={3}
              className="w-14 sm:w-20 h-10 sm:h-12 text-center text-xl sm:text-3xl font-black bg-transparent text-[#1a1a1a] border-2 border-border hover:border-[#3B82F6] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all rounded-md p-0"
              dir="ltr"
            />
          </div>

          <div className="w-0.5 bg-[#1a1a1a]" />

          {/* کد شهر */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0055aa] to-[#003d7a] px-2 sm:px-2.5 py-2 sm:py-3 gap-1.5 sm:gap-2 min-w-[50px] sm:min-w-[65px]">
            <div className="text-xl sm:text-2xl leading-none">
              🇮🇷
            </div>

            <Input
              id={cityCodeInputId}
              type="tel"
              inputMode="numeric"
              value={plateValue.cityCode}
              onChange={(e) =>
                handleCityCodeChange(e.target.value)
              }
              onKeyDown={handleCityCodeKeyDown}
              placeholder="12"
              maxLength={2}
              className="w-9 sm:w-12 h-8 sm:h-9 text-center text-base sm:text-xl font-black bg-white text-[#1a1a1a] border-2 border-white hover:border-[#3B82F6] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] transition-all rounded p-0"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <Sheet
        open={isLetterSheetOpen}
        onOpenChange={setIsLetterSheetOpen}
      >
        <SheetContent
          side="bottom"
          className="h-[75vh] sm:h-[65vh] px-4 sm:px-6"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-center text-xl sm:text-2xl">
              انتخاب حرف پلاک
            </SheetTitle>
            <SheetDescription className="text-center text-sm sm:text-base">
              {plateValue.part1
                ? `پلاک ${plateValue.part1} ...`
                : "لطفاً یک حرف را از لیست زیر انتخاب کنید"}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 overflow-y-auto max-h-[calc(75vh-120px)] sm:max-h-[calc(65vh-120px)] pb-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                پلاک‌های ویژه
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {SPECIAL_PLATES.map((item) => (
                  <Button
                    key={item.value}
                    variant="outline"
                    className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 hover:bg-[#3B82F6]/10 hover:border-[#3B82F6] hover:scale-105 active:scale-95 transition-all border-2"
                    onClick={() =>
                      handleLetterSelect(item.value)
                    }
                  >
                    <span className="text-3xl sm:text-4xl">
                      {item.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">
                      {item.label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                حروف فارسی
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2 sm:gap-2.5">
                {PLATE_LETTERS.map((item) => (
                  <Button
                    key={item.value}
                    variant="outline"
                    className="h-14 sm:h-16 text-2xl sm:text-3xl font-black hover:bg-[#3B82F6]/10 hover:border-[#3B82F6] hover:scale-110 active:scale-95 transition-all border-2"
                    onClick={() =>
                      handleLetterSelect(item.value)
                    }
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}