import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  nameBn: string;
  category: 'portrait' | 'landscape';
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function TemplatesManagement() {
  const [templates] = useState<Template[]>([
    {
      id: 'portrait',
      name: 'Portrait ID Card',
      nameBn: 'পোর্ট্রেট আইডি কার্ড',
      category: 'portrait',
      description: 'ক্রেডিট কার্ড সাইজ - দীর্ঘ ফরম্যাট',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'landscape',
      name: 'Landscape ID Card',
      nameBn: 'ল্যান্ডস্কেপ আইডি কার্ড',
      category: 'landscape',
      description: 'ক্রেডিট কার্ড সাইজ - প্রশস্ত ফরম্যাট',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.nameBn.includes(searchTerm) || template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">হোম</Link>
          <span>/</span>
          <Link href="/id-card/dashboard" className="hover:text-gray-700">আইডি কার্ড</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">টেমপ্লেট</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">টেমপ্লেট ম্যানেজমেন্ট</h1>
            <p className="text-gray-600 mt-1">আইডি কার্ড টেমপ্লেট তৈরি ও পরিচালনা করুন</p>
          </div>
          <div className="flex gap-3">
            <Link href="/id-card/dashboard">
              <Button variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
            <Button>
              <Plus size={16} className="mr-2" />
              নতুন টেমপ্লেট
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="টেমপ্লেট খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.nameBn}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  </div>
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl text-blue-500 mb-2 block">🆔</span>
                    <div className="text-xs font-semibold text-gray-700 mb-1">আইডি কার্ড</div>
                    <div className="text-xs text-gray-500">{template.category === 'portrait' ? 'পোর্ট্রেট' : 'ল্যান্ডস্কেপ'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={template.category === 'portrait' ? 'default' : 'secondary'} className="text-xs">
                    {template.category === 'portrait' ? 'পোর্ট্রেট' : 'ল্যান্ডস্কেপ'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye size={14} className="mr-1" />
                    প্রিভিউ
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit size={14} className="mr-1" />
                    সম্পাদনা
                  </Button>
                  <Button size="sm" variant="outline" className="px-3">
                    <Trash2 size={14} />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t space-y-2">
                  <Link href={`/id-card/create-single?template=${template.id}`}>
                    <Button size="sm" className="w-full">
                      একক তৈরি
                    </Button>
                  </Link>
                  <Link href={`/id-card/batch-creation?template=${template.id}`}>
                    <Button size="sm" variant="outline" className="w-full">
                      ব্যাচ তৈরি
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">কোন টেমপ্লেট পাওয়া যায়নি</h3>
              <p className="text-gray-500 mb-6">আপনার অনুসন্ধানের সাথে মিলে এমন কোন টেমপ্লেট নেই।</p>
              <Button>
                <Plus size={16} className="mr-2" />
                নতুন টেমপ্লেট তৈরি করুন
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}