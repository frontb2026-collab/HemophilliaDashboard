import React, { useState } from 'react';
import { 
  Activity, 
  Building2, 
  Users, 
  Pill, 
  Stethoscope, 
  Menu,
  X,
  Home,
  BarChart3,
  Smartphone,
  LogOut,
  Truck
} from 'lucide-react';
import { AuthService } from '../services/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'patients', label: 'Patient', icon: Users, submenu: [
    { id: 'patient-list', label: 'Patient' },
    { id: 'patient-visits', label: 'PatientVisits' },
    { id: 'diagnosis-patients', label: 'Diagnosis Patients' }
  ]},
  { id: 'treatments', label: 'Treatments', icon: Stethoscope },
  { id: 'cellphone', label: 'Cell Phone Treatment', icon: Smartphone },
  { id: 'distribution', label: 'Distribution', icon: Truck, submenu: [
    { id: 'drugs', label: 'Drug List' },
    { id: 'distributed', label: 'Distribution' },
    { id: 'delivered', label: 'Delivered' }
  ]},
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeSection,
  onSectionChange,
  user,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ patients: true, distribution: true });

  const handleLogout = async () => {
    if (onLogout) {
      await AuthService.logout();
      onLogout();
    }
  };
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">HemoCore</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.id];
            const isActive = activeSection === item.id || (hasSubmenu && item.submenu?.some(sub => activeSection === sub.id));

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      setExpandedMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                    } else {
                      onSectionChange(item.id);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors duration-200
                    ${isActive
                      ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>

                {hasSubmenu && isExpanded && (
                  <div className="bg-gray-50">
                    {item.submenu?.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          onSectionChange(subItem.id);
                          setSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center pl-14 pr-6 py-2 text-left text-sm transition-colors duration-200
                          ${activeSection === subItem.id
                            ? 'text-blue-600 bg-blue-100 border-r-2 border-blue-600 font-medium'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                          }
                        `}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
        {/* User Info and Logout */}
        {user && (
          <div className="mt-auto border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || user.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role || 'User'} • {user.email || user.name || 'N/A'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <h1 className="text-2xl font-semibold text-gray-800 capitalize">
              {activeSection === 'dashboard' ? 'Dashboard Overview' :
               activeSection === 'patient-list' ? 'Patient' :
               activeSection === 'patient-visits' ? 'PatientVisits' :
               activeSection === 'diagnosis-patients' ? 'Diagnosis Patients' :
               activeSection === 'treatments' ? 'Treatments' :
               activeSection === 'cellphone' ? 'Cell Phone Treatment' :
               activeSection === 'drugs' ? 'Drug List' :
               activeSection === 'distributed' ? 'Distributed Medicines' :
               activeSection === 'delivered' ? 'Delivered Medicines' :
               activeSection}
            </h1>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden md:block text-sm text-gray-600">
                  Welcome, {user.name}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Hemophilia Management System
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};