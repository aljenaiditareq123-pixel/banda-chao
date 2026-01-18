'use client';

import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';
import apiClient from '@/lib/api';
import { Users, Search, Mail, Calendar } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified?: boolean;
  created_at: string;
}

export default function AdminUsersPageClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateVerificationStatus = async (userId: string, isVerified: boolean) => {
    try {
      setUpdatingId(userId);
      const response = await apiClient.patch(`/users/${userId}/verify`, { isVerified });
      if (response.data.success) {
        // Update local state
        setUsers(users.map(u => u.id === userId ? { ...u, isVerified } : u));
      }
    } catch (error: any) {
      console.error('Error updating verification status:', error);
      alert(error.response?.data?.message || 'فشل في تحديث حالة التحقق');
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchUsers = async () => {
    // HARDCODE MODE - Return dummy data, no API calls
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return static dummy data
      const dummyUsers: User[] = [
        {
          id: 'user-1',
          email: 'founder@banda-chao.com',
          name: 'الساحر العظيم',
          role: 'FOUNDER',
          created_at: new Date().toISOString(),
        },
        {
          id: 'user-2',
          email: 'admin@bandachao.com',
          name: 'مدير النظام',
          role: 'ADMIN',
          created_at: new Date().toISOString(),
        },
        {
          id: 'user-3',
          email: 'maker@bandachao.com',
          name: 'حرفي تجريبي',
          role: 'MAKER',
          created_at: new Date().toISOString(),
        },
        {
          id: 'user-4',
          email: 'buyer@bandachao.com',
          name: 'مشتري تجريبي',
          role: 'BUYER',
          created_at: new Date().toISOString(),
        },
        {
          id: 'user-5',
          email: 'client@test.com',
          name: 'Test Client',
          role: 'BUYER',
          created_at: new Date().toISOString(),
        },
      ];
      
      setUsers(dummyUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to empty array
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      FOUNDER: 'مؤسس',
      ADMIN: 'مدير',
      MAKER: 'حرفي',
      BUYER: 'مشتري',
      USER: 'مستخدم',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      FOUNDER: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      MAKER: 'bg-green-100 text-green-800',
      BUYER: 'bg-yellow-100 text-yellow-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-gray-600 mt-2">عرض وإدارة جميع المستخدمين المسجلين</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن مستخدم بالاسم أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المديرين</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'ADMIN' || u.role === 'FOUNDER').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الحرفيين</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'MAKER').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المشترين</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'BUYER' || u.role === 'USER').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ التسجيل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التحقق
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين بعد'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'بدون اسم'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 ml-2" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 ml-2" />
                        {new Date(user.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => updateVerificationStatus(user.id, !user.isVerified)}
                        disabled={updatingId === user.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          user.isVerified ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        title={user.isVerified ? 'إلغاء التحقق' : 'تفعيل التحقق'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            user.isVerified ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
