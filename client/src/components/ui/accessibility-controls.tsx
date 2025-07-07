import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccessibilityControlsProps {
  onFontSizeChange: (size: number) => void;
  onContrastChange: (enabled: boolean) => void;
  onScreenReaderChange: (enabled: boolean) => void;
  onColorBlindnessChange: (type: string) => void;
  onLanguageChange: (lang: string) => void;
}

export function AccessibilityControls({
  onFontSizeChange,
  onContrastChange,
  onScreenReaderChange,
  onColorBlindnessChange,
  onLanguageChange
}: AccessibilityControlsProps) {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [colorBlindType, setColorBlindType] = useState('none');
  const [language, setLanguage] = useState('bn');

  const handleFontSizeChange = (value: number[]) => {
    const size = value[0];
    setFontSize(size);
    onFontSizeChange(size);
  };

  const handleContrastToggle = (enabled: boolean) => {
    setHighContrast(enabled);
    onContrastChange(enabled);
  };

  const handleScreenReaderToggle = (enabled: boolean) => {
    setScreenReader(enabled);
    onScreenReaderChange(enabled);
  };

  const handleColorBlindnessChange = (type: string) => {
    setColorBlindType(type);
    onColorBlindnessChange(type);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    onLanguageChange(lang);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="material-icons text-blue-600">accessibility</span>
          অ্যাক্সেসিবিলিটি সেটিংস
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Size Control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">ফন্ট সাইজ: {fontSize}px</Label>
          <Slider
            value={[fontSize]}
            onValueChange={handleFontSizeChange}
            min={12}
            max={24}
            step={1}
            className="w-full"
            aria-label="ফন্ট সাইজ নিয়ন্ত্রণ"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>ছোট (১২px)</span>
            <span>বড় (২৪px)</span>
          </div>
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast" className="text-sm font-medium">
            উচ্চ কনট্রাস্ট মোড
          </Label>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={handleContrastToggle}
            aria-describedby="high-contrast-desc"
          />
        </div>
        <p id="high-contrast-desc" className="text-xs text-gray-600">
          দৃষ্টিশক্তি কম থাকা ব্যবহারকারীদের জন্য উন্নত দৃশ্যমানতা
        </p>

        {/* Screen Reader Support */}
        <div className="flex items-center justify-between">
          <Label htmlFor="screen-reader" className="text-sm font-medium">
            স্ক্রিন রিডার সাপোর্ট
          </Label>
          <Switch
            id="screen-reader"
            checked={screenReader}
            onCheckedChange={handleScreenReaderToggle}
            aria-describedby="screen-reader-desc"
          />
        </div>
        <p id="screen-reader-desc" className="text-xs text-gray-600">
          স্ক্রিন রিডার ব্যবহারকারীদের জন্য অতিরিক্ত বর্ণনা
        </p>

        {/* Color Blindness Support */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">রঙ অন্ধত্ব সাপোর্ট</Label>
          <Select value={colorBlindType} onValueChange={handleColorBlindnessChange}>
            <SelectTrigger aria-label="রঙ অন্ধত্বের ধরন নির্বাচন করুন">
              <SelectValue placeholder="রঙ অন্ধত্বের ধরন নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">কোনো সমস্যা নেই</SelectItem>
              <SelectItem value="protanopia">প্রোটানোপিয়া (লাল-সবুজ)</SelectItem>
              <SelectItem value="deuteranopia">ডিউটারানোপিয়া (সবুজ-লাল)</SelectItem>
              <SelectItem value="tritanopia">ট্রিটানোপিয়া (নীল-হলুদ)</SelectItem>
              <SelectItem value="monochromacy">একরঙা দৃষ্টি</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">ভাষা নির্বাচন</Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger aria-label="ভাষা নির্বাচন করুন">
              <SelectValue placeholder="ভাষা নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bn">বাংলা</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="both">দ্বিভাষিক (বাংলা + English)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Keyboard Navigation Help */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <span className="material-icons text-blue-600">keyboard</span>
            কীবোর্ড নেভিগেশন
          </h4>
          <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
            <li>• Tab - পরবর্তী এলিমেন্টে যান</li>
            <li>• Shift + Tab - পূর্ববর্তী এলিমেন্টে যান</li>
            <li>• Enter/Space - বাটন চাপুন বা নির্বাচন করুন</li>
            <li>• Arrow Keys - ড্রপডাউন মেনুতে নেভিগেট করুন</li>
            <li>• Esc - মেনু বন্ধ করুন</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}