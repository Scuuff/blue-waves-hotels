// components/admin/AdminSidebar.jsx
import { 
  Building2, 
  Image as ImageIcon, 
  Bell, 
  CreditCard, 
  Users, 
  Shield, 
  Globe, 
  FileText,
  LogOut 
} from "lucide-react";

export default function AdminSidebar({ activeTab, onTabChange }) {
  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "appearance", label: "Appearance", icon: ImageIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "rooms", label: "Room Types", icon: Building2 },
    { id: "users", label: "User Management", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Globe },
    { id: "backup", label: "Backup & Data", icon: FileText }
  ];

  return (
    <aside className="hidden h-full w-64 overflow-y-auto bg-slate-900 text-white lg:fixed lg:block admin-theme-sidebar">
      <div className="p-6 border-b border-slate-800 admin-theme-sidebar-divider">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin Panel</h1>
            <p className="text-xs text-slate-400">Grand Plaza Hotel</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? "bg-teal-500 text-white admin-theme-sidebar-active" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white admin-theme-sidebar-item"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 admin-theme-sidebar-divider">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all admin-theme-sidebar-item">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}