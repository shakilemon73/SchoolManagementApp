import { Express, Request, Response } from 'express';
import { developerPortalStorage } from './developer-portal-storage';

export function registerSimpleControlPanel(app: Express) {
  // API endpoint for dashboard statistics
  app.get('/api/super-admin/stats', async (req: Request, res: Response) => {
    try {
      const schools = await developerPortalStorage.getAllSchoolInstances();
      const activeSchools = schools.filter(s => s.status === 'active').length;
      const totalUsers = schools.reduce((sum, s) => sum + (s.maxStudents || 0), 0);
      const monthlyRevenue = schools.reduce((sum, s) => sum + (s.subscriptionFee || 0), 0);

      res.json({
        totalSchools: schools.length,
        activeSchools,
        totalUsers,
        monthlyRevenue,
        systemHealth: 99.9,
        recentSchools: schools.slice(0, 3).map(s => ({
          id: s.id,
          name: s.name,
          status: s.status,
          users: s.maxStudents || 0,
          plan: 'Premium'
        }))
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // API endpoint for school management data
  app.get('/api/super-admin/schools', async (req: Request, res: Response) => {
    try {
      const schools = await developerPortalStorage.getAllSchoolInstances();
      const schoolsData = schools.map(school => ({
        id: school.id,
        name: school.name,
        contactEmail: school.contactEmail,
        status: school.status,
        users: school.maxStudents || 0,
        revenue: school.subscriptionFee || 0,
        plan: 'Premium',
        createdAt: school.createdAt,
        supabaseUrl: school.supabaseUrl,
        subdomain: school.subdomain,
        isActive: school.isActive
      }));
      res.json(schoolsData);
    } catch (error) {
      console.error('Error fetching schools:', error);
      res.status(500).json({ error: 'Failed to fetch schools' });
    }
  });

  // API endpoint for school control actions
  app.post('/api/super-admin/schools/:id/action', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { action, data } = req.body;
      
      const schoolId = parseInt(id);
      const school = await developerPortalStorage.getSchoolInstance(schoolId);
      
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      switch (action) {
        case 'activate':
          await developerPortalStorage.updateSchoolInstance(schoolId, { status: 'active', isActive: true });
          break;
        case 'suspend':
          await developerPortalStorage.updateSchoolInstance(schoolId, { status: 'suspended', isActive: false });
          break;
        case 'update_limits':
          await developerPortalStorage.updateSchoolInstance(schoolId, { 
            maxStudents: data.maxStudents,
            maxTeachers: data.maxTeachers 
          });
          break;
        case 'update_subscription':
          await developerPortalStorage.updateSchoolInstance(schoolId, { 
            subscriptionFee: data.subscriptionFee,
            subscriptionType: data.subscriptionType 
          });
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      res.json({ success: true, message: `Action ${action} completed successfully` });
    } catch (error) {
      console.error('Error performing school action:', error);
      res.status(500).json({ error: 'Failed to perform action' });
    }
  });

  // API endpoint for system-wide user analytics
  app.get('/api/super-admin/user-analytics', async (req: Request, res: Response) => {
    try {
      const schools = await developerPortalStorage.getAllSchoolInstances();
      
      // Calculate system-wide metrics
      const totalStudents = schools.reduce((sum, s) => sum + (s.maxStudents || 0), 0);
      const totalRevenue = schools.reduce((sum, s) => sum + (s.subscriptionFee || 0), 0);
      const activeSchools = schools.filter(s => s.status === 'active').length;
      const trialSchools = schools.filter(s => s.status === 'trial').length;

      res.json({
        totalSchools: schools.length,
        activeSchools,
        trialSchools,
        totalStudents,
        totalRevenue,
        averageRevenuePerSchool: schools.length > 0 ? totalRevenue / schools.length : 0,
        growthMetrics: {
          newSchoolsThisMonth: schools.filter(s => {
            const createdDate = new Date(s.createdAt);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
          }).length
        }
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // API endpoint for creating new school instance
  app.post('/api/super-admin/schools/create', async (req: Request, res: Response) => {
    try {
      const { name, contactEmail, address, maxStudents, subscriptionFee } = req.body;
      
      const newSchool = await developerPortalStorage.createSchoolInstance({
        name,
        contactEmail,
        address: address || null,
        subdomain: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        maxStudents: maxStudents || 100,
        subscriptionFee: subscriptionFee || 0,
        status: 'trial',
        isActive: true,
        supabaseUrl: null,
        supabaseProjectId: null
      });

      res.json({ success: true, school: newSchool });
    } catch (error) {
      console.error('Error creating school:', error);
      res.status(500).json({ error: 'Failed to create school' });
    }
  });

  app.get('/super-admin', (req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Admin Control Panel</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .sidebar-item { 
            transition: all 0.3s ease;
            border-radius: 8px;
            cursor: pointer;
        }
        .sidebar-item:hover { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            transform: translateX(4px);
        }
        .sidebar-item.active { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1d4ed8;
            border-left: 4px solid #2563eb;
        }
        .stat-card { 
            transition: all 0.3s ease;
            border-radius: 12px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 1px solid #e2e8f0;
        }
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 16px;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 glass-effect shadow-xl">
            <div class="p-6 border-b border-gray-200/50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <i data-lucide="shield" class="h-6 w-6 text-white"></i>
                        </div>
                        <div>
                            <span class="text-xl font-bold text-gray-900">Control Panel</span>
                            <div class="text-xs text-gray-500">Super Admin</div>
                        </div>
                    </div>
                    <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button onclick="changeLanguage('en')" class="px-3 py-1 text-xs rounded bg-blue-100 text-blue-800" id="lang-en">EN</button>
                        <button onclick="changeLanguage('bn')" class="px-3 py-1 text-xs rounded hover:bg-gray-200" id="lang-bn">বাং</button>
                    </div>
                </div>
            </div>
            
            <nav class="p-4 space-y-2">
                <a href="#dashboard" class="sidebar-item active flex items-center px-3 py-3 text-sm font-medium">
                    <i data-lucide="layout-dashboard" class="mr-3 h-5 w-5"></i>
                    <span>Dashboard</span>
                </a>
                <a href="#schools" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium text-gray-600">
                    <i data-lucide="building-2" class="mr-3 h-5 w-5"></i>
                    <span>School Management</span>
                    <span class="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full" id="schools-count">0</span>
                </a>
                <a href="#features" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium text-gray-600">
                    <i data-lucide="layers" class="mr-3 h-5 w-5"></i>
                    <span>Feature Control</span>
                </a>
                <a href="#billing" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium text-gray-600">
                    <i data-lucide="dollar-sign" class="mr-3 h-5 w-5"></i>
                    <span>Billing & Revenue</span>
                </a>
                <a href="#users" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium text-gray-600">
                    <i data-lucide="users" class="mr-3 h-5 w-5"></i>
                    <span>User Management</span>
                </a>
                <a href="#analytics" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium text-gray-600">
                    <i data-lucide="bar-chart-3" class="mr-3 h-5 w-5"></i>
                    <span>System Analytics</span>
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-y-auto">
            <!-- Dashboard Page -->
            <div id="dashboard-page" class="page">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="super_admin_dashboard">Super Admin Dashboard</h1>
                        <p class="text-gray-600" data-translate="system_overview">Comprehensive system overview and school management</p>
                        
                        <div class="mt-4 flex items-center space-x-4 text-sm">
                            <div class="flex items-center space-x-2">
                                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span class="text-green-700" data-translate="all_systems_operational">All Systems Operational</span>
                            </div>
                            <div class="text-gray-500">|</div>
                            <div class="text-gray-600">Last updated: 2 minutes ago</div>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="stat-card bg-white p-6 shadow-lg">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                    <i data-lucide="building-2" class="h-7 w-7 text-blue-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Schools</p>
                                    <p class="text-3xl font-bold text-gray-900" id="total-schools">0</p>
                                    <div class="flex items-center mt-1">
                                        <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                        <span class="text-xs text-green-600">+12% this month</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white p-6 shadow-lg">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                    <i data-lucide="users" class="h-7 w-7 text-green-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Users</p>
                                    <p class="text-3xl font-bold text-gray-900" id="total-users">0</p>
                                    <div class="flex items-center mt-1">
                                        <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                        <span class="text-xs text-green-600">+8.2% this week</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white p-6 shadow-lg">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                                    <i data-lucide="dollar-sign" class="h-7 w-7 text-yellow-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                    <p class="text-3xl font-bold text-gray-900" id="monthly-revenue">৳0</p>
                                    <div class="flex items-center mt-1">
                                        <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                        <span class="text-xs text-green-600">+15.3% growth</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white p-6 shadow-lg">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                                    <i data-lucide="activity" class="h-7 w-7 text-purple-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">System Health</p>
                                    <p class="text-3xl font-bold text-green-600">99.9%</p>
                                    <div class="flex items-center mt-1">
                                        <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span class="text-xs text-green-600">All services operational</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                            <canvas id="revenueChart" width="400" height="250"></canvas>
                        </div>
                        
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">School Growth</h3>
                            <canvas id="schoolChart" width="400" height="250"></canvas>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                <button class="text-sm text-blue-600 hover:text-blue-800">View All</button>
                            </div>
                            <div class="space-y-4" id="recent-schools-list">
                                <div class="text-center text-gray-500 py-4">
                                    <i data-lucide="loader" class="h-6 w-6 animate-spin mx-auto mb-2"></i>
                                    Loading recent activity...
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div class="space-y-3">
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3" onclick="createNewSchool()">
                                    <i data-lucide="plus" class="h-5 w-5 text-blue-600"></i>
                                    <span class="text-sm font-medium">Add New School</span>
                                </button>
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                                    <i data-lucide="settings" class="h-5 w-5 text-gray-600"></i>
                                    <span class="text-sm font-medium">System Settings</span>
                                </button>
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                                    <i data-lucide="download" class="h-5 w-5 text-green-600"></i>
                                    <span class="text-sm font-medium">Export Data</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- School Management Page -->
            <div id="schools-page" class="page hidden">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900" data-translate="school_management">School Management</h1>
                                <p class="text-gray-600" data-translate="comprehensive_school_admin">Comprehensive school administration and oversight</p>
                            </div>
                            <div class="flex items-center space-x-3">
                                <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm" onclick="createSchoolModal()">
                                    <i data-lucide="plus" class="h-4 w-4 mr-2 inline"></i>
                                    <span data-translate="create_school">Create School</span>
                                </button>
                                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm" onclick="exportSchoolsData()">
                                    <i data-lucide="download" class="h-4 w-4 mr-2 inline"></i>
                                    <span data-translate="export_data">Export Data</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Quick Stats for Schools -->
                        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="bg-blue-50 rounded-lg p-4">
                                <div class="flex items-center">
                                    <i data-lucide="building-2" class="h-8 w-8 text-blue-600 mr-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-blue-600" data-translate="total_schools">Total Schools</p>
                                        <p class="text-2xl font-bold text-blue-900" id="schools-total">0</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-green-50 rounded-lg p-4">
                                <div class="flex items-center">
                                    <i data-lucide="check-circle" class="h-8 w-8 text-green-600 mr-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-green-600" data-translate="active_schools">Active Schools</p>
                                        <p class="text-2xl font-bold text-green-900" id="schools-active">0</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-yellow-50 rounded-lg p-4">
                                <div class="flex items-center">
                                    <i data-lucide="clock" class="h-8 w-8 text-yellow-600 mr-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-yellow-600" data-translate="trial_schools">Trial Schools</p>
                                        <p class="text-2xl font-bold text-yellow-900" id="schools-trial">0</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-4">
                                <div class="flex items-center">
                                    <i data-lucide="dollar-sign" class="h-8 w-8 text-purple-600 mr-3"></i>
                                    <div>
                                        <p class="text-sm font-medium text-purple-600" data-translate="monthly_revenue">Monthly Revenue</p>
                                        <p class="text-2xl font-bold text-purple-900" id="schools-revenue">৳0</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="p-6">
                    <!-- Search and Filter Controls -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                            <div class="flex-1 max-w-lg">
                                <div class="relative">
                                    <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"></i>
                                    <input type="text" placeholder="Search schools..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" id="schools-search" onkeyup="filterSchoolsTable()">
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" id="status-filter" onchange="filterSchoolsTable()">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="trial">Trial</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                                <button class="text-gray-400 hover:text-gray-600" onclick="resetSchoolFilters()">
                                    <i data-lucide="x" class="h-4 w-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Schools Data Table -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-translate="schools_overview">Schools Overview</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full" id="schools-table">
                                <thead>
                                    <tr class="text-left border-b">
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="school_name">School Name</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="contact">Contact</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="status">Status</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="users">Users</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="revenue">Revenue</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr>
                                        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                                            <i data-lucide="loader" class="h-8 w-8 animate-spin mx-auto mb-2"></i>
                                            <span data-translate="loading_schools">Loading schools data...</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- School Control Modal -->
                <div id="school-control-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                    <div class="flex items-center justify-center min-h-screen p-4">
                        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                            <div class="p-6 border-b">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900" id="modal-title">School Control</h3>
                                    <button onclick="closeSchoolModal()" class="text-gray-400 hover:text-gray-600">
                                        <i data-lucide="x" class="h-6 w-6"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="p-6" id="modal-content">
                                <!-- Modal content will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Feature Control Page -->
            <div id="features-page" class="page hidden">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="feature_control">Feature Control</h1>
                        <p class="text-gray-600" data-translate="manage_features">Manage feature flags and permissions for all schools</p>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-translate="global_features">Global Features</h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <h4 class="font-medium" data-translate="student_portal">Student Portal</h4>
                                        <p class="text-sm text-gray-500" data-translate="portal_access">Enable student access portal</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" class="sr-only peer" checked>
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <h4 class="font-medium" data-translate="teacher_portal">Teacher Portal</h4>
                                        <p class="text-sm text-gray-500" data-translate="teacher_access">Enable teacher management portal</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" class="sr-only peer" checked>
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <h4 class="font-medium" data-translate="payment_gateway">Payment Gateway</h4>
                                        <p class="text-sm text-gray-500" data-translate="online_payments">Enable online payment processing</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" class="sr-only peer">
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-translate="feature_usage">Feature Usage Statistics</h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-gray-600" data-translate="student_portal">Student Portal</span>
                                    <span class="text-sm text-gray-900">85% adoption</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: 85%"></div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-gray-600" data-translate="teacher_portal">Teacher Portal</span>
                                    <span class="text-sm text-gray-900">92% adoption</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-600 h-2 rounded-full" style="width: 92%"></div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-gray-600" data-translate="payment_gateway">Payment Gateway</span>
                                    <span class="text-sm text-gray-900">34% adoption</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-yellow-600 h-2 rounded-full" style="width: 34%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Billing & Revenue Page -->
            <div id="billing-page" class="page hidden">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="billing_revenue">Billing & Revenue</h1>
                        <p class="text-gray-600" data-translate="financial_overview">Financial overview and billing management</p>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                    <i data-lucide="dollar-sign" class="h-7 w-7 text-green-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="total_revenue">Total Revenue</p>
                                    <p class="text-3xl font-bold text-gray-900">৳2.4L</p>
                                    <div class="flex items-center mt-1">
                                        <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                        <span class="text-xs text-green-600">+18% this month</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                    <i data-lucide="credit-card" class="h-7 w-7 text-blue-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="pending_payments">Pending Payments</p>
                                    <p class="text-3xl font-bold text-gray-900">৳45K</p>
                                    <div class="flex items-center mt-1">
                                        <span class="text-xs text-orange-600">3 schools overdue</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                                    <i data-lucide="trending-up" class="h-7 w-7 text-purple-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="growth_rate">Growth Rate</p>
                                    <p class="text-3xl font-bold text-gray-900">+23%</p>
                                    <div class="flex items-center mt-1">
                                        <span class="text-xs text-green-600">Year over year</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4" data-translate="recent_transactions">Recent Transactions</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="text-left border-b">
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="school">School</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="amount">Amount</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="date">Date</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="status">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4">
                                            <div class="text-sm font-medium text-gray-900">Test High School</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="text-sm text-gray-900">৳25,000</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="text-sm text-gray-900">Dec 15, 2024</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800" data-translate="paid">Paid</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Management Page -->
            <div id="users-page" class="page hidden">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="user_management">User Management</h1>
                        <p class="text-gray-600" data-translate="manage_system_users">Manage system administrators and portal users</p>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                    <i data-lucide="users" class="h-7 w-7 text-blue-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="total_users">Total Users</p>
                                    <p class="text-2xl font-bold text-gray-900">1,247</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                    <i data-lucide="user-check" class="h-7 w-7 text-green-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="active_users">Active Users</p>
                                    <p class="text-2xl font-bold text-gray-900">1,156</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                                    <i data-lucide="shield" class="h-7 w-7 text-yellow-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="admins">Admins</p>
                                    <p class="text-2xl font-bold text-gray-900">12</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                                    <i data-lucide="user-x" class="h-7 w-7 text-red-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="suspended">Suspended</p>
                                    <p class="text-2xl font-bold text-gray-900">23</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900" data-translate="user_list">User List</h3>
                            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                <i data-lucide="user-plus" class="h-4 w-4 mr-2 inline"></i>
                                <span data-translate="add_user">Add User</span>
                            </button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="text-left border-b">
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="name">Name</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="email">Email</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="role">Role</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="status">Status</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase" data-translate="actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center">
                                                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">SA</div>
                                                <div class="ml-3">
                                                    <div class="text-sm font-medium text-gray-900">Super Admin</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="text-sm text-gray-900">admin@portal.com</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800" data-translate="super_admin">Super Admin</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800" data-translate="active">Active</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center space-x-2">
                                                <button class="text-blue-600 hover:text-blue-800">
                                                    <i data-lucide="edit" class="h-4 w-4"></i>
                                                </button>
                                                <button class="text-red-600 hover:text-red-800">
                                                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Analytics Page -->
            <div id="analytics-page" class="page hidden">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="system_analytics">System Analytics</h1>
                        <p class="text-gray-600" data-translate="performance_insights">Performance insights and system metrics</p>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                    <i data-lucide="activity" class="h-7 w-7 text-green-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="uptime">System Uptime</p>
                                    <p class="text-2xl font-bold text-gray-900">99.9%</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                    <i data-lucide="zap" class="h-7 w-7 text-blue-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="response_time">Avg Response</p>
                                    <p class="text-2xl font-bold text-gray-900">120ms</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                                    <i data-lucide="database" class="h-7 w-7 text-yellow-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="database_size">Database Size</p>
                                    <p class="text-2xl font-bold text-gray-900">2.4GB</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <div class="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                                    <i data-lucide="server" class="h-7 w-7 text-purple-600"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600" data-translate="cpu_usage">CPU Usage</p>
                                    <p class="text-2xl font-bold text-gray-900">34%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-translate="performance_metrics">Performance Metrics</h3>
                            <canvas id="performanceChart" width="400" height="200"></canvas>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-translate="error_logs">Recent Error Logs</h3>
                            <div class="space-y-3">
                                <div class="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <div class="flex justify-between">
                                        <p class="text-sm font-medium text-yellow-800">Warning: High memory usage</p>
                                        <span class="text-xs text-yellow-600">2 mins ago</span>
                                    </div>
                                </div>
                                <div class="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                                    <div class="flex justify-between">
                                        <p class="text-sm font-medium text-green-800">Info: Backup completed</p>
                                        <span class="text-xs text-green-600">1 hour ago</span>
                                    </div>
                                </div>
                                <div class="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                                    <div class="flex justify-between">
                                        <p class="text-sm font-medium text-blue-800">Info: System maintenance scheduled</p>
                                        <span class="text-xs text-blue-600">3 hours ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // Language support with translations
        let currentLanguage = 'en';

        const translations = {
            en: {
                // Header and Navigation
                'super_admin_dashboard': 'Super Admin Dashboard',
                'system_overview': 'Comprehensive system overview and school management',
                'all_systems_operational': 'All Systems Operational',
                'dashboard': 'Dashboard',
                'school_management': 'School Management',
                'feature_control': 'Feature Control',
                'billing_revenue': 'Billing & Revenue',
                'user_management': 'User Management',
                'system_analytics': 'System Analytics',
                
                // Dashboard Stats
                'total_schools': 'Total Schools',
                'total_users': 'Total Users',
                'monthly_revenue': 'Monthly Revenue',
                'system_health': 'System Health',
                'recent_activity': 'Recent Activity',
                'quick_actions': 'Quick Actions',
                'add_new_school': 'Add New School',
                'system_settings': 'System Settings',
                'export_data': 'Export Data',
                
                // Feature Control
                'manage_features': 'Manage feature flags and permissions for all schools',
                'global_features': 'Global Features',
                'student_portal': 'Student Portal',
                'teacher_portal': 'Teacher Portal',
                'payment_gateway': 'Payment Gateway',
                'portal_access': 'Enable student access portal',
                'teacher_access': 'Enable teacher management portal',
                'online_payments': 'Enable online payment processing',
                'feature_usage': 'Feature Usage Statistics',
                
                // Billing
                'financial_overview': 'Financial overview and billing management',
                'total_revenue': 'Total Revenue',
                'pending_payments': 'Pending Payments',
                'growth_rate': 'Growth Rate',
                'recent_transactions': 'Recent Transactions',
                'school': 'School',
                'amount': 'Amount',
                'date': 'Date',
                'status': 'Status',
                'paid': 'Paid',
                
                // User Management
                'manage_system_users': 'Manage system administrators and portal users',
                'active_users': 'Active Users',
                'admins': 'Admins',
                'suspended': 'Suspended',
                'user_list': 'User List',
                'add_user': 'Add User',
                'name': 'Name',
                'email': 'Email',
                'role': 'Role',
                'actions': 'Actions',
                'super_admin': 'Super Admin',
                'active': 'Active',
                
                // Analytics
                'performance_insights': 'Performance insights and system metrics',
                'uptime': 'System Uptime',
                'response_time': 'Avg Response',
                'database_size': 'Database Size',
                'cpu_usage': 'CPU Usage',
                'performance_metrics': 'Performance Metrics',
                'error_logs': 'Recent Error Logs'
            },
            bn: {
                // Header and Navigation
                'super_admin_dashboard': 'সুপার অ্যাডমিন ড্যাশবোর্ড',
                'system_overview': 'সম্পূর্ণ সিস্টেম ওভারভিউ এবং স্কুল ব্যবস্থাপনা',
                'all_systems_operational': 'সব সিস্টেম চালু',
                'dashboard': 'ড্যাশবোর্ড',
                'school_management': 'স্কুল ব্যবস্থাপনা',
                'feature_control': 'ফিচার নিয়ন্ত্রণ',
                'billing_revenue': 'বিলিং এবং রাজস্ব',
                'user_management': 'ব্যবহারকারী ব্যবস্থাপনা',
                'system_analytics': 'সিস্টেম বিশ্লেষণ',
                
                // Dashboard Stats
                'total_schools': 'মোট স্কুল',
                'total_users': 'মোট ব্যবহারকারী',
                'monthly_revenue': 'মাসিক আয়',
                'system_health': 'সিস্টেম স্বাস্থ্য',
                'recent_activity': 'সাম্প্রতিক কার্যকলাপ',
                'quick_actions': 'দ্রুত কাজ',
                'add_new_school': 'নতুন স্কুল যোগ করুন',
                'system_settings': 'সিস্টেম সেটিংস',
                'export_data': 'ডেটা রপ্তানি',
                
                // Feature Control
                'manage_features': 'সব স্কুলের জন্য ফিচার ফ্ল্যাগ এবং অনুমতি পরিচালনা করুন',
                'global_features': 'গ্লোবাল ফিচার',
                'student_portal': 'ছাত্র পোর্টাল',
                'teacher_portal': 'শিক্ষক পোর্টাল',
                'payment_gateway': 'পেমেন্ট গেটওয়ে',
                'portal_access': 'ছাত্র অ্যাক্সেস পোর্টাল সক্রিয় করুন',
                'teacher_access': 'শিক্ষক ব্যবস্থাপনা পোর্টাল সক্রিয় করুন',
                'online_payments': 'অনলাইন পেমেন্ট প্রসেসিং সক্রিয় করুন',
                'feature_usage': 'ফিচার ব্যবহারের পরিসংখ্যান',
                
                // Billing
                'financial_overview': 'আর্থিক ওভারভিউ এবং বিলিং ব্যবস্থাপনা',
                'total_revenue': 'মোট রাজস্ব',
                'pending_payments': 'অমীমাংসিত পেমেন্ট',
                'growth_rate': 'বৃদ্ধির হার',
                'recent_transactions': 'সাম্প্রতিক লেনদেন',
                'school': 'স্কুল',
                'amount': 'পরিমাণ',
                'date': 'তারিখ',
                'status': 'অবস্থা',
                'paid': 'পরিশোধিত',
                
                // User Management
                'manage_system_users': 'সিস্টেম প্রশাসক এবং পোর্টাল ব্যবহারকারী পরিচালনা করুন',
                'active_users': 'সক্রিয় ব্যবহারকারী',
                'admins': 'প্রশাসক',
                'suspended': 'স্থগিত',
                'user_list': 'ব্যবহারকারী তালিকা',
                'add_user': 'ব্যবহারকারী যোগ করুন',
                'name': 'নাম',
                'email': 'ইমেইল',
                'role': 'ভূমিকা',
                'actions': 'কাজ',
                'super_admin': 'সুপার অ্যাডমিন',
                'active': 'সক্রিয়',
                
                // Analytics
                'performance_insights': 'কর্মক্ষমতার অন্তর্দৃষ্টি এবং সিস্টেম মেট্রিক্স',
                'uptime': 'সিস্টেম আপটাইম',
                'response_time': 'গড় প্রতিক্রিয়া',
                'database_size': 'ডেটাবেস আকার',
                'cpu_usage': 'সিপিইউ ব্যবহার',
                'performance_metrics': 'কর্মক্ষমতা মেট্রিক্স',
                'error_logs': 'সাম্প্রতিক ত্রুটি লগ'
            }
        };

        function changeLanguage(lang) {
            currentLanguage = lang;
            
            const enBtn = document.getElementById('lang-en');
            const bnBtn = document.getElementById('lang-bn');
            
            if (lang === 'en') {
                enBtn.className = 'px-3 py-1 text-xs rounded bg-blue-100 text-blue-800';
                bnBtn.className = 'px-3 py-1 text-xs rounded hover:bg-gray-200';
            } else {
                enBtn.className = 'px-3 py-1 text-xs rounded hover:bg-gray-200';
                bnBtn.className = 'px-3 py-1 text-xs rounded bg-blue-100 text-blue-800';
            }
            
            // Apply translations
            updateTranslations();
        }

        function updateTranslations() {
            const elements = document.querySelectorAll('[data-translate]');
            elements.forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[currentLanguage] && translations[currentLanguage][key]) {
                    element.textContent = translations[currentLanguage][key];
                }
            });
        }



        // Initialize charts
        function initializeCharts() {
            const revenueCtx = document.getElementById('revenueChart');
            if (revenueCtx) {
                new Chart(revenueCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Revenue (৳)',
                            data: [2850000, 2450000, 3200000, 3250000, 2800000, 3400000],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } }
                    }
                });
            }

            const schoolCtx = document.getElementById('schoolChart');
            if (schoolCtx) {
                new Chart(schoolCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'New Schools',
                            data: [12, 19, 8, 15, 22, 18],
                            backgroundColor: 'rgba(34, 197, 94, 0.8)'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } }
                    }
                });
            }

            // Performance chart for analytics page
            const performanceCtx = document.getElementById('performanceChart');
            if (performanceCtx) {
                new Chart(performanceCtx, {
                    type: 'line',
                    data: {
                        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                        datasets: [{
                            label: 'Response Time (ms)',
                            data: [120, 110, 140, 160, 120, 100],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Response Time (ms)'
                                }
                            }
                        }
                    }
                });
            }
        }

        function createNewSchool() {
            const name = prompt('Enter school name:');
            if (name) {
                alert('New school ' + name + ' would be created with automated setup');
            }
        }

        // Load real data from API
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/super-admin/stats');
                const data = await response.json();
                
                document.getElementById('total-schools').textContent = data.totalSchools;
                document.getElementById('active-schools').textContent = data.activeSchools;
                document.getElementById('total-users').textContent = data.totalUsers.toLocaleString();
                document.getElementById('monthly-revenue').textContent = '৳' + data.monthlyRevenue.toLocaleString();
                
                // Update schools count in sidebar
                const schoolsCountElement = document.getElementById('schools-count');
                if (schoolsCountElement) {
                    schoolsCountElement.textContent = data.totalSchools;
                }
                
                // Load recent schools
                const recentList = document.getElementById('recent-schools-list');
                if (recentList && data.recentSchools) {
                    recentList.innerHTML = '';
                    data.recentSchools.forEach(school => {
                        const schoolDiv = document.createElement('div');
                        schoolDiv.className = 'flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg';
                        schoolDiv.innerHTML = '<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><i data-lucide="building-2" class="h-4 w-4 text-blue-600"></i></div><div class="flex-1"><p class="text-sm font-medium text-gray-900">' + school.name + '</p><p class="text-sm text-gray-500">' + school.users + ' users • ' + school.plan + '</p></div>';
                        recentList.appendChild(schoolDiv);
                    });
                }
                
                lucide.createIcons();
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        }

        let allSchoolsData = [];
        
        async function loadSchoolsData() {
            try {
                const [schoolsResponse, analyticsResponse] = await Promise.all([
                    fetch('/api/super-admin/schools'),
                    fetch('/api/super-admin/user-analytics')
                ]);
                
                const schools = await schoolsResponse.json();
                const analytics = await analyticsResponse.json();
                allSchoolsData = schools;
                
                // Update schools page statistics
                document.getElementById('schools-total').textContent = analytics.totalSchools;
                document.getElementById('schools-active').textContent = analytics.activeSchools;
                document.getElementById('schools-trial').textContent = analytics.trialSchools;
                document.getElementById('schools-revenue').textContent = '৳' + analytics.totalRevenue.toLocaleString();
                
                renderSchoolsTable(schools);
                
            } catch (error) {
                console.error('Failed to load schools data:', error);
            }
        }

        function renderSchoolsTable(schools) {
            const tbody = document.querySelector('#schools-table tbody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            if (schools.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No schools found</td></tr>';
                return;
            }
            
            schools.forEach(school => {
                const statusColor = getSchoolStatusColor(school.status);
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                row.innerHTML = 
                    '<td class="px-6 py-4">' +
                        '<div class="flex items-center">' +
                            '<div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">' +
                                school.name.substring(0,2).toUpperCase() +
                            '</div>' +
                            '<div class="ml-4">' +
                                '<div class="text-sm font-medium text-gray-900">' + school.name + '</div>' +
                                '<div class="text-sm text-gray-500">Subdomain: ' + (school.subdomain || 'Not set') + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                    '<td class="px-6 py-4">' +
                        '<div class="text-sm text-gray-900">' + school.contactEmail + '</div>' +
                        '<div class="text-sm text-gray-500">Created: ' + new Date(school.createdAt).toLocaleDateString() + '</div>' +
                    '</td>' +
                    '<td class="px-6 py-4">' +
                        '<span class="px-3 py-1 text-xs font-medium rounded-full ' + statusColor + '">' + school.status.toUpperCase() + '</span>' +
                    '</td>' +
                    '<td class="px-6 py-4">' +
                        '<div class="text-sm text-gray-900">' + school.users + '</div>' +
                        '<div class="text-sm text-gray-500">Max: ' + school.users + '</div>' +
                    '</td>' +
                    '<td class="px-6 py-4">' +
                        '<div class="text-sm text-gray-900">৳' + school.revenue.toLocaleString() + '</div>' +
                        '<div class="text-sm text-gray-500">Monthly</div>' +
                    '</td>' +
                    '<td class="px-6 py-4">' +
                        '<div class="flex items-center space-x-2">' +
                            '<button class="text-blue-600 hover:text-blue-800 p-1" onclick="viewSchoolDetails(' + school.id + ')" title="View Details">' +
                                '<i data-lucide="eye" class="h-4 w-4"></i>' +
                            '</button>' +
                            '<button class="text-green-600 hover:text-green-800 p-1" onclick="controlSchool(' + school.id + ')" title="Control School">' +
                                '<i data-lucide="settings" class="h-4 w-4"></i>' +
                            '</button>' +
                            '<button class="text-yellow-600 hover:text-yellow-800 p-1" onclick="controlSchool(' + school.id + ')" title="Edit Settings">' +
                                '<i data-lucide="edit" class="h-4 w-4"></i>' +
                            '</button>' +
                            '<button class="text-red-600 hover:text-red-800 p-1" onclick="suspendSchool(' + school.id + ')" title="Suspend">' +
                                '<i data-lucide="pause-circle" class="h-4 w-4"></i>' +
                            '</button>' +
                        '</div>' +
                    '</td>';
                
                tbody.appendChild(row);
            });
            
            lucide.createIcons();
        }

        function getSchoolStatusColor(status) {
            switch(status) {
                case 'active': return 'bg-green-100 text-green-800';
                case 'trial': return 'bg-blue-100 text-blue-800';
                case 'suspended': return 'bg-red-100 text-red-800';
                case 'expired': return 'bg-yellow-100 text-yellow-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        function filterSchoolsTable() {
            const searchTerm = document.getElementById('schools-search').value.toLowerCase();
            const statusFilter = document.getElementById('status-filter').value;
            
            let filteredSchools = allSchoolsData.filter(school => {
                const matchesSearch = school.name.toLowerCase().includes(searchTerm) || 
                                    school.contactEmail.toLowerCase().includes(searchTerm);
                const matchesStatus = !statusFilter || school.status === statusFilter;
                
                return matchesSearch && matchesStatus;
            });
            
            renderSchoolsTable(filteredSchools);
        }

        function resetSchoolFilters() {
            document.getElementById('schools-search').value = '';
            document.getElementById('status-filter').value = '';
            renderSchoolsTable(allSchoolsData);
        }

        // School Management Functions
        function viewSchoolDetails(schoolId) {
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (!school) return;
            
            const modalContent = 
                '<div class="space-y-4">' +
                    '<div class="grid grid-cols-2 gap-4">' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">School Name</label>' +
                            '<p class="mt-1 text-sm text-gray-900">' + school.name + '</p>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Contact Email</label>' +
                            '<p class="mt-1 text-sm text-gray-900">' + school.contactEmail + '</p>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Status</label>' +
                            '<span class="mt-1 px-3 py-1 text-xs font-medium rounded-full ' + getSchoolStatusColor(school.status) + '">' + school.status.toUpperCase() + '</span>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Users</label>' +
                            '<p class="mt-1 text-sm text-gray-900">' + school.users + ' / ' + school.users + '</p>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Monthly Revenue</label>' +
                            '<p class="mt-1 text-sm text-gray-900">৳' + school.revenue.toLocaleString() + '</p>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Created Date</label>' +
                            '<p class="mt-1 text-sm text-gray-900">' + new Date(school.createdAt).toLocaleString() + '</p>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Subdomain</label>' +
                            '<p class="mt-1 text-sm text-gray-900">' + (school.subdomain || 'Not set') + '</p>' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Supabase URL</label>' +
                            '<p class="mt-1 text-sm text-gray-900">' + (school.supabaseUrl || 'Not configured') + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="mt-6 flex justify-end space-x-3">' +
                        '<button onclick="controlSchool(' + schoolId + ')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Control School</button>' +
                        '<button onclick="closeSchoolModal()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Close</button>' +
                    '</div>' +
                '</div>';
            
            showSchoolModal('School Details: ' + school.name, modalContent);
        }

        function controlSchool(schoolId) {
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (!school) return;
            
            const modalContent = 
                '<div class="space-y-6">' +
                    '<div class="grid grid-cols-2 gap-4">' +
                        '<div class="bg-gray-50 p-4 rounded-lg">' +
                            '<h4 class="font-medium text-gray-900 mb-2">Quick Actions</h4>' +
                            '<div class="space-y-2">' +
                                '<button onclick="activateSchool(' + schoolId + ')" class="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">Activate School</button>' +
                                '<button onclick="suspendSchool(' + schoolId + ')" class="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">Suspend School</button>' +
                                '<button onclick="viewSchoolStats(' + schoolId + ')" class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">View Statistics</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="bg-gray-50 p-4 rounded-lg">' +
                            '<h4 class="font-medium text-gray-900 mb-2">School Access</h4>' +
                            '<div class="space-y-2">' +
                                '<button onclick="accessSchoolPanel(' + schoolId + ')" class="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">Access Panel</button>' +
                                '<button onclick="exportSchoolData(' + schoolId + ')" class="w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700">Export Data</button>' +
                                '<button onclick="manageSchoolUsers(' + schoolId + ')" class="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700">Manage Users</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="border-t pt-4">' +
                        '<h4 class="font-medium text-gray-900 mb-3">Update School Settings</h4>' +
                        '<div class="grid grid-cols-2 gap-4">' +
                            '<div>' +
                                '<label class="block text-sm font-medium text-gray-700">Max Students</label>' +
                                '<input type="number" id="max-students-' + schoolId + '" value="' + school.users + '" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                            '</div>' +
                            '<div>' +
                                '<label class="block text-sm font-medium text-gray-700">Monthly Fee (৳)</label>' +
                                '<input type="number" id="monthly-fee-' + schoolId + '" value="' + school.revenue + '" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                            '</div>' +
                        '</div>' +
                        '<button onclick="updateSchoolSettings(' + schoolId + ')" class="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Update Settings</button>' +
                    '</div>' +
                '</div>';
            
            showSchoolModal('Control School: ' + school.name, modalContent);
        }

        // School Action Functions
        async function activateSchool(schoolId) {
            await performSchoolAction(schoolId, 'activate');
        }

        async function suspendSchool(schoolId) {
            if (confirm('Are you sure you want to suspend this school?')) {
                await performSchoolAction(schoolId, 'suspend');
            }
        }

        async function performSchoolAction(schoolId, action) {
            try {
                const response = await fetch('/api/super-admin/schools/' + schoolId + '/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Action completed successfully');
                    closeSchoolModal();
                    loadSchoolsData();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Failed to perform action: ' + error.message);
            }
        }

        async function updateSchoolSettings(schoolId) {
            const maxStudents = document.getElementById('max-students-' + schoolId).value;
            const monthlyFee = document.getElementById('monthly-fee-' + schoolId).value;
            
            try {
                const response = await fetch('/api/super-admin/schools/' + schoolId + '/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'update_limits',
                        data: { maxStudents: parseInt(maxStudents), subscriptionFee: parseInt(monthlyFee) }
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('School settings updated successfully');
                    closeSchoolModal();
                    loadSchoolsData();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Failed to update settings: ' + error.message);
            }
        }

        function viewSchoolStats(schoolId) {
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (!school) return;
            
            alert('School Statistics for ' + school.name + '\n\nUsers: ' + school.users + '\nRevenue: ৳' + school.revenue + '\nStatus: ' + school.status);
        }

        function accessSchoolPanel(schoolId) {
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (school && school.subdomain) {
                window.open('https://' + school.subdomain + '.schoolsystem.com/admin', '_blank');
            } else {
                alert('School panel not configured yet');
            }
        }

        function exportSchoolData(schoolId) {
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (!school) return;
            
            const data = JSON.stringify(school, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = school.name + '_data.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        function manageSchoolUsers(schoolId) {
            const school = allSchoolsData.find(s => s.id === schoolId);
            alert('User management for ' + school.name + ' will open in a new window');
        }

        function accessSchoolAdmin(schoolId) {
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (school && school.subdomain) {
                window.open('https://' + school.subdomain + '.your-domain.com/admin', '_blank');
            } else {
                alert('School subdomain not configured');
            }
        }

        function showSchoolModal(title, content) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-content').innerHTML = content;
            document.getElementById('school-control-modal').classList.remove('hidden');
        }

        function closeSchoolModal() {
            document.getElementById('school-control-modal').classList.add('hidden');
        }

        function createSchoolModal() {
            const modalContent = 
                '<form onsubmit="createNewSchool(event)" class="space-y-4">' +
                    '<div class="grid grid-cols-2 gap-4">' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">School Name *</label>' +
                            '<input type="text" id="new-school-name" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Contact Email *</label>' +
                            '<input type="email" id="new-school-email" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Address</label>' +
                            '<input type="text" id="new-school-address" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Max Students</label>' +
                            '<input type="number" id="new-school-students" value="100" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                        '</div>' +
                        '<div>' +
                            '<label class="block text-sm font-medium text-gray-700">Monthly Fee (৳)</label>' +
                            '<input type="number" id="new-school-fee" value="0" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">' +
                        '</div>' +
                    '</div>' +
                    '<div class="flex justify-end space-x-3 mt-6">' +
                        '<button type="button" onclick="closeSchoolModal()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>' +
                        '<button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Create School</button>' +
                    '</div>' +
                '</form>';
            
            showSchoolModal('Create New School', modalContent);
        }

        async function createNewSchool(event) {
            event.preventDefault();
            
            const formData = {
                name: document.getElementById('new-school-name').value,
                contactEmail: document.getElementById('new-school-email').value,
                address: document.getElementById('new-school-address').value,
                maxStudents: parseInt(document.getElementById('new-school-students').value),
                subscriptionFee: parseInt(document.getElementById('new-school-fee').value)
            };
            
            try {
                const response = await fetch('/api/super-admin/schools/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('School created successfully: ' + result.school.name);
                    closeSchoolModal();
                    loadSchoolsData();
                } else {
                    alert('Error creating school: ' + result.error);
                }
            } catch (error) {
                alert('Failed to create school: ' + error.message);
            }
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            lucide.createIcons();
            initializeCharts();
            loadDashboardData();
            initializeSidebar();
            initializeLanguageButtons();
            updateTranslations();
            showPage('dashboard');
        });

        // Initialize language toggle buttons
        function initializeLanguageButtons() {
            const enBtn = document.getElementById('lang-en');
            const bnBtn = document.getElementById('lang-bn');
            
            if (enBtn) {
                enBtn.addEventListener('click', () => changeLanguage('en'));
            }
            if (bnBtn) {
                bnBtn.addEventListener('click', () => changeLanguage('bn'));
            }
        }

        // Main page navigation function
        function showPage(pageId) {
            console.log('Switching to page:', pageId);
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });
            
            // Show selected page
            const targetPage = document.getElementById(pageId + '-page');
            if (targetPage) {
                targetPage.classList.remove('hidden');
                console.log('Page shown:', pageId + '-page');
            } else {
                console.error('Page not found:', pageId + '-page');
            }
            
            // Update sidebar active state
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Find and activate the correct sidebar item
            const sidebarItems = document.querySelectorAll('.sidebar-item');
            for (let item of sidebarItems) {
                const href = item.getAttribute('href');
                if (href === '#' + pageId) {
                    item.classList.add('active');
                    console.log('Activated sidebar item for:', pageId);
                    break;
                }
            }

            // Load data for specific pages
            if (pageId === 'schools') {
                loadSchoolsData();
            }
        }
        
        // Add click event listeners to sidebar items
        function initializeSidebar() {
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const href = this.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        const pageId = href.substring(1);
                        showPage(pageId);
                    }
                });
            });
        }
    </script>
</body>
</html>
    `);
  });
}