import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Settings } from 'lucide-react';

export default function IdCardSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultTemplate: 'portrait',
    autoSave: true,
    watermarkEnabled: true,
    watermarkText: '',
    defaultSchoolName: 'ঢাকা পাবলিক স্কুল',
    defaultSchoolAddress: 'ধানমন্ডি, ঢাকা-১২০৫',
    defaultEiin: '123456',
    cardValidityPeriod: '1', // years
    autoExpireDate: true,
    printQuality: 'high',
    cardSize: 'credit-card',
    enableBarcodes: false,
    enableQrCodes: true
  });

  const handleSave = () => {
    toast({
      title: "সেটিংস সংরক্ষিত",
      description: "আইডি কার্ড সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।"
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">হোম</Link>
          <span>/</span>
          <Link href="/id-card/dashboard" className="hover:text-gray-700">আইডি কার্ড</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">সেটিংস</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">আইডি কার্ড সেটিংস</h1>
            <p className="text-gray-600 mt-1">আইডি কার্ড সিস্টেমের কনফিগারেশন পরিচালনা করুন</p>
          </div>
          <div className="flex gap-3">
            <Link href="/id-card/dashboard">
              <Button variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Default Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                ডিফল্ট সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>ডিফল্ট টেমপ্লেট</Label>
                <Select value={settings.defaultTemplate} onValueChange={(value) => updateSetting('defaultTemplate', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">পোর্ট্রেট</SelectItem>
                    <SelectItem value="landscape">ল্যান্ডস্কেপ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ডিফল্ট স্কুলের নাম</Label>
                <Input 
                  value={settings.defaultSchoolName}
                  onChange={(e) => updateSetting('defaultSchoolName', e.target.value)}
                  placeholder="স্কুলের নাম"
                />
              </div>

              <div>
                <Label>ডিফল্ট স্কুলের ঠিকানা</Label>
                <Input 
                  value={settings.defaultSchoolAddress}
                  onChange={(e) => updateSetting('defaultSchoolAddress', e.target.value)}
                  placeholder="স্কুলের ঠিকানা"
                />
              </div>

              <div>
                <Label>ডিফল্ট EIIN নম্বর</Label>
                <Input 
                  value={settings.defaultEiin}
                  onChange={(e) => updateSetting('defaultEiin', e.target.value)}
                  placeholder="EIIN নম্বর"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>অটো সেভ</Label>
                  <p className="text-sm text-gray-500">কাজ করার সময় স্বয়ংক্রিয়ভাবে সংরক্ষণ করুন</p>
                </div>
                <Switch 
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card Settings */}
          <Card>
            <CardHeader>
              <CardTitle>কার্ড সেটিংস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>কার্ডের সাইজ</Label>
                <Select value={settings.cardSize} onValueChange={(value) => updateSetting('cardSize', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit-card">ক্রেডিট কার্ড সাইজ (৮৫.৬×৫৪ মিমি)</SelectItem>
                    <SelectItem value="business-card">বিজনেস কার্ড সাইজ (৯০×৫৫ মিমি)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>কার্ডের মেয়াদ (বছর)</Label>
                <Select value={settings.cardValidityPeriod} onValueChange={(value) => updateSetting('cardValidityPeriod', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">১ বছর</SelectItem>
                    <SelectItem value="2">২ বছর</SelectItem>
                    <SelectItem value="3">৩ বছর</SelectItem>
                    <SelectItem value="5">৫ বছর</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>প্রিন্ট কোয়ালিটি</Label>
                <Select value={settings.printQuality} onValueChange={(value) => updateSetting('printQuality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">স্ট্যান্ডার্ড (৩০০ DPI)</SelectItem>
                    <SelectItem value="high">উচ্চ (৬০০ DPI)</SelectItem>
                    <SelectItem value="premium">প্রিমিয়াম (১২০০ DPI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>স্বয়ংক্রিয় মেয়াদ তারিখ</Label>
                  <p className="text-sm text-gray-500">ইস্যু তারিখের ভিত্তিতে মেয়াদ নির্ধারণ</p>
                </div>
                <Switch 
                  checked={settings.autoExpireDate}
                  onCheckedChange={(checked) => updateSetting('autoExpireDate', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle>নিরাপত্তা বৈশিষ্ট্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>ওয়াটারমার্ক সক্রিয়</Label>
                  <p className="text-sm text-gray-500">কার্ডে ওয়াটারমার্ক যোগ করুন</p>
                </div>
                <Switch 
                  checked={settings.watermarkEnabled}
                  onCheckedChange={(checked) => updateSetting('watermarkEnabled', checked)}
                />
              </div>

              {settings.watermarkEnabled && (
                <div>
                  <Label>ওয়াটারমার্ক টেক্সট</Label>
                  <Input 
                    value={settings.watermarkText}
                    onChange={(e) => updateSetting('watermarkText', e.target.value)}
                    placeholder="ওয়াটারমার্ক টেক্সট (খালি থাকলে স্কুলের নাম ব্যবহার হবে)"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>QR কোড সক্রিয়</Label>
                  <p className="text-sm text-gray-500">শিক্ষার্থীর তথ্যের জন্য QR কোড</p>
                </div>
                <Switch 
                  checked={settings.enableQrCodes}
                  onCheckedChange={(checked) => updateSetting('enableQrCodes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>বারকোড সক্রিয়</Label>
                  <p className="text-sm text-gray-500">শিক্ষার্থী আইডির জন্য বারকোড</p>
                </div>
                <Switch 
                  checked={settings.enableBarcodes}
                  onCheckedChange={(checked) => updateSetting('enableBarcodes', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle>উন্নত অপশন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">সতর্কতা</h4>
                <p className="text-sm text-yellow-700">
                  এই সেটিংসগুলো পরিবর্তন করার আগে ব্যাকআপ নিশ্চিত করুন।
                </p>
              </div>

              <Button variant="outline" className="w-full">
                ডেটা এক্সপোর্ট করুন
              </Button>

              <Button variant="outline" className="w-full">
                ডেটা ইমপোর্ট করুন
              </Button>

              <Button variant="destructive" className="w-full">
                সকল সেটিংস রিসেট করুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}