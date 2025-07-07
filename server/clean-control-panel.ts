import { Express, Request, Response } from 'express';
import { developerPortalStorage } from './developer-portal-storage';

export function registerCleanControlPanel(app: Express) {
  // API endpoints for control panel data
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
        subdomain: school.subdomain,
        isActive: school.isActive
      }));
      res.json(schoolsData);
    } catch (error) {
      console.error('Error fetching schools:', error);
      res.status(500).json({ error: 'Failed to fetch schools' });
    }
  });

  app.post('/api/super-admin/schools/:id/action', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      
      const schoolId = parseInt(id);
      const school = await developerPortalStorage.getSchoolInstance(schoolId);
      
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      if (action === 'activate') {
        await developerPortalStorage.updateSchoolInstance(schoolId, { status: 'active', isActive: true });
      } else if (action === 'suspend') {
        await developerPortalStorage.updateSchoolInstance(schoolId, { status: 'suspended', isActive: false });
      }

      res.json({ success: true, message: `School ${action}d successfully` });
    } catch (error) {
      console.error('Error performing school action:', error);
      res.status(500).json({ error: 'Failed to perform action' });
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
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .page { display: none; }
        .page.active { display: block; }
        .sidebar-item.active { background-color: #3b82f6; color: white; }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.95); }
    </style>
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-white shadow-lg">
            <div class="p-6 border-b">
                <h1 class="text-xl font-bold text-gray-800">Super Admin</h1>
                <p class="text-sm text-gray-600">Control Panel</p>
            </div>
            
            <nav class="mt-6">
                <a href="#" class="sidebar-item active flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50" onclick="showPage('dashboard')">
                    <i data-lucide="layout-dashboard" class="h-5 w-5 mr-3"></i>
                    Dashboard
                </a>
                <a href="#" class="sidebar-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50" onclick="showPage('schools')">
                    <i data-lucide="building-2" class="h-5 w-5 mr-3"></i>
                    School Management
                </a>
                <a href="#" class="sidebar-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50" onclick="showPage('features')">
                    <i data-lucide="settings" class="h-5 w-5 mr-3"></i>
                    Feature Control
                </a>
                <a href="#" class="sidebar-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50" onclick="showPage('billing')">
                    <i data-lucide="dollar-sign" class="h-5 w-5 mr-3"></i>
                    Billing & Revenue
                </a>
                <a href="#" class="sidebar-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50" onclick="showPage('users')">
                    <i data-lucide="users" class="h-5 w-5 mr-3"></i>
                    User Management
                </a>
                <a href="#" class="sidebar-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50" onclick="showPage('analytics')">
                    <i data-lucide="bar-chart-3" class="h-5 w-5 mr-3"></i>
                    System Analytics
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-auto">
            <!-- Dashboard Page -->
            <div id="dashboard-page" class="page active">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <h1 class="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                        <p class="text-gray-600">Comprehensive system overview and school management</p>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <i data-lucide="building-2" class="h-8 w-8 text-blue-600 mr-4"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Total Schools</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-schools">0</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <i data-lucide="users" class="h-8 w-8 text-green-600 mr-4"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Total Users</p>
                                    <p class="text-2xl font-bold text-gray-900" id="total-users">0</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <i data-lucide="dollar-sign" class="h-8 w-8 text-purple-600 mr-4"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                    <p class="text-2xl font-bold text-gray-900" id="monthly-revenue">৳0</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center">
                                <i data-lucide="activity" class="h-8 w-8 text-orange-600 mr-4"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">System Health</p>
                                    <p class="text-2xl font-bold text-gray-900" id="system-health">99.9%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Schools Page -->
            <div id="schools-page" class="page">
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <h1 class="text-3xl font-bold text-gray-900">School Management</h1>
                        <p class="text-gray-600">Manage all schools in the system</p>
                    </div>
                </div>
                <div class="p-6">
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Schools Overview</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full" id="schools-table">
                                <thead>
                                    <tr class="text-left border-b">
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">School Name</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Users</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                        <th class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr>
                                        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                                            Loading schools data...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Other pages placeholders -->
            <div id="features-page" class="page">
                <div class="p-6">
                    <h1 class="text-2xl font-bold mb-4">Feature Control</h1>
                    <p>Feature management panel coming soon...</p>
                </div>
            </div>
            
            <div id="billing-page" class="page">
                <div class="p-6">
                    <h1 class="text-2xl font-bold mb-4">Billing & Revenue</h1>
                    <p>Billing management panel coming soon...</p>
                </div>
            </div>
            
            <div id="users-page" class="page">
                <div class="p-6">
                    <h1 class="text-2xl font-bold mb-4">User Management</h1>
                    <p>User management panel coming soon...</p>
                </div>
            </div>
            
            <div id="analytics-page" class="page">
                <div class="p-6">
                    <h1 class="text-2xl font-bold mb-4">System Analytics</h1>
                    <p>Analytics dashboard coming soon...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Navigation
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId + '-page').classList.add('active');
            
            // Update sidebar
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            event.target.closest('.sidebar-item').classList.add('active');
            
            // Load page data
            if (pageId === 'dashboard') {
                loadDashboardData();
            } else if (pageId === 'schools') {
                loadSchoolsData();
            }
            
            lucide.createIcons();
        }

        // Data loading functions
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/super-admin/stats');
                const data = await response.json();
                
                document.getElementById('total-schools').textContent = data.totalSchools;
                document.getElementById('total-users').textContent = data.totalUsers;
                document.getElementById('monthly-revenue').textContent = '৳' + data.monthlyRevenue.toLocaleString();
                document.getElementById('system-health').textContent = data.systemHealth + '%';
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        }

        async function loadSchoolsData() {
            try {
                const response = await fetch('/api/super-admin/schools');
                const schools = await response.json();
                
                const tbody = document.querySelector('#schools-table tbody');
                tbody.innerHTML = '';
                
                schools.forEach(school => {
                    const statusClass = school.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                    
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50';
                    row.innerHTML = 
                        '<td class="px-6 py-4">' +
                            '<div class="flex items-center">' +
                                '<div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">' +
                                    school.name.substring(0,2).toUpperCase() +
                                '</div>' +
                                '<div class="ml-4">' +
                                    '<div class="text-sm font-medium text-gray-900">' + school.name + '</div>' +
                                    '<div class="text-sm text-gray-500">' + school.plan + ' Plan</div>' +
                                '</div>' +
                            '</div>' +
                        '</td>' +
                        '<td class="px-6 py-4">' +
                            '<div class="text-sm text-gray-900">' + school.contactEmail + '</div>' +
                        '</td>' +
                        '<td class="px-6 py-4">' +
                            '<span class="px-3 py-1 text-xs font-medium rounded-full ' + statusClass + '">' + school.status.toUpperCase() + '</span>' +
                        '</td>' +
                        '<td class="px-6 py-4">' +
                            '<div class="text-sm text-gray-900">' + school.users + '</div>' +
                        '</td>' +
                        '<td class="px-6 py-4">' +
                            '<div class="text-sm text-gray-900">৳' + school.revenue.toLocaleString() + '</div>' +
                        '</td>' +
                        '<td class="px-6 py-4">' +
                            '<div class="flex items-center space-x-2">' +
                                '<button onclick="activateSchool(' + school.id + ')" class="text-green-600 hover:text-green-800 p-1" title="Activate">' +
                                    '<i data-lucide="play-circle" class="h-4 w-4"></i>' +
                                '</button>' +
                                '<button onclick="suspendSchool(' + school.id + ')" class="text-red-600 hover:text-red-800 p-1" title="Suspend">' +
                                    '<i data-lucide="pause-circle" class="h-4 w-4"></i>' +
                                '</button>' +
                            '</div>' +
                        '</td>';
                    
                    tbody.appendChild(row);
                });
                
                lucide.createIcons();
            } catch (error) {
                console.error('Failed to load schools data:', error);
            }
        }

        // School actions
        async function activateSchool(schoolId) {
            try {
                const response = await fetch('/api/super-admin/schools/' + schoolId + '/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'activate' })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('School activated successfully');
                    loadSchoolsData();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Failed to activate school');
            }
        }

        async function suspendSchool(schoolId) {
            if (confirm('Are you sure you want to suspend this school?')) {
                try {
                    const response = await fetch('/api/super-admin/schools/' + schoolId + '/action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'suspend' })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        alert('School suspended successfully');
                        loadSchoolsData();
                    } else {
                        alert('Error: ' + result.error);
                    }
                } catch (error) {
                    alert('Failed to suspend school');
                }
            }
        }

        // Initialize
        lucide.createIcons();
        loadDashboardData();
    </script>
</body>
</html>
    `);
  });
}