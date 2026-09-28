import React from 'react';
import { Clock, Ban, CheckCircle } from 'lucide-react';
import useAdminThemeMode from '../hooks/useAdminThemeMode';

export default function UserTables({ users = [] }) {
  const { darkMode } = useAdminThemeMode();

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
      <table className="w-full text-left border-collapse">
        <thead className={`uppercase text-xs font-semibold ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"}`}>
          <tr>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}>
          {users.map((user) => (
            <tr key={user.id} className={`transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
              <td className="px-6 py-4 flex items-center gap-3">
                <img src={user.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full" alt="" />
                <div>
                  <div className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{user.firstName} {user.lastName}</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm capitalize">{user.role}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className={`px-6 py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.joinedDate || 'Jan 15, 2024'}</td>
              <td className="px-6 py-4">
                <div className={`flex gap-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <button title="View History"><Clock size={18} className="hover:text-blue-600 cursor-pointer" /></button>
                  {user.status === 'active' ? (
                    <button title="Block User"><Ban size={18} className="hover:text-red-600 cursor-pointer" /></button>
                  ) : (
                    <button title="Unblock User"><CheckCircle size={18} className="hover:text-green-600 cursor-pointer" /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}