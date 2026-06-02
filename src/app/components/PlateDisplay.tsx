import React from 'react';
import { parsePlate } from '../../lib/plateHelper';

interface PlateData {
  section1: string;  // xx
  letter: string;    // $
  section2: string;  // yyy
  section3: string;  // zz
}

interface PlateDisplayProps {
  plate: string; // format: "xx $ yyy zz"
}

export function PlateDisplay({ plate }: PlateDisplayProps) {
  const plateData = parsePlate(plate);

  if (!plateData) {
    return null;
  }

  const value = {
    part1: plateData.section1,
    letter: plateData.letter,
    part2: plateData.section2,
    cityCode: plateData.section3,
  };

  return (
    <div className="relative mx-auto w-fit flex-shrink-0">
      {/* کادر اصلی پلاک */}
      <div className="flex items-stretch gap-0 bg-white border-2 border-[#1a1a1a] rounded-lg overflow-hidden shadow-md" dir="ltr">
        
        {/* بخش سفید (اعداد و حرف) - از چپ به راست */}
        <div className="flex items-center gap-1 px-1.5 py-1.5 bg-white">
          {/* دو رقم */}
          <div className="w-8 h-8 text-center flex items-center justify-center text-lg font-black bg-transparent text-[#1a1a1a] border-2 border-border rounded-md">
            {value.part1 || ''}
          </div>

          {/* حرف */}
          <div className="w-8 h-8 text-center flex items-center justify-center text-lg font-black bg-gradient-to-b from-[#3B82F6]/10 to-[#3B82F6]/5 text-[#1a1a1a] border-2 border-[#3B82F6] rounded-md">
            {value.letter || ''}
          </div>

          {/* سه رقم */}
          <div className="w-12 h-8 text-center flex items-center justify-center text-lg font-black bg-transparent text-[#1a1a1a] border-2 border-border rounded-md">
            {value.part2 || ''}
          </div>
        </div>

        {/* جداکننده عمودی */}
        <div className="w-0.5 bg-[#1a1a1a]" />
        
        {/* بخش آبی سمت راست (ایران + کد شهر) */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0055aa] to-[#003d7a] px-1.5 py-1.5 gap-1 min-w-[40px]">
          {/* پرچم ایران */}
          <div className="text-base leading-none">🇮🇷</div>
          
          {/* کد شهر */}
          <div className="w-7 h-6 text-center flex items-center justify-center text-sm font-black bg-white text-[#1a1a1a] border border-white rounded">
            {value.cityCode || ''}
          </div>
        </div>
      </div>
    </div>
  );
}