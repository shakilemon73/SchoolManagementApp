import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdmitCardSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    schoolName: 'ঢাকা পাবলিক স্কুল',
    schoolNameEn: 'Dhaka Public School',
    schoolAddress: 'ঢাকা, বাংলাদেশ',
    schoolCode: 'DHK-123',
    defaultExamCenter: 'ঢাকা কেন্দ্রীয় স্কুল',
    principalName: 'মোহাম্মদ আলী',
    principalSignature: '',
    schoolLogo: '',
    watermarkText: 'Admit Card',
    defaultLanguage: 'bn',
    includePhoto: true,
    includeQRCode: false,
    includeBarcode: false,
    autoGenerateSerialNo: true,
    requireParentSignature: true,
    enableBatchGeneration: true,
    maxBatchSize: 100,
    defaultTemplateId: '1',
  });

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({
      title: 'সেটিংস সেভ হয়েছে',
      description: 'আপনার এডমিট কার্ড সেটিংস সফলভাবে সেভ করা হয়েছে',
    });
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      schoolName: 'ঢাকা পাবলিক স্কুল',
      schoolNameEn: 'Dhaka Public School',
      schoolAddress: 'ঢাকা, বাংলাদেশ',
      schoolCode: 'DHK-123',
      defaultExamCenter: 'ঢাকা কেন্দ্রীয় স্কুল',
      principalName: 'মোহাম্মদ আলী',
      principalSignature: '',
      schoolLogo: '',
      watermarkText: 'Admit Card',
      defaultLanguage: 'bn',
      includePhoto: true,
      includeQRCode: false,
      includeBarcode: false,
      autoGenerateSerialNo: true,
      requireParentSignature: true,
      enableBatchGeneration: true,
      maxBatchSize: 100,
      defaultTemplateId: '1',
    });
    
    toast({
      title: 'সেটিংস রিসেট হয়েছে',
      description: 'সকল সেটিংস ডিফল্ট মানে ফিরিয়ে আনা হয়েছে',
    });
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-700">হোম</Link>
            <span>/</span>
            <Link href="/documents/admit-cards" className="hover:text-gray-700">এডমিট কার্ড</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">সেটিংস</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">এডমিট কার্ড সেটিংস</h1>
              <p className="text-gray-600 mt-1">এডমিট কার্ডের জন্য স্কুলের তথ্য ও পছন্দ কনফিগার করুন</p>
            </div>
            
            <Link href="/documents/admit-cards">
              <Button variant="outline" className="flex items-center gap-2">
                <span className="material-icons text-sm">arrow_back</span>
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">school</span>
                স্কুলের তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school-name-bn">স্কুলের নাম (বাংলা)</Label>
                  <Input
                    id="school-name-bn"
                    value={settings.schoolName}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="school-name-en">স্কুলের নাম (ইংরেজি)</Label>
                  <Input
                    id="school-name-en"
                    value={settings.schoolNameEn}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolNameEn: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="school-address">স্কুলের ঠিকানা</Label>
                <Textarea
                  id="school-address"
                  value={settings.schoolAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, schoolAddress: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school-code">স্কুল কোড</Label>
                  <Input
                    id="school-code"
                    value={settings.schoolCode}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolCode: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="exam-center">ডিফল্ট পরীক্ষা কেন্দ্র</Label>
                  <Input
                    id="exam-center"
                    value={settings.defaultExamCenter}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultExamCenter: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authority Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">person</span>
                কর্তৃপক্ষের তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="principal-name">প্রধান শিক্ষকের নাম</Label>
                <Input
                  id="principal-name"
                  value={settings.principalName}
                  onChange={(e) => setSettings(prev => ({ ...prev, principalName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="principal-signature">প্রধান শিক্ষকের স্বাক্ষর (ছবি URL)</Label>
                <Input
                  id="principal-signature"
                  type="url"
                  placeholder="https://example.com/signature.png"
                  value={settings.principalSignature}
                  onChange={(e) => setSettings(prev => ({ ...prev, principalSignature: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="school-logo">স্কুলের লোগো (ছবি URL)</Label>
                <Input
                  id="school-logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={settings.schoolLogo}
                  onChange={(e) => setSettings(prev => ({ ...prev, schoolLogo: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Design Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">palette</span>
                ডিজাইন অপশন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="watermark">ওয়াটারমার্ক টেক্সট</Label>
                <Input
                  id="watermark"
                  value={settings.watermarkText}
                  onChange={(e) => setSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="default-language">ডিফল্ট ভাষা</Label>
                <Select 
                  value={settings.defaultLanguage} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLanguage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bn">বাংলা</SelectItem>
                    <SelectItem value="en">ইংরেজি</SelectItem>
                    <SelectItem value="both">উভয়</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-photo">শিক্ষার্থীর ছবি অন্তর্ভুক্ত করুন</Label>
                  <Switch
                    id="include-photo"
                    checked={settings.includePhoto}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includePhoto: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-qr">QR কোড অন্তর্ভুক্ত করুন</Label>
                  <Switch
                    id="include-qr"
                    checked={settings.includeQRCode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeQRCode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-barcode">বারকোড অন্তর্ভুক্ত করুন</Label>
                  <Switch
                    id="include-barcode"
                    checked={settings.includeBarcode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeBarcode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-serial">স্বয়ংক্রিয় সিরিয়াল নম্বর</Label>
                  <Switch
                    id="auto-serial"
                    checked={settings.autoGenerateSerialNo}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoGenerateSerialNo: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="parent-signature">অভিভাবকের স্বাক্ষর প্রয়োজন</Label>
                  <Switch
                    id="parent-signature"
                    checked={settings.requireParentSignature}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireParentSignature: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">settings</span>
                জেনারেশন সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-batch">ব্যাচ জেনারেশন সক্রিয়</Label>
                <Switch
                  id="enable-batch"
                  checked={settings.enableBatchGeneration}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableBatchGeneration: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="max-batch">সর্বোচ্চ ব্যাচ সাইজ</Label>
                <Input
                  id="max-batch"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.maxBatchSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxBatchSize: parseInt(e.target.value) }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={handleReset}>
              <span className="material-icons mr-2">refresh</span>
              রিসেট করুন
            </Button>
            
            <Button onClick={handleSave}>
              <span className="material-icons mr-2">save</span>
              সেটিংস সেভ করুন
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}