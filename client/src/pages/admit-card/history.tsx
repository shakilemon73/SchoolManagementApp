import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  Calendar,
  User,
  Filter
} from 'lucide-react';

interface AdmitCardHistory {
  id: number;
  cardNumber: string;
  studentName: string;
  studentNameBn: string;
  rollNumber: string;
  className: string;
  section: string;
  examType: string;
  templateName: string;
  status: string;
  createdAt: string;
}

export default function AdmitCardHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch admit card history
  const { data: history, isLoading } = useQuery({
    queryKey: ['/api/admit-cards/history', currentPage, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter
      });
      
      const response = await fetch(`/api/admit-cards/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    }
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">বাতিল</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">মেয়াদ শেষ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil((history?.pagination?.total || 0) / itemsPerPage);

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">এডমিট কার্ড ইতিহাস</h1>
            <p className="text-muted-foreground">
              সকল এডমিট কার্ডের সম্পূর্ণ ইতিহাস এবং বিস্তারিত তথ্য
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admit-card/dashboard">
              <Button variant="outline">
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
            <Link href="/admit-card/create-single">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                নতুন কার্ড
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              ফিল্টার এবং অনুসন্ধান
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">অনুসন্ধান</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="নাম, রোল নম্বর বা কার্ড নম্বর দিয়ে খুঁজুন"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">স্ট্যাটাস</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="active">সক্রিয়</option>
                  <option value="cancelled">বাতিল</option>
                  <option value="expired">মেয়াদ শেষ</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">পরীক্ষার ধরন</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="all">সব পরীক্ষা</option>
                  <option value="JSC">জেএসসি</option>
                  <option value="SSC">এসএসসি</option>
                  <option value="HSC">এইচএসসি</option>
                  <option value="Test">পরীক্ষা</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>এডমিট কার্ড রেকর্ড</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">লোড হচ্ছে...</div>
            ) : history?.data?.length > 0 ? (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-8 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
                  <div>কার্ড নম্বর</div>
                  <div>শিক্ষার্থী</div>
                  <div>রোল</div>
                  <div>শ্রেণী</div>
                  <div>পরীক্ষা</div>
                  <div>স্ট্যাটাস</div>
                  <div>তারিখ</div>
                  <div>কার্যক্রম</div>
                </div>

                {/* Table Rows */}
                {history.data.map((card: AdmitCardHistory) => (
                  <div key={card.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="md:col-span-1">
                      <span className="md:hidden font-medium">কার্ড নম্বর: </span>
                      <span className="font-mono text-sm">{card.cardNumber}</span>
                    </div>
                    
                    <div className="md:col-span-1">
                      <span className="md:hidden font-medium">শিক্ষার্থী: </span>
                      <div>
                        <p className="font-medium">{card.studentNameBn || card.studentName}</p>
                        <p className="text-xs text-muted-foreground">{card.studentName}</p>
                      </div>
                    </div>
                    
                    <div className="md:col-span-1">
                      <span className="md:hidden font-medium">রোল: </span>
                      <span className="font-medium">{card.rollNumber}</span>
                    </div>
                    
                    <div className="md:col-span-1">
                      <span className="md:hidden font-medium">শ্রেণী: </span>
                      <span>{card.className} {card.section && `- ${card.section}`}</span>
                    </div>
                    
                    <div className="md:col-span-1">
                      <span className="md:hidden font-medium">পরীক্ষা: </span>
                      <Badge variant="outline">{card.examType}</Badge>
                    </div>
                    
                    <div className="md:col-span-1">
                      <span className="md:hidden font-medium">স্ট্যাটাস: </span>
                      {getStatusBadge(card.status)}
                    </div>
                    
                    <div className="md:col-span-1">
                      <span className="md:hidden font-medium">তারিখ: </span>
                      <div className="text-sm">
                        <p>{new Date(card.createdAt).toLocaleDateString('bn-BD')}</p>
                        <p className="text-muted-foreground">
                          {new Date(card.createdAt).toLocaleTimeString('bn-BD', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="md:col-span-1">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">কোনো রেকর্ড পাওয়া যায়নি</h3>
                <p className="text-muted-foreground mb-4">
                  আপনার অনুসন্ধান অনুযায়ী কোনো এডমিট কার্ড খুঁজে পাওয়া যায়নি।
                </p>
                <Link href="/admit-card/create-single">
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    প্রথম কার্ড তৈরি করুন
                  </Button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  মোট {history?.pagination?.total || 0} টি রেকর্ড
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    পূর্ববর্তী
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    পরবর্তী
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{history?.pagination?.total || 0}</div>
                  <div className="text-sm text-muted-foreground">মোট কার্ড</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <User className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {history?.data?.filter((c: any) => c.status === 'active').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">সক্রিয় কার্ড</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {history?.data?.filter((c: any) => {
                      const today = new Date();
                      const cardDate = new Date(c.createdAt);
                      return cardDate.toDateString() === today.toDateString();
                    }).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">আজকের কার্ড</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">ডাউনলোড</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}