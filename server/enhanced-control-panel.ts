import { Express, Request, Response } from 'express';

export function registerEnhancedControlPanel(app: Express) {
  // Enhanced control panel route (overrides the basic one)
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
        /* Don Norman - Affordances & Signifiers */
        .sidebar-item { 
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 8px;
            cursor: pointer;
        }
        .sidebar-item:hover { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .sidebar-item.active { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1d4ed8;
            box-shadow: 0 4px 20px rgba(29, 78, 216, 0.25);
            border-left: 4px solid #2563eb;
        }

        /* Steve Krug - Don't Make Me Think */
        .lang-btn { 
            transition: all 0.2s ease;
            font-weight: 600;
            letter-spacing: 0.025em;
        }
        .lang-btn:hover { 
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .lang-btn.active {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        /* Luke Wroblewski - Mobile First */
        .stat-card { 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 12px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
        }
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .stat-card:hover::before {
            opacity: 1;
        }

        /* Aarron Walter - Emotional Design */
        .action-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .action-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        .action-btn:hover::before {
            left: 100%;
        }
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }

        /* Jonathan Ive - Simplicity & Craftsmanship */
        .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 16px;
        }

        /* Julie Zhuo - Consistent Design System */
        .spacing-system { margin: 8px; }
        .spacing-system-2x { margin: 16px; }
        .spacing-system-3x { margin: 24px; }
        
        /* Dieter Rams - Good Design */
        .minimal-input {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            transition: all 0.3s ease;
            background: #ffffff;
        }
        .minimal-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: #f8fafc;
        }

        /* Farai Madzima - Inclusive Design */
        .high-contrast { 
            background: #000000;
            color: #ffffff;
        }
        .focus-visible {
            outline: 3px solid #3b82f6;
            outline-offset: 2px;
        }

        /* Alan Cooper - Direct Manipulation */
        .draggable {
            cursor: move;
            user-select: none;
        }
        .draggable:active {
            cursor: grabbing;
        }

        /* Susan Weinschenk - Psychology of Design */
        .cognitive-load-reduction {
            max-width: 7ch; /* Miller's Rule: 7±2 items */
        }
        .scanning-pattern {
            line-height: 1.6;
            margin-bottom: 16px;
        }

        /* Advanced Micro-interactions */
        @keyframes slideInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInScale {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-up {
            animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-scale {
            animation: fadeInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Data Visualization Enhancement */
        .chart-container {
            position: relative;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        /* Table Enhancement */
        .enhanced-table {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .enhanced-table thead {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        }
        .enhanced-table tbody tr:hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            transform: scale(1.01);
            transition: all 0.2s ease;
        }

        /* Status Indicators with Better Semantics */
        .status-active {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            color: #166534;
            border: 1px solid #86efac;
        }
        .status-trial {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border: 1px solid #93c5fd;
        }
        .status-suspended {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
            border: 1px solid #fca5a5;
        }

        /* Progressive Disclosure */
        .expandable-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .expandable-content.expanded {
            max-height: 500px;
        }

        /* Loading States */
        .skeleton {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        /* Error States */
        .error-state {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 16px;
            color: #991b1b;
        }

        /* Success States */
        .success-state {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 16px;
            color: #166534;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <!-- Sidebar - Enhanced with UX Principles -->
        <div class="w-64 glass-effect shadow-2xl">
            <div class="p-6 border-b border-gray-200/50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 animate-fade-scale">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <i data-lucide="shield" class="h-6 w-6 text-white"></i>
                        </div>
                        <div>
                            <span class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent" data-translate="control_panel">Control Panel</span>
                            <div class="text-xs text-gray-500" data-translate="super_admin">Super Admin</div>
                        </div>
                    </div>
                    <!-- Enhanced Language Switcher -->
                    <div class="flex space-x-1 bg-gray-100/80 rounded-lg p-1">
                        <button onclick="changeLanguage('en')" class="lang-btn px-3 py-1.5 text-xs rounded-md bg-blue-100 text-blue-800 active" id="lang-en">EN</button>
                        <button onclick="changeLanguage('bn')" class="lang-btn px-3 py-1.5 text-xs rounded-md hover:bg-gray-200" id="lang-bn">বাং</button>
                    </div>
                </div>
            </div>
            
            <!-- Navigation with Contextual Grouping (Information Architecture) -->
            <nav class="p-4 space-y-3">
                <!-- Core Management -->
                <div class="mb-4">
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3" data-translate="core_management">Core Management</div>
                    <a href="#dashboard" class="sidebar-item active flex items-center px-3 py-3 text-sm font-medium rounded-lg" onclick="showPage('dashboard')" tabindex="0">
                        <i data-lucide="layout-dashboard" class="mr-3 h-5 w-5"></i>
                        <span data-translate="dashboard">Dashboard</span>
                        <div class="ml-auto w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </a>
                    <a href="#schools" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600" onclick="showPage('schools')" tabindex="0">
                        <i data-lucide="building-2" class="mr-3 h-5 w-5"></i>
                        <span data-translate="school_management">School Management</span>
                        <span class="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">147</span>
                    </a>
                </div>

                <!-- Operations -->
                <div class="mb-4">
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3" data-translate="operations">Operations</div>
                    <a href="#features" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600" onclick="showPage('features')" tabindex="0">
                        <i data-lucide="layers" class="mr-3 h-5 w-5"></i>
                        <span data-translate="feature_control">Feature Control</span>
                        <span class="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">8</span>
                    </a>
                    <a href="#billing" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600" onclick="showPage('billing')" tabindex="0">
                        <i data-lucide="dollar-sign" class="mr-3 h-5 w-5"></i>
                        <span data-translate="billing_revenue">Billing & Revenue</span>
                        <span class="ml-auto text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">3</span>
                    </a>
                </div>

                <!-- Analytics & Users -->
                <div>
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3" data-translate="insights">Insights</div>
                    <a href="#users" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600" onclick="showPage('users')" tabindex="0">
                        <i data-lucide="users" class="mr-3 h-5 w-5"></i>
                        <span data-translate="user_management">User Management</span>
                        <span class="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">45.6K</span>
                    </a>
                    <a href="#analytics" class="sidebar-item flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-600" onclick="showPage('analytics')" tabindex="0">
                        <i data-lucide="bar-chart-3" class="mr-3 h-5 w-5"></i>
                        <span data-translate="system_analytics">System Analytics</span>
                        <div class="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </a>
                </div>
            </nav>

            <!-- User Context & Status (Persistent Info) -->
            <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 bg-white/80">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <i data-lucide="user" class="h-4 w-4 text-white"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">Super Admin</p>
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <p class="text-xs text-gray-500">System Healthy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-y-auto">
            <!-- Dashboard Page - Enhanced with UX Principles -->
            <div id="dashboard-page" class="page">
                <!-- Header with Contextual Actions -->
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <div class="flex items-center justify-between">
                            <div class="animate-slide-up">
                                <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent" data-translate="super_admin_dashboard">Super Admin Dashboard</h1>
                                <p class="text-gray-600 scanning-pattern" data-translate="manage_all_schools">Comprehensive system overview and school management</p>
                            </div>
                            <div class="flex items-center space-x-3">
                                <button class="action-btn text-sm" onclick="refreshDashboard()">
                                    <i data-lucide="refresh-cw" class="h-4 w-4 mr-2"></i>
                                    <span data-translate="refresh">Refresh</span>
                                </button>
                                <button class="action-btn text-sm" onclick="createNewSchool()">
                                    <i data-lucide="building-2" class="h-4 w-4 mr-2"></i>
                                    <span data-translate="add_new_school">Add New School</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Real-time Status Banner -->
                        <div class="mt-4 flex items-center space-x-4 text-sm">
                            <div class="flex items-center space-x-2">
                                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span class="text-green-700" data-translate="system_operational">All Systems Operational</span>
                            </div>
                            <div class="text-gray-500">|</div>
                            <div class="text-gray-600" data-translate="last_updated">Last updated: <span id="last-update-time">2 minutes ago</span></div>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    <!-- Enhanced Stats Grid with Progressive Disclosure -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <!-- School Statistics Card -->
                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.1s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                        <i data-lucide="building-2" class="h-7 w-7 text-blue-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="total_schools">Total Schools</p>
                                        <p class="text-3xl font-bold text-gray-900" id="total-schools">147</p>
                                        <div class="flex items-center mt-1">
                                            <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                            <span class="text-xs text-green-600">+12% this month</span>
                                        </div>
                                    </div>
                                </div>
                                <button class="text-gray-400 hover:text-gray-600" onclick="expandCard('schools')">
                                    <i data-lucide="more-horizontal" class="h-5 w-5"></i>
                                </button>
                            </div>
                            <!-- Progressive Disclosure Content -->
                            <div id="schools-details" class="expandable-content mt-4 pt-4 border-t border-gray-100">
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span class="text-gray-500">Active:</span>
                                        <span class="font-semibold text-green-600 ml-1" id="active-schools">134</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Trial:</span>
                                        <span class="font-semibold text-blue-600 ml-1">13</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Users Statistics Card -->
                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.2s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                        <i data-lucide="users" class="h-7 w-7 text-green-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="total_users">Active Users</p>
                                        <p class="text-3xl font-bold text-gray-900" id="total-users">45.6K</p>
                                        <div class="flex items-center mt-1">
                                            <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                            <span class="text-xs text-green-600">+8.2% this week</span>
                                        </div>
                                    </div>
                                </div>
                                <button class="text-gray-400 hover:text-gray-600" onclick="expandCard('users')">
                                    <i data-lucide="more-horizontal" class="h-5 w-5"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Revenue Statistics Card -->
                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.3s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                                        <i data-lucide="dollar-sign" class="h-7 w-7 text-yellow-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="monthly_revenue">Monthly Revenue</p>
                                        <p class="text-3xl font-bold text-gray-900" id="monthly-revenue">৳28.5L</p>
                                        <div class="flex items-center mt-1">
                                            <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                            <span class="text-xs text-green-600">+15.3% vs last month</span>
                                        </div>
                                    </div>
                                </div>
                                <button class="text-gray-400 hover:text-gray-600" onclick="expandCard('revenue')">
                                    <i data-lucide="more-horizontal" class="h-5 w-5"></i>
                                </button>
                            </div>
                        </div>

                        <!-- System Health Card -->
                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.4s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                                        <i data-lucide="activity" class="h-7 w-7 text-purple-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="system_status">System Health</p>
                                        <p class="text-3xl font-bold text-green-600" data-translate="healthy">99.9%</p>
                                        <div class="flex items-center mt-1">
                                            <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                            <span class="text-xs text-green-600">All services operational</span>
                                        </div>
                                    </div>
                                </div>
                                <button class="text-gray-400 hover:text-gray-600" onclick="expandCard('health')">
                                    <i data-lucide="more-horizontal" class="h-5 w-5"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Charts with Better Data Visualization -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div class="chart-container animate-slide-up" style="animation-delay: 0.5s">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900" data-translate="revenue_trend">Revenue Trend</h3>
                                <div class="flex space-x-2">
                                    <button class="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full" onclick="changeChartPeriod('7d')">7D</button>
                                    <button class="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full" onclick="changeChartPeriod('30d')">30D</button>
                                    <button class="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full" onclick="changeChartPeriod('90d')">90D</button>
                                </div>
                            </div>
                            <canvas id="revenueChart" width="400" height="250"></canvas>
                        </div>
                        
                        <div class="chart-container animate-slide-up" style="animation-delay: 0.6s">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900" data-translate="school_growth">School Growth</h3>
                                <div class="flex items-center space-x-2">
                                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span class="text-xs text-gray-600">New Schools</span>
                                    <div class="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                                    <span class="text-xs text-gray-600">Active</span>
                                </div>
                            </div>
                            <canvas id="schoolChart" width="400" height="250"></canvas>
                        </div>
                    </div>

                    <!-- Recent Activity Feed with Better Information Hierarchy -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 animate-slide-up" style="animation-delay: 0.7s">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900" data-translate="recent_activity">Recent Activity</h3>
                                <button class="text-sm text-blue-600 hover:text-blue-800" onclick="viewAllActivity()" data-translate="view_all">View All</button>
                            </div>
                            <div class="space-y-4" id="activity-feed">
                                <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="user-plus" class="h-4 w-4 text-green-600"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900">New school registered</p>
                                        <p class="text-sm text-gray-500">Dhaka International School joined the platform</p>
                                        <p class="text-xs text-gray-400 mt-1">2 minutes ago</p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="credit-card" class="h-4 w-4 text-blue-600"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900">Payment received</p>
                                        <p class="text-sm text-gray-500">৳24,999 from Milestone Academy</p>
                                        <p class="text-xs text-gray-400 mt-1">15 minutes ago</p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="alert-triangle" class="h-4 w-4 text-yellow-600"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900">System maintenance</p>
                                        <p class="text-sm text-gray-500">Scheduled maintenance completed successfully</p>
                                        <p class="text-xs text-gray-400 mt-1">1 hour ago</p>
                                    </div>
                                </div>
                                <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="users" class="h-4 w-4 text-purple-600"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900">User milestone reached</p>
                                        <p class="text-sm text-gray-500">45,000+ active users across all schools</p>
                                        <p class="text-xs text-gray-400 mt-1">3 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions Panel -->
                        <div class="bg-white rounded-xl shadow-lg p-6 animate-slide-up" style="animation-delay: 0.8s">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4" data-translate="quick_actions">Quick Actions</h3>
                            <div class="space-y-3">
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3" onclick="createNewSchool()">
                                    <i data-lucide="plus" class="h-5 w-5 text-blue-600"></i>
                                    <span class="text-sm font-medium" data-translate="add_school">Add New School</span>
                                </button>
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3" onclick="showPage('features')">
                                    <i data-lucide="settings" class="h-5 w-5 text-gray-600"></i>
                                    <span class="text-sm font-medium" data-translate="feature_control">Feature Control</span>
                                </button>
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3" onclick="exportSystemReport()">
                                    <i data-lucide="download" class="h-5 w-5 text-green-600"></i>
                                    <span class="text-sm font-medium" data-translate="export_data">Export Data</span>
                                </button>
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3" onclick="sendBroadcast()">
                                    <i data-lucide="mail" class="h-5 w-5 text-purple-600"></i>
                                    <span class="text-sm font-medium" data-translate="send_broadcast">Send Broadcast</span>
                                </button>
                                <button class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3" onclick="viewSystemHealth()">
                                    <i data-lucide="activity" class="h-5 w-5 text-orange-600"></i>
                                    <span class="text-sm font-medium" data-translate="system_health">System Health</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- School Management Page - Enhanced with UX Principles -->
            <div id="schools-page" class="page hidden">
                <!-- Header with Search and Actions -->
                <div class="glass-effect border-b border-gray-200/50">
                    <div class="px-6 py-6">
                        <div class="flex items-center justify-between">
                            <div class="animate-slide-up">
                                <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent" data-translate="school_management">School Management</h1>
                                <p class="text-gray-600 scanning-pattern" data-translate="manage_all_school_instances">Comprehensive school administration and oversight</p>
                            </div>
                            <div class="flex items-center space-x-3">
                                <button class="action-btn text-sm bg-gray-600" onclick="bulkOperations()">
                                    <i data-lucide="settings" class="h-4 w-4 mr-2"></i>
                                    <span data-translate="bulk_operations">Bulk Operations</span>
                                </button>
                                <button class="action-btn text-sm" onclick="createNewSchool()">
                                    <i data-lucide="plus" class="h-4 w-4 mr-2"></i>
                                    <span data-translate="add_new_school">Add New School</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Advanced Search and Filters -->
                        <div class="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                            <div class="flex-1 max-w-lg">
                                <div class="relative">
                                    <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"></i>
                                    <input type="text" placeholder="Search schools..." class="minimal-input w-full pl-10 pr-4" id="school-search" onkeyup="filterSchools()">
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <select class="minimal-input text-sm" id="status-filter" onchange="filterSchools()">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="trial">Trial</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                                <select class="minimal-input text-sm" id="region-filter" onchange="filterSchools()">
                                    <option value="">All Regions</option>
                                    <option value="dhaka">Dhaka</option>
                                    <option value="chittagong">Chittagong</option>
                                    <option value="sylhet">Sylhet</option>
                                </select>
                                <button class="text-gray-400 hover:text-gray-600" onclick="resetFilters()">
                                    <i data-lucide="x" class="h-4 w-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6">

                    <!-- School Stats with Better Visual Hierarchy -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.1s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                        <i data-lucide="building-2" class="h-7 w-7 text-blue-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="total_schools">Total Schools</p>
                                        <p class="text-3xl font-bold text-gray-900">147</p>
                                        <div class="flex items-center mt-1">
                                            <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                            <span class="text-xs text-green-600">+12% this month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.2s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                                        <i data-lucide="check-circle" class="h-7 w-7 text-green-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="active_schools">Active Schools</p>
                                        <p class="text-3xl font-bold text-gray-900">134</p>
                                        <div class="flex items-center mt-1">
                                            <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                            <span class="text-xs text-green-600">91% active rate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.3s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                        <i data-lucide="clock" class="h-7 w-7 text-blue-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="trial_schools">Trial Schools</p>
                                        <p class="text-3xl font-bold text-gray-900">13</p>
                                        <div class="flex items-center mt-1">
                                            <i data-lucide="calendar" class="h-3 w-3 text-blue-500 mr-1"></i>
                                            <span class="text-xs text-blue-600">30-day trials</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card bg-white p-6 shadow-lg animate-fade-scale" style="animation-delay: 0.4s">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                                        <i data-lucide="dollar-sign" class="h-7 w-7 text-yellow-600"></i>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600 scanning-pattern" data-translate="monthly_revenue">Monthly Revenue</p>
                                        <p class="text-3xl font-bold text-gray-900">৳28.5L</p>
                                        <div class="flex items-center mt-1">
                                            <i data-lucide="trending-up" class="h-3 w-3 text-green-500 mr-1"></i>
                                            <span class="text-xs text-green-600">+15.3% growth</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Schools Table -->
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden animate-slide-up" style="animation-delay: 0.5s">
                        <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold text-gray-900" data-translate="schools_overview">Schools Overview</h3>
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm text-gray-500" id="showing-count">Showing 147 schools</span>
                                    <button class="text-gray-400 hover:text-gray-600" onclick="refreshSchoolsTable()">
                                        <i data-lucide="refresh-cw" class="h-4 w-4"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="enhanced-table w-full">
                                <thead>
                                    <tr class="text-left">
                                        <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onclick="toggleAllSchools()">
                                        </th>
                                        <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onclick="sortTable('name')">
                                            <span data-translate="school_name">School Name</span>
                                            <i data-lucide="chevron-up-down" class="h-3 w-3 inline ml-1"></i>
                                        </th>
                                        <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <span data-translate="contact_info">Contact Info</span>
                                        </th>
                                        <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onclick="sortTable('status')">
                                            <span data-translate="status">Status</span>
                                            <i data-lucide="chevron-up-down" class="h-3 w-3 inline ml-1"></i>
                                        </th>
                                        <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onclick="sortTable('users')">
                                            <span data-translate="users">Users</span>
                                            <i data-lucide="chevron-up-down" class="h-3 w-3 inline ml-1"></i>
                                        </th>
                                        <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onclick="sortTable('revenue')">
                                            <span data-translate="revenue">Revenue</span>
                                            <i data-lucide="chevron-up-down" class="h-3 w-3 inline ml-1"></i>
                                        </th>
                                        <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <span data-translate="actions">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200" id="schools-table-body">
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center">
                                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                    DI
                                                </div>
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900">Dhaka International School</div>
                                                    <div class="text-sm text-gray-500">Premium Plan • Since Jan 2024</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="text-sm text-gray-900">admin@dhakaintl.edu.bd</div>
                                            <div class="text-sm text-gray-500">+880 1711 234567</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="status-active px-3 py-1 text-xs font-medium rounded-full">Active</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="text-sm text-gray-900">1,247</div>
                                            <div class="text-sm text-gray-500">+23 this month</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="text-sm text-gray-900">৳12,500</div>
                                            <div class="text-sm text-green-600">+15% growth</div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center space-x-2">
                                                <button class="text-blue-600 hover:text-blue-800" onclick="viewSchool('1')">
                                                    <i data-lucide="eye" class="h-4 w-4"></i>
                                                </button>
                                                <button class="text-gray-600 hover:text-gray-800" onclick="editSchool('1')">
                                                    <i data-lucide="edit" class="h-4 w-4"></i>
                                                </button>
                                                <button class="text-red-600 hover:text-red-800" onclick="deleteSchool('1')">
                                                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Additional rows will be loaded dynamically -->
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination with Better UX -->
                        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div class="flex items-center justify-between">
                                <div class="text-sm text-gray-700">
                                    Showing <span class="font-medium">1</span> to <span class="font-medium">25</span> of <span class="font-medium">147</span> schools
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled>
                                        Previous
                                    </button>
                                    <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">1</button>
                                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">2</button>
                                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">3</button>
                                    <span class="px-2">...</span>
                                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">6</button>
                                    <button class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    <div class="bg-white rounded-lg shadow p-4">
                        <div class="flex items-center space-x-2">
                            <i data-lucide="check-circle" class="h-8 w-8 text-green-600"></i>
                            <div>
                                <p class="text-sm text-gray-600" data-translate="active_schools">Active Schools</p>
                                <p class="text-2xl font-bold">134</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-4">
                        <div class="flex items-center space-x-2">
                            <i data-lucide="clock" class="h-8 w-8 text-blue-600"></i>
                            <div>
                                <p class="text-sm text-gray-600" data-translate="trial_schools">Trial Schools</p>
                                <p class="text-2xl font-bold">8</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-4">
                        <div class="flex items-center space-x-2">
                            <i data-lucide="x-circle" class="h-8 w-8 text-red-600"></i>
                            <div>
                                <p class="text-sm text-gray-600" data-translate="suspended_schools">Suspended</p>
                                <p class="text-2xl font-bold">5</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Schools Table -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium text-gray-900" data-translate="schools_list">Schools List</h3>
                        <div class="mt-4 flex space-x-4">
                            <input type="text" placeholder="Search schools..." class="px-4 py-2 border rounded-md flex-1" id="school-search">
                            <select class="px-4 py-2 border rounded-md" id="status-filter">
                                <option value="all" data-translate="all_status">All Status</option>
                                <option value="active" data-translate="active">Active</option>
                                <option value="trial" data-translate="trial">Trial</option>
                                <option value="suspended" data-translate="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="school">School</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="status">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="plan">Plan</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="usage">Usage</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="revenue">Revenue</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="schools-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Schools will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Feature Control Page -->
            <div id="features-page" class="page p-6 hidden">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="feature_control">Feature Control</h1>
                        <p class="text-gray-600" data-translate="control_feature_rollouts">Control feature rollouts and availability across all schools</p>
                    </div>
                    <button onclick="addNewFeature()" class="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
                        <i data-lucide="plus" class="h-4 w-4 mr-2"></i>
                        <span data-translate="add_new_feature">Add New Feature</span>
                    </button>
                </div>

                <!-- Feature Categories -->
                <div class="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    <button onclick="filterFeatures('all')" class="feature-filter active bg-blue-600 text-white px-4 py-2 rounded-md whitespace-nowrap" data-category="all">
                        <span data-translate="all_features">All Features</span>
                    </button>
                    <button onclick="filterFeatures('academic')" class="feature-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-md whitespace-nowrap" data-category="academic">
                        <span data-translate="academic">Academic</span>
                    </button>
                    <button onclick="filterFeatures('financial')" class="feature-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-md whitespace-nowrap" data-category="financial">
                        <span data-translate="financial">Financial</span>
                    </button>
                    <button onclick="filterFeatures('communication')" class="feature-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-md whitespace-nowrap" data-category="communication">
                        <span data-translate="communication">Communication</span>
                    </button>
                    <button onclick="filterFeatures('management')" class="feature-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-md whitespace-nowrap" data-category="management">
                        <span data-translate="management">Management</span>
                    </button>
                    <button onclick="filterFeatures('advanced')" class="feature-filter bg-gray-200 text-gray-700 px-4 py-2 rounded-md whitespace-nowrap" data-category="advanced">
                        <span data-translate="advanced">Advanced</span>
                    </button>
                </div>

                <!-- Features Grid -->
                <div id="features-grid" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <!-- Features will be loaded here -->
                </div>
            </div>

            <!-- Billing & Revenue Page -->
            <div id="billing-page" class="page p-6 hidden">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="billing_revenue">Billing & Revenue</h1>
                        <p class="text-gray-600" data-translate="comprehensive_financial_management">Comprehensive financial management and revenue analytics</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="exportBillingReport()" class="bg-green-600 text-white px-4 py-2 rounded-md flex items-center">
                            <i data-lucide="download" class="h-4 w-4 mr-2"></i>
                            <span data-translate="export_report">Export Report</span>
                        </button>
                        <button onclick="createInvoice()" class="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
                            <i data-lucide="plus" class="h-4 w-4 mr-2"></i>
                            <span data-translate="create_invoice">Create Invoice</span>
                        </button>
                    </div>
                </div>

                <!-- Revenue Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="total_revenue">Total Revenue</p>
                                <p class="text-2xl font-bold text-gray-900">৳28,47,500</p>
                                <p class="text-xs text-green-600">+12.5% <span data-translate="this_month">this month</span></p>
                            </div>
                            <i data-lucide="dollar-sign" class="h-8 w-8 text-green-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="pending_payments">Pending Payments</p>
                                <p class="text-2xl font-bold text-gray-900">৳1,25,000</p>
                                <p class="text-xs text-red-600">3 <span data-translate="overdue">overdue</span></p>
                            </div>
                            <i data-lucide="clock" class="h-8 w-8 text-red-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="avg_revenue_per_school">Avg Revenue/School</p>
                                <p class="text-2xl font-bold text-gray-900">৳19,370</p>
                                <p class="text-xs text-gray-500" data-translate="per_month">per month</p>
                            </div>
                            <i data-lucide="trending-up" class="h-8 w-8 text-blue-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="churn_rate">Churn Rate</p>
                                <p class="text-2xl font-bold text-gray-900">2.3%</p>
                                <p class="text-xs text-green-600">-0.5% <span data-translate="improved">improved</span></p>
                            </div>
                            <i data-lucide="user-x" class="h-8 w-8 text-purple-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Revenue Chart -->
                <div class="bg-white rounded-lg shadow mb-6">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium text-gray-900" data-translate="revenue_trends">Revenue Trends</h3>
                    </div>
                    <div class="p-6">
                        <canvas id="revenue-chart" width="400" height="200"></canvas>
                    </div>
                </div>

                <!-- Billing Table -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium text-gray-900" data-translate="recent_transactions">Recent Transactions</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="school">School</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="amount">Amount</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="date">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="status">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="billing-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Billing data will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- User Management Page -->
            <div id="users-page" class="page p-6 hidden">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="user_management">User Management</h1>
                        <p class="text-gray-600" data-translate="manage_users_across_schools">Manage users across all school instances</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="bulkUserOperations()" class="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
                            <i data-lucide="settings" class="h-4 w-4 mr-2"></i>
                            <span data-translate="bulk_operations">Bulk Operations</span>
                        </button>
                        <button onclick="addNewUser()" class="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
                            <i data-lucide="user-plus" class="h-4 w-4 mr-2"></i>
                            <span data-translate="add_user">Add User</span>
                        </button>
                    </div>
                </div>

                <!-- User Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="total_users">Total Users</p>
                                <p class="text-2xl font-bold text-gray-900">45,672</p>
                                <p class="text-xs text-green-600">+8.2% <span data-translate="this_month">this month</span></p>
                            </div>
                            <i data-lucide="users" class="h-8 w-8 text-blue-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="active_users">Active Users</p>
                                <p class="text-2xl font-bold text-gray-900">38,420</p>
                                <p class="text-xs text-gray-500">84% <span data-translate="of_total">of total</span></p>
                            </div>
                            <i data-lucide="user-check" class="h-8 w-8 text-green-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="new_registrations">New Registrations</p>
                                <p class="text-2xl font-bold text-gray-900">1,247</p>
                                <p class="text-xs text-green-600" data-translate="this_week">this week</p>
                            </div>
                            <i data-lucide="user-plus" class="h-8 w-8 text-purple-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="suspended_users">Suspended Users</p>
                                <p class="text-2xl font-bold text-gray-900">234</p>
                                <p class="text-xs text-red-600">0.5% <span data-translate="of_total">of total</span></p>
                            </div>
                            <i data-lucide="user-x" class="h-8 w-8 text-red-600"></i>
                        </div>
                    </div>
                </div>

                <!-- User Filters -->
                <div class="bg-white rounded-lg shadow mb-6">
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="text" placeholder="Search users..." class="px-4 py-2 border rounded-md" id="user-search">
                            <select class="px-4 py-2 border rounded-md" id="role-filter">
                                <option value="all" data-translate="all_roles">All Roles</option>
                                <option value="admin" data-translate="admin">Admin</option>
                                <option value="teacher" data-translate="teacher">Teacher</option>
                                <option value="student" data-translate="student">Student</option>
                                <option value="parent" data-translate="parent">Parent</option>
                            </select>
                            <select class="px-4 py-2 border rounded-md" id="school-filter">
                                <option value="all" data-translate="all_schools">All Schools</option>
                                <option value="1">Dhaka International School</option>
                                <option value="2">Chittagong Model School</option>
                                <option value="3">Sylhet Science Academy</option>
                            </select>
                            <select class="px-4 py-2 border rounded-md" id="user-status-filter">
                                <option value="all" data-translate="all_status">All Status</option>
                                <option value="active" data-translate="active">Active</option>
                                <option value="inactive" data-translate="inactive">Inactive</option>
                                <option value="suspended" data-translate="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Users Table -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium text-gray-900" data-translate="users_list">Users List</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="user">User</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="school">School</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="role">Role</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="status">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="last_login">Last Login</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-translate="actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body" class="bg-white divide-y divide-gray-200">
                                <!-- Users will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- System Analytics Page -->
            <div id="analytics-page" class="page p-6 hidden">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900" data-translate="system_analytics">System Analytics</h1>
                        <p class="text-gray-600" data-translate="deep_insights_performance">Deep insights and performance metrics</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="exportAnalytics()" class="bg-green-600 text-white px-4 py-2 rounded-md flex items-center">
                            <i data-lucide="download" class="h-4 w-4 mr-2"></i>
                            <span data-translate="export_data">Export Data</span>
                        </button>
                        <button onclick="scheduleReport()" class="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
                            <i data-lucide="calendar" class="h-4 w-4 mr-2"></i>
                            <span data-translate="schedule_report">Schedule Report</span>
                        </button>
                    </div>
                </div>

                <!-- Analytics Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="system_uptime">System Uptime</p>
                                <p class="text-2xl font-bold text-gray-900">99.8%</p>
                                <p class="text-xs text-green-600" data-translate="excellent_performance">Excellent Performance</p>
                            </div>
                            <i data-lucide="server" class="h-8 w-8 text-green-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="avg_response_time">Avg Response Time</p>
                                <p class="text-2xl font-bold text-gray-900">245ms</p>
                                <p class="text-xs text-green-600" data-translate="optimal">Optimal</p>
                            </div>
                            <i data-lucide="zap" class="h-8 w-8 text-yellow-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="error_rate">Error Rate</p>
                                <p class="text-2xl font-bold text-gray-900">0.1%</p>
                                <p class="text-xs text-green-600" data-translate="very_low">Very Low</p>
                            </div>
                            <i data-lucide="alert-circle" class="h-8 w-8 text-red-600"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600" data-translate="active_sessions">Active Sessions</p>
                                <p class="text-2xl font-bold text-gray-900">8,423</p>
                                <p class="text-xs text-gray-500" data-translate="concurrent_users">concurrent users</p>
                            </div>
                            <i data-lucide="activity" class="h-8 w-8 text-blue-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Analytics Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-medium text-gray-900" data-translate="user_growth">User Growth</h3>
                        </div>
                        <div class="p-6">
                            <canvas id="user-growth-chart" width="400" height="300"></canvas>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-medium text-gray-900" data-translate="system_performance">System Performance</h3>
                        </div>
                        <div class="p-6">
                            <canvas id="performance-chart" width="400" height="300"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Top Schools Performance -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-medium text-gray-900" data-translate="top_performing_schools">Top Performing Schools</h3>
                    </div>
                    <div class="p-6">
                        <div id="top-schools-list" class="space-y-4">
                            <!-- Top schools will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Language translations
        const translations = {
            en: {
                control_panel: "Control Panel",
                dashboard: "Dashboard",
                school_management: "School Management",
                feature_control: "Feature Control",
                billing_revenue: "Billing & Revenue",
                user_management: "User Management",
                system_analytics: "System Analytics",
                super_admin_dashboard: "Super Admin Dashboard",
                manage_all_schools: "Manage all school instances and system operations",
                add_new_school: "Add New School",
                total_schools: "Total Schools",
                active: "active",
                total_users: "Total Users",
                across_all_schools: "Across all schools",
                monthly_revenue: "Monthly Revenue",
                from_last_month: "from last month",
                system_status: "System Status",
                healthy: "Healthy",
                pending_issues: "pending issues",
                recent_schools: "Recent Schools",
                latest_school_registrations: "Latest school registrations and updates",
                manage_all_school_instances: "Manage all school instances and their configurations",
                bulk_operations: "Bulk Operations",
                active_schools: "Active Schools",
                trial_schools: "Trial Schools",
                suspended_schools: "Suspended",
                schools_list: "Schools List",
                all_status: "All Status",
                trial: "Trial",
                suspended: "Suspended",
                school: "School",
                status: "Status",
                plan: "Plan",
                usage: "Usage",
                revenue: "Revenue",
                actions: "Actions",
                control_feature_rollouts: "Control feature rollouts and availability across all schools",
                add_new_feature: "Add New Feature",
                all_features: "All Features",
                academic: "Academic",
                financial: "Financial",
                communication: "Communication",
                management: "Management",
                advanced: "Advanced",
                comprehensive_financial_management: "Comprehensive financial management and revenue analytics",
                export_report: "Export Report",
                create_invoice: "Create Invoice",
                total_revenue: "Total Revenue",
                this_month: "this month",
                pending_payments: "Pending Payments",
                overdue: "overdue",
                avg_revenue_per_school: "Avg Revenue/School",
                per_month: "per month",
                churn_rate: "Churn Rate",
                improved: "improved",
                revenue_trends: "Revenue Trends",
                recent_transactions: "Recent Transactions",
                amount: "Amount",
                date: "Date",
                manage_users_across_schools: "Manage users across all school instances",
                add_user: "Add User",
                active_users: "Active Users",
                of_total: "of total",
                new_registrations: "New Registrations",
                this_week: "this week",
                suspended_users: "Suspended Users",
                all_roles: "All Roles",
                admin: "Admin",
                teacher: "Teacher",
                student: "Student",
                parent: "Parent",
                all_schools: "All Schools",
                inactive: "Inactive",
                users_list: "Users List",
                user: "User",
                role: "Role",
                last_login: "Last Login",
                deep_insights_performance: "Deep insights and performance metrics",
                export_data: "Export Data",
                schedule_report: "Schedule Report",
                system_uptime: "System Uptime",
                excellent_performance: "Excellent Performance",
                avg_response_time: "Avg Response Time",
                optimal: "Optimal",
                error_rate: "Error Rate",
                very_low: "Very Low",
                active_sessions: "Active Sessions",
                concurrent_users: "concurrent users",
                user_growth: "User Growth",
                system_performance: "System Performance",
                top_performing_schools: "Top Performing Schools"
            },
            bn: {
                control_panel: "কন্ট্রোল প্যানেল",
                dashboard: "ড্যাশবোর্ড",
                school_management: "স্কুল ব্যবস্থাপনা",
                feature_control: "ফিচার নিয়ন্ত্রণ",
                billing_revenue: "বিলিং ও আয়",
                user_management: "ব্যবহারকারী ব্যবস্থাপনা",
                system_analytics: "সিস্টেম বিশ্লেষণ",
                super_admin_dashboard: "সুপার অ্যাডমিন ড্যাশবোর্ড",
                manage_all_schools: "সকল স্কুল ইনস্ট্যান্স এবং সিস্টেম অপারেশন পরিচালনা করুন",
                add_new_school: "নতুন স্কুল যোগ করুন",
                total_schools: "মোট স্কুল",
                active: "সক্রিয়",
                total_users: "মোট ব্যবহারকারী",
                across_all_schools: "সকল স্কুল জুড়ে",
                monthly_revenue: "মাসিক আয়",
                from_last_month: "গত মাস থেকে",
                system_status: "সিস্টেম অবস্থা",
                healthy: "সুস্থ",
                pending_issues: "মুলতুবি সমস্যা",
                recent_schools: "সাম্প্রতিক স্কুল",
                latest_school_registrations: "সর্বশেষ স্কুল নিবন্ধন এবং আপডেট",
                manage_all_school_instances: "সকল স্কুল ইনস্ট্যান্স এবং তাদের কনফিগারেশন পরিচালনা করুন",
                bulk_operations: "বাল্ক অপারেশন",
                active_schools: "সক্রিয় স্কুল",
                trial_schools: "ট্রায়াল স্কুল",
                suspended_schools: "স্থগিত",
                schools_list: "স্কুলের তালিকা",
                all_status: "সব অবস্থা",
                trial: "ট্রায়াল",
                suspended: "স্থগিত",
                school: "স্কুল",
                status: "অবস্থা",
                plan: "প্ল্যান",
                usage: "ব্যবহার",
                revenue: "আয়",
                actions: "কর্ম",
                control_feature_rollouts: "সকল স্কুল জুড়ে ফিচার রোলআউট এবং উপলব্ধতা নিয়ন্ত্রণ করুন",
                add_new_feature: "নতুন ফিচার যোগ করুন",
                all_features: "সকল ফিচার",
                academic: "একাডেমিক",
                financial: "আর্থিক",
                communication: "যোগাযোগ",
                management: "ব্যবস্থাপনা",
                advanced: "উন্নত",
                comprehensive_financial_management: "ব্যাপক আর্থিক ব্যবস্থাপনা এবং আয় বিশ্লেষণ",
                export_report: "রিপোর্ট এক্সপোর্ট করুন",
                create_invoice: "ইনভয়েস তৈরি করুন",
                total_revenue: "মোট আয়",
                this_month: "এই মাসে",
                pending_payments: "মুলতুবি পেমেন্ট",
                overdue: "মেয়াদোত্তীর্ণ",
                avg_revenue_per_school: "গড় আয়/স্কুল",
                per_month: "প্রতি মাসে",
                churn_rate: "চার্ন রেট",
                improved: "উন্নত",
                revenue_trends: "আয়ের প্রবণতা",
                recent_transactions: "সাম্প্রতিক লেনদেন",
                amount: "পরিমাণ",
                date: "তারিখ",
                manage_users_across_schools: "সকল স্কুল ইনস্ট্যান্স জুড়ে ব্যবহারকারী পরিচালনা করুন",
                add_user: "ব্যবহারকারী যোগ করুন",
                active_users: "সক্রিয় ব্যবহারকারী",
                of_total: "মোটের",
                new_registrations: "নতুন নিবন্ধন",
                this_week: "এই সপ্তাহে",
                suspended_users: "স্থগিত ব্যবহারকারী",
                all_roles: "সকল ভূমিকা",
                admin: "অ্যাডমিন",
                teacher: "শিক্ষক",
                student: "ছাত্র",
                parent: "অভিভাবক",
                all_schools: "সকল স্কুল",
                inactive: "নিষ্ক্রিয়",
                users_list: "ব্যবহারকারীর তালিকা",
                user: "ব্যবহারকারী",
                role: "ভূমিকা",
                last_login: "শেষ লগইন",
                deep_insights_performance: "গভীর অন্তর্দৃষ্টি এবং কর্মক্ষমতা মেট্রিক্স",
                export_data: "ডেটা এক্সপোর্ট করুন",
                schedule_report: "রিপোর্ট সময়সূচী করুন",
                system_uptime: "সিস্টেম আপটাইম",
                excellent_performance: "চমৎকার কর্মক্ষমতা",
                avg_response_time: "গড় প্রতিক্রিয়া সময়",
                optimal: "সর্বোত্তম",
                error_rate: "ত্রুটির হার",
                very_low: "খুবই কম",
                active_sessions: "সক্রিয় সেশন",
                concurrent_users: "সমসাময়িক ব্যবহারকারী",
                user_growth: "ব্যবহারকারী বৃদ্ধি",
                system_performance: "সিস্টেম কর্মক্ষমতা",
                top_performing_schools: "শীর্ষ পারফরমিং স্কুল"
            }
        };

        let currentLanguage = 'en';

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            lucide.createIcons();
            loadDashboardData();
            loadSchoolsData();
            loadFeaturesData();
            loadBillingData();
            loadUsersData();
            loadAnalyticsData();
            setupCharts();
        });

        // Language switching
        function changeLanguage(lang) {
            currentLanguage = lang;
            
            // Update language buttons
            document.getElementById('lang-en').className = lang === 'en' ? 
                'lang-btn px-2 py-1 text-xs rounded bg-blue-100 text-blue-800' : 
                'lang-btn px-2 py-1 text-xs rounded';
            document.getElementById('lang-bn').className = lang === 'bn' ? 
                'lang-btn px-2 py-1 text-xs rounded bg-blue-100 text-blue-800' : 
                'lang-btn px-2 py-1 text-xs rounded';
            
            // Update all translatable elements
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[lang] && translations[lang][key]) {
                    element.textContent = translations[lang][key];
                }
            });
            
            lucide.createIcons();
        }

        // Page navigation
        function showPage(pageName) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });
            
            // Show selected page
            document.getElementById(pageName + '-page').classList.remove('hidden');
            
            // Update sidebar navigation
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
                item.classList.add('text-gray-600');
            });
            
            event.target.closest('.sidebar-item').classList.add('active');
            event.target.closest('.sidebar-item').classList.remove('text-gray-600');
            
            // Reinitialize icons for the new page
            lucide.createIcons();
        }

        // Mock data for schools
        const schoolsData = [
            {
                id: 1,
                name: 'Dhaka International School',
                email: 'admin@dhakaintl.edu.bd',
                status: 'active',
                plan: 'Premium',
                price: 25000,
                users: 1245,
                teachers: 89,
                domain: 'dhakaintl.edu.bd'
            },
            {
                id: 2,
                name: 'Chittagong Model School',
                email: 'info@ctgmodel.edu.bd',
                status: 'trial',
                plan: 'Basic',
                price: 8000,
                users: 567,
                teachers: 34,
                domain: null
            },
            {
                id: 3,
                name: 'Sylhet Science Academy',
                email: 'contact@sylhetscience.edu.bd',
                status: 'active',
                plan: 'Enterprise',
                price: 45000,
                users: 890,
                teachers: 67,
                domain: 'sylhetscience.edu.bd'
            },
            {
                id: 4,
                name: 'Rajshahi Public School',
                email: 'admin@rajpublic.edu.bd',
                status: 'suspended',
                plan: 'Basic',
                price: 8000,
                users: 234,
                teachers: 18,
                domain: null
            }
        ];

        // Load dashboard data
        function loadDashboardData() {
            const totalSchools = schoolsData.length;
            const activeSchools = schoolsData.filter(s => s.status === 'active').length;
            const totalUsers = schoolsData.reduce((sum, s) => sum + s.users, 0);
            const monthlyRevenue = schoolsData.reduce((sum, s) => sum + s.price, 0);

            document.getElementById('total-schools').textContent = totalSchools;
            document.getElementById('active-schools').textContent = activeSchools;
            document.getElementById('total-users').textContent = totalUsers.toLocaleString();
            document.getElementById('monthly-revenue').textContent = '৳' + monthlyRevenue.toLocaleString();

            // Load recent schools with safe DOM manipulation
            const recentSchoolsList = document.getElementById('recent-schools-list');
            if (recentSchoolsList) {
                recentSchoolsList.innerHTML = '<div class="text-center text-gray-500">Recent schools data will load here</div>';
            }

            lucide.createIcons();
        }

        // Load schools data
        function loadSchoolsData() {
            const tbody = document.getElementById('schools-table-body');
            tbody.innerHTML = schoolsData.map(school => \`
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i data-lucide="building-2" class="h-5 w-5 text-blue-600"></i>
                            </div>
                            <div class="ml-3">
                                <div class="text-sm font-medium text-gray-900">${school.name}</div>
                                <div class="text-sm text-gray-500">${school.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(school.status)}">${school.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${school.plan}</div>
                        <div class="text-sm text-gray-500">৳${school.price.toLocaleString()}/month</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>${school.users} students</div>
                        <div>${school.teachers} teachers</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳${school.price.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="manageSchool(${school.id})" class="text-blue-600 hover:text-blue-900 mr-3">Manage</button>
                        <button onclick="configureSchool(${school.id})" class="text-green-600 hover:text-green-900 mr-3">Config</button>
                        <button onclick="toggleSchoolStatus(${school.id})" class="text-red-600 hover:text-red-900">
                            ${school.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                    </td>
                </tr>
            \`).join('');

            lucide.createIcons();
        }

        // Load features data
        function loadFeaturesData() {
            const features = [
                { id: 1, name: 'Student Management', description: 'Complete student records and profile management', category: 'academic', enabled: true, rollout: 100, schools: 147 },
                { id: 2, name: 'Advanced Analytics', description: 'Detailed analytics and reporting dashboard', category: 'advanced', enabled: true, rollout: 85, schools: 125 },
                { id: 3, name: 'Video Conferencing', description: 'Integrated video calling for online classes', category: 'communication', enabled: true, rollout: 60, schools: 88 },
                { id: 4, name: 'Fee Collection', description: 'Automated fee collection and payment processing', category: 'financial', enabled: true, rollout: 95, schools: 140 },
                { id: 5, name: 'Library Management', description: 'Book inventory and borrowing system', category: 'academic', enabled: true, rollout: 78, schools: 115 },
                { id: 6, name: 'Transport Management', description: 'Vehicle tracking and route management', category: 'management', enabled: false, rollout: 25, schools: 37 }
            ];

            const grid = document.getElementById('features-grid');
            grid.innerHTML = features.map(feature => \`
                <div class="bg-white rounded-lg shadow p-6" data-category="${feature.category}">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">${feature.name}</h3>
                            <p class="text-sm text-gray-500 mt-1">${feature.description}</p>
                        </div>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${feature.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${feature.enabled ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                    <div class="mb-4">
                        <div class="flex justify-between text-sm mb-1">
                            <span>Rollout Progress</span>
                            <span>${feature.rollout}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${feature.rollout}%"></div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                            <span>${feature.schools} schools</span>
                            <span>147 total</span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="configureFeature(${feature.id})" class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">Configure</button>
                        <button onclick="toggleFeature(${feature.id})" class="flex-1 ${feature.enabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} px-3 py-2 rounded text-sm">
                            ${feature.enabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        // Load billing data
        function loadBillingData() {
            const billingData = [
                { school: 'Dhaka International School', amount: 25000, date: '2025-06-01', status: 'paid' },
                { school: 'Chittagong Model School', amount: 8000, date: '2025-06-01', status: 'pending' },
                { school: 'Sylhet Science Academy', amount: 45000, date: '2025-06-01', status: 'paid' },
                { school: 'Rajshahi Public School', amount: 8000, date: '2025-05-28', status: 'overdue' }
            ];

            const tbody = document.getElementById('billing-table-body');
            tbody.innerHTML = billingData.map(bill => \`
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${bill.school}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳${bill.amount.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${bill.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 rounded-full text-xs font-medium \${
                            bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                            bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }">${bill.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900">View</button>
                    </td>
                </tr>
            \`).join('');
        }

        // Load users data
        function loadUsersData() {
            const usersData = [
                { name: 'Mohammad Rahman', school: 'Dhaka International School', role: 'admin', status: 'active', lastLogin: '2025-06-02' },
                { name: 'Fatima Khatun', school: 'Chittagong Model School', role: 'teacher', status: 'active', lastLogin: '2025-06-01' },
                { name: 'Abdul Karim', school: 'Sylhet Science Academy', role: 'student', status: 'active', lastLogin: '2025-06-02' },
                { name: 'Rashida Begum', school: 'Rajshahi Public School', role: 'parent', status: 'inactive', lastLogin: '2025-05-28' }
            ];

            const tbody = document.getElementById('users-table-body');
            tbody.innerHTML = usersData.map(user => \`
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <i data-lucide="user" class="h-4 w-4 text-gray-600"></i>
                            </div>
                            <div class="ml-3">
                                <div class="text-sm font-medium text-gray-900">${user.name}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.school}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.role}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${user.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.lastLogin}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button class="text-red-600 hover:text-red-900">Suspend</button>
                    </td>
                </tr>
            \`).join('');

            lucide.createIcons();
        }

        // Load analytics data
        function loadAnalyticsData() {
            const topSchools = [
                { name: 'Dhaka International School', users: 1245, growth: 12.5, performance: 95 },
                { name: 'Sylhet Science Academy', users: 890, growth: 8.3, performance: 92 },
                { name: 'Chittagong Model School', users: 567, growth: 15.2, performance: 88 },
                { name: 'Rajshahi Public School', users: 234, growth: -2.1, performance: 76 }
            ];

            const topSchoolsList = document.getElementById('top-schools-list');
            topSchoolsList.innerHTML = topSchools.map(school => \`
                <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i data-lucide="building-2" class="h-6 w-6 text-blue-600"></i>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-900">${school.name}</h4>
                            <p class="text-sm text-gray-500">${school.users} users</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">Performance: ${school.performance}%</div>
                        <div class="text-sm ${school.growth >= 0 ? 'text-green-600' : 'text-red-600'}">
                            Growth: ${school.growth >= 0 ? '+' : ''}${school.growth}%
                        </div>
                    </div>
                </div>
            \`).join('');

            lucide.createIcons();
        }

        // Setup charts
        function setupCharts() {
            // Revenue Chart
            const revenueCtx = document.getElementById('revenue-chart');
            if (revenueCtx) {
                new Chart(revenueCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Revenue (৳)',
                            data: [2200000, 2350000, 2480000, 2650000, 2730000, 2847500],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '৳' + (value / 1000000).toFixed(1) + 'M';
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // User Growth Chart
            const userGrowthCtx = document.getElementById('user-growth-chart');
            if (userGrowthCtx) {
                new Chart(userGrowthCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'New Users',
                            data: [3200, 3800, 4100, 4350, 4200, 4672],
                            backgroundColor: 'rgba(34, 197, 94, 0.8)'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Performance Chart
            const performanceCtx = document.getElementById('performance-chart');
            if (performanceCtx) {
                new Chart(performanceCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Uptime', 'Downtime'],
                        datasets: [{
                            data: [99.8, 0.2],
                            backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        }

        // Utility functions
        function getStatusColor(status) {
            switch (status) {
                case 'active': return 'bg-green-100 text-green-800';
                case 'trial': return 'bg-blue-100 text-blue-800';
                case 'suspended': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        // Feature filtering
        function filterFeatures(category) {
            document.querySelectorAll('.feature-filter').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            event.target.classList.add('bg-blue-600', 'text-white');
            event.target.classList.remove('bg-gray-200', 'text-gray-700');

            document.querySelectorAll('#features-grid > div').forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Action functions
        function createNewSchool() {
            const name = prompt(currentLanguage === 'bn' ? 'স্কুলের নাম লিখুন:' : 'Enter school name:');
            if (name) {
                alert(currentLanguage === 'bn' ? 
                    'নতুন স্কুল "' + name + '" তৈরি করা হবে স্বয়ংক্রিয় Supabase সেটআপ সহ' :
                    'New school "' + name + '" would be created with automated Supabase setup');
            }
        }

        function manageSchool(id) {
            const school = schoolsData.find(s => s.id === id);
            alert(currentLanguage === 'bn' ? 
                school.name + ' পরিচালনা করুন\n\nউপলব্ধ কর্ম:\n- বিস্তারিত বিশ্লেষণ দেখুন\n- ফিচার কনফিগার করুন\n- ব্যবহারকারী পরিচালনা করুন\n- বিলিং আপডেট করুন' :
                'Managing ' + school.name + '\n\nAvailable actions:\n- View detailed analytics\n- Configure features\n- Manage users\n- Update billing');
        }

        function configureSchool(id) {
            const school = schoolsData.find(s => s.id === id);
            alert(currentLanguage === 'bn' ? 
                school.name + ' কনফিগার করুন\n\nকনফিগারেশন অপশন:\n- ফিচার সক্রিয়/নিষ্ক্রিয় করুন\n- ব্র্যান্ডিং কাস্টমাইজ করুন\n- একাডেমিক ক্যালেন্ডার সেট করুন\n- পেমেন্ট গেটওয়ে কনফিগার করুন' :
                'Configuring ' + school.name + '\n\nConfiguration options:\n- Enable/disable features\n- Customize branding\n- Set academic calendar\n- Configure payment gateway');
        }

        function toggleSchoolStatus(id) {
            const school = schoolsData.find(s => s.id === id);
            const newStatus = school.status === 'active' ? 'suspended' : 'active';
            school.status = newStatus;
            alert(currentLanguage === 'bn' ? 
                school.name + ' এর অবস্থা পরিবর্তিত হয়েছে: ' + newStatus :
                school.name + ' status changed to: ' + newStatus);
            loadDashboardData();
            loadSchoolsData();
        }

        function bulkOperations() {
            alert(currentLanguage === 'bn' ? 
                'বাল্ক অপারেশন\n\n- একাধিক স্কুলে ফিচার সক্রিয় করুন\n- গ্রুপ বিলিং আপডেট\n- সিস্টেম কনফিগারেশন সিঙ্ক করুন\n- বাল্ক নোটিফিকেশন পাঠান' :
                'Bulk Operations\n\n- Enable features across multiple schools\n- Group billing updates\n- Sync system configurations\n- Send bulk notifications');
        }

        function configureFeature(id) {
            alert(currentLanguage === 'bn' ? 
                'ফিচার কনফিগারেশন\n\n- স্কুল-নির্দিষ্ট সেটিংস\n- রোলআউট পার্সেন্টেজ সেট করুন\n- A/B টেস্টিং সক্রিয় করুন\n- ব্যবহারের সীমা নির্ধারণ করুন' :
                'Feature Configuration\n\n- School-specific settings\n- Set rollout percentage\n- Enable A/B testing\n- Define usage limits');
        }

        function toggleFeature(id) {
            alert(currentLanguage === 'bn' ? 
                'ফিচার টগল\n\nনিশ্চিত করুন যে আপনি এই ফিচারটি সকল প্রভাবিত স্কুলের জন্য টগল করতে চান' :
                'Feature Toggle\n\nConfirm that you want to toggle this feature for all affected schools');
        }

        function addNewFeature() {
            alert(currentLanguage === 'bn' ? 
                'নতুন ফিচার যোগ করুন\n\n- ফিচার নাম এবং বিবরণ\n- লক্ষ্য ক্যাটেগরি নির্বাচন করুন\n- প্ল্যান উপলব্ধতা সেট করুন\n- রোলআউট কৌশল নির্ধারণ করুন' :
                'Add New Feature\n\n- Feature name and description\n- Select target category\n- Set plan availability\n- Define rollout strategy');
        }

        function exportBillingReport() {
            alert(currentLanguage === 'bn' ? 
                'বিলিং রিপোর্ট এক্সপোর্ট\n\n- Excel/CSV ফরম্যাটে ডাউনলোড\n- কাস্টম তারিখ রেঞ্জ\n- স্কুল-নির্দিষ্ট ফিল্টার\n- আর্থিক সারসংক্ষেপ অন্তর্ভুক্ত' :
                'Export Billing Report\n\n- Download in Excel/CSV format\n- Custom date range\n- School-specific filters\n- Include financial summary');
        }

        function createInvoice() {
            alert(currentLanguage === 'bn' ? 
                'ইনভয়েস তৈরি করুন\n\n- স্কুল নির্বাচন করুন\n- সেবার বিবরণ যোগ করুন\n- পেমেন্ট শর্তাবলী সেট করুন\n- স্বয়ংক্রিয় ইমেইল পাঠান' :
                'Create Invoice\n\n- Select school\n- Add service details\n- Set payment terms\n- Send automated email');
        }

        function addNewUser() {
            alert(currentLanguage === 'bn' ? 
                'নতুন ব্যবহারকারী যোগ করুন\n\n- ব্যক্তিগত তথ্য\n- স্কুল এবং ভূমিকা নির্বাচন\n- অনুমতি সেট করুন\n- অ্যাকাউন্ট সক্রিয়করণ' :
                'Add New User\n\n- Personal information\n- Select school and role\n- Set permissions\n- Account activation');
        }

        function bulkUserOperations() {
            alert(currentLanguage === 'bn' ? 
                'বাল্ক ব্যবহারকারী অপারেশন\n\n- একাধিক ব্যবহারকারী নির্বাচন\n- গ্রুপ অনুমতি আপডেট\n- বাল্ক অ্যাকাউন্ট স্থিতি পরিবর্তন\n- গ্রুপ নোটিফিকেশন পাঠান' :
                'Bulk User Operations\n\n- Select multiple users\n- Update group permissions\n- Change bulk account status\n- Send group notifications');
        }

        function exportAnalytics() {
            alert(currentLanguage === 'bn' ? 
                'অ্যানালিটিক্স এক্সপোর্ট\n\n- সম্পূর্ণ ডেটা রিপোর্ট\n- গ্রাফিক্যাল চার্ট অন্তর্ভুক্ত\n- কাস্টম মেট্রিক্স\n- PDF/Excel ফরম্যাট' :
                'Export Analytics\n\n- Complete data reports\n- Include graphical charts\n- Custom metrics\n- PDF/Excel format');
        }

        function scheduleReport() {
            alert(currentLanguage === 'bn' ? 
                'রিপোর্ট সময়সূচী\n\n- দৈনিক/সাপ্তাহিক/মাসিক রিপোর্ট\n- ইমেইল প্রাপক নির্বাচন\n- কাস্টম টেমপ্লেট\n- স্বয়ংক্রিয় ডেলিভারি' :
                'Schedule Report\n\n- Daily/weekly/monthly reports\n- Select email recipients\n- Custom templates\n- Automated delivery');
        }
    </script>
</body>
</html>
    `);
  });

  // API endpoints for the control panel
  app.get('/api/super-admin/schools', (req: Request, res: Response) => {
    const schools = [
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
      schools,
      stats: {
        total: schools.length,
        active: schools.filter(s => s.status === 'active').length,
        totalRevenue: schools.reduce((sum, s) => sum + s.revenue, 0)
      }
    });
  });
}