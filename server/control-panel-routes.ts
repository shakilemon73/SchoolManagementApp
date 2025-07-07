import { Express, Request, Response } from 'express';
import path from 'path';

export function registerControlPanelRoutes(app: Express) {
  // Serve the control panel HTML
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
    <style>
        .sidebar-item:hover { background-color: #f3f4f6; }
        .active { background-color: #dbeafe; color: #1d4ed8; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-white shadow-lg">
            <div class="p-6 border-b">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="shield" class="h-5 w-5 text-white"></i>
                    </div>
                    <span class="text-xl font-bold text-gray-900">Control Panel</span>
                </div>
            </div>
            <nav class="p-4 space-y-2">
                <a href="#dashboard" class="sidebar-item active flex items-center px-3 py-2 text-sm font-medium rounded-md">
                    <i data-lucide="layout-dashboard" class="mr-3 h-5 w-5"></i>
                    Dashboard
                </a>
                <a href="#schools" class="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
                    <i data-lucide="building-2" class="mr-3 h-5 w-5"></i>
                    School Management
                </a>
                <a href="#features" class="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
                    <i data-lucide="layers" class="mr-3 h-5 w-5"></i>
                    Feature Control
                </a>
                <a href="#billing" class="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
                    <i data-lucide="dollar-sign" class="mr-3 h-5 w-5"></i>
                    Billing & Revenue
                </a>
                <a href="#users" class="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
                    <i data-lucide="users" class="mr-3 h-5 w-5"></i>
                    User Management
                </a>
                <a href="#analytics" class="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
                    <i data-lucide="bar-chart-3" class="mr-3 h-5 w-5"></i>
                    System Analytics
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-y-auto">
            <!-- Dashboard View -->
            <div id="dashboard-content" class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                        <p class="text-gray-600">Manage all school instances and system operations</p>
                    </div>
                    <button onclick="createNewSchool()" class="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
                        <i data-lucide="building-2" class="h-4 w-4 mr-2"></i>
                        Add New School
                    </button>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Total Schools</p>
                                <p class="text-2xl font-bold text-gray-900" id="total-schools">Loading...</p>
                                <p class="text-xs text-gray-500" id="active-schools">Loading...</p>
                            </div>
                            <i data-lucide="building-2" class="h-8 w-8 text-blue-600"></i>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Total Users</p>
                                <p class="text-2xl font-bold text-gray-900" id="total-users">Loading...</p>
                                <p class="text-xs text-gray-500">Across all schools</p>
                            </div>
                            <i data-lucide="users" class="h-8 w-8 text-green-600"></i>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                <p class="text-2xl font-bold text-gray-900" id="monthly-revenue">Loading...</p>
                                <p class="text-xs text-green-600">+12.5% from last month</p>
                            </div>
                            <i data-lucide="dollar-sign" class="h-8 w-8 text-yellow-600"></i>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">System Status</p>
                                <p class="text-2xl font-bold text-green-600">Healthy</p>
                                <p class="text-xs text-gray-500">3 pending issues</p>
                            </div>
                            <i data-lucide="server" class="h-8 w-8 text-purple-600"></i>
                        </div>
                    </div>
                </div>

                <!-- School Management Table -->
                <div class="bg-white rounded-lg shadow mb-6">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium text-gray-900">Active Schools</h3>
                        <p class="text-sm text-gray-500">Manage your school customers</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="schools-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Schools will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
                        <p class="text-sm text-gray-500">Common administrative tasks</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <button onclick="createNewSchool()" class="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
                                <i data-lucide="building-2" class="h-6 w-6 mb-2 text-blue-600"></i>
                                <span class="text-sm font-medium">Add School</span>
                            </button>
                            <button onclick="showFeatureControl()" class="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
                                <i data-lucide="layers" class="h-6 w-6 mb-2 text-green-600"></i>
                                <span class="text-sm font-medium">Features</span>
                            </button>
                            <button onclick="showBilling()" class="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
                                <i data-lucide="dollar-sign" class="h-6 w-6 mb-2 text-yellow-600"></i>
                                <span class="text-sm font-medium">Billing</span>
                            </button>
                            <button onclick="showSystemMonitor()" class="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
                                <i data-lucide="server" class="h-6 w-6 mb-2 text-purple-600"></i>
                                <span class="text-sm font-medium">Monitor</span>
                            </button>
                            <button onclick="showSecurity()" class="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
                                <i data-lucide="shield" class="h-6 w-6 mb-2 text-red-600"></i>
                                <span class="text-sm font-medium">Security</span>
                            </button>
                            <button onclick="showAnalytics()" class="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center">
                                <i data-lucide="activity" class="h-6 w-6 mb-2 text-indigo-600"></i>
                                <span class="text-sm font-medium">Analytics</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // Mock data for demonstration
        const mockSchools = [
            {
                id: 1,
                name: 'Dhaka International School',
                email: 'admin@dhakaintl.edu.bd',
                status: 'active',
                plan: 'Premium',
                price: '৳25,000',
                users: 1245,
                teachers: 89
            },
            {
                id: 2,
                name: 'Chittagong Model School',
                email: 'info@ctgmodel.edu.bd',
                status: 'trial',
                plan: 'Basic',
                price: '৳8,000',
                users: 567,
                teachers: 34
            },
            {
                id: 3,
                name: 'Sylhet Science Academy',
                email: 'contact@sylhetscience.edu.bd',
                status: 'active',
                plan: 'Enterprise',
                price: '৳45,000',
                users: 890,
                teachers: 67
            },
            {
                id: 4,
                name: 'Rajshahi Public School',
                email: 'admin@rajpublic.edu.bd',
                status: 'suspended',
                plan: 'Basic',
                price: '৳8,000',
                users: 234,
                teachers: 18
            }
        ];

        // Load dashboard data
        function loadDashboard() {
            // Update stats
            document.getElementById('total-schools').textContent = mockSchools.length;
            document.getElementById('active-schools').textContent = mockSchools.filter(s => s.status === 'active').length + ' active';
            document.getElementById('total-users').textContent = mockSchools.reduce((sum, s) => sum + s.users, 0).toLocaleString();
            document.getElementById('monthly-revenue').textContent = '৳' + (mockSchools.reduce((sum, s) => sum + parseInt(s.price.replace(/[^0-9]/g, '')), 0)).toLocaleString();

            // Load schools table
            const tbody = document.getElementById('schools-table-body');
            tbody.innerHTML = mockSchools.map(school => \`
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i data-lucide="building-2" class="h-5 w-5 text-blue-600"></i>
                            </div>
                            <div class="ml-3">
                                <div class="text-sm font-medium text-gray-900">\${school.name}</div>
                                <div class="text-sm text-gray-500">\${school.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 rounded-full text-xs font-medium \${
                            school.status === 'active' ? 'bg-green-100 text-green-800' :
                            school.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                        }">\${school.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">\${school.plan}</div>
                        <div class="text-sm text-gray-500">\${school.price}/month</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>\${school.users} students</div>
                        <div>\${school.teachers} teachers</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\${school.price}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="manageSchool(\${school.id})" class="text-blue-600 hover:text-blue-900 mr-3">Manage</button>
                        <button onclick="configureSchool(\${school.id})" class="text-green-600 hover:text-green-900 mr-3">Configure</button>
                        <button onclick="toggleSchoolStatus(\${school.id})" class="text-red-600 hover:text-red-900">
                            \${school.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                    </td>
                </tr>
            \`).join('');

            // Re-initialize icons for new content
            lucide.createIcons();
        }

        // Action functions
        function createNewSchool() {
            const name = prompt('Enter school name:');
            if (name) {
                alert('New school "' + name + '" would be created with automated Supabase setup');
            }
        }

        function manageSchool(id) {
            const school = mockSchools.find(s => s.id === id);
            alert('Managing ' + school.name + '\\n\\nAvailable actions:\\n- View detailed analytics\\n- Configure features\\n- Manage users\\n- Update billing');
        }

        function configureSchool(id) {
            const school = mockSchools.find(s => s.id === id);
            alert('Configuring ' + school.name + '\\n\\nConfiguration options:\\n- Enable/disable features\\n- Customize branding\\n- Set academic calendar\\n- Configure payment gateway');
        }

        function toggleSchoolStatus(id) {
            const school = mockSchools.find(s => s.id === id);
            const newStatus = school.status === 'active' ? 'suspended' : 'active';
            school.status = newStatus;
            alert(school.name + ' status changed to: ' + newStatus);
            loadDashboard();
        }

        function showFeatureControl() {
            alert('Feature Control Panel\\n\\nManage features across all schools:\\n- Student Management (Active: 147/147)\\n- Advanced Analytics (Active: 125/147)\\n- Video Conferencing (Active: 88/147)\\n- Library System (Active: 115/147)');
        }

        function showBilling() {
            alert('Billing & Revenue Management\\n\\nTotal Monthly Revenue: ৳2,84,7500\\n- Premium Plans: 89 schools\\n- Basic Plans: 45 schools\\n- Enterprise Plans: 13 schools\\n\\nPending Payments: 3 schools');
        }

        function showSystemMonitor() {
            alert('System Health Monitor\\n\\nSystem Status: Healthy\\n- Uptime: 99.8%\\n- Response Time: 245ms\\n- Active Connections: 234\\n- Database Performance: Optimal');
        }

        function showSecurity() {
            alert('Security Center\\n\\nSecurity Status: Secure\\n- Failed Login Attempts: 12 (last 24h)\\n- Active Admin Sessions: 3\\n- Last Security Scan: 2 hours ago\\n- All systems protected');
        }

        function showAnalytics() {
            alert('System Analytics\\n\\nKey Metrics:\\n- User Growth: +12.5% this month\\n- Feature Adoption: 87% average\\n- Customer Satisfaction: 4.8/5\\n- System Performance: Excellent');
        }

        // Load dashboard on page load
        document.addEventListener('DOMContentLoaded', loadDashboard);
    </script>
</body>
</html>
    `);
  });

  // API endpoint for school data
  app.get('/api/super-admin/schools', (req: Request, res: Response) => {
    const mockSchools = [
      {
        id: 1,
        name: 'Dhaka International School',
        contactEmail: 'admin@dhakaintl.edu.bd',
        status: 'active',
        subscription: { type: 'premium', price: 25000 },
        usage: { students: 1245, teachers: 89 },
        revenue: 25000
      },
      {
        id: 2,
        name: 'Chittagong Model School',
        contactEmail: 'info@ctgmodel.edu.bd',
        status: 'trial',
        subscription: { type: 'basic', price: 8000 },
        usage: { students: 567, teachers: 34 },
        revenue: 8000
      }
    ];

    res.json({ 
      schools: mockSchools,
      stats: {
        total: mockSchools.length,
        active: mockSchools.filter(s => s.status === 'active').length,
        totalRevenue: mockSchools.reduce((sum, s) => sum + s.revenue, 0)
      }
    });
  });
}