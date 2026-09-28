import React from 'react';
import { Users, UserCheck, UserMinus, UserGroup } from 'lucide-react';
import useAdminThemeMode from '../hooks/useAdminThemeMode';

export default function UserStats({ users = [] }) {
  const { darkMode } = useAdminThemeMode();

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50' },
    { label: 'Active Users', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-green-600', bg: darkMode ? 'bg-green-900/30' : 'bg-green-50' },
    { label: 'Blocked Users', value: users.filter(u => u.status === 'blocked').length, icon: UserMinus, color: 'text-red-600', bg: darkMode ? 'bg-red-900/30' : 'bg-red-50' },
    { label: 'Customers', value: users.filter(u => u.role === 'customer').length, icon: UserGroup, color: 'text-cyan-600', bg: darkMode ? 'bg-cyan-900/30' : 'bg-cyan-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`p-6 rounded-xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
              <stat.icon size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}