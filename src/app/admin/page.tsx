'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, Target, MousePointerClick } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users')
        ]);
        setStats(await statsRes.json());
        setUsers(await usersRes.json());
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SkillThinker Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats?.totalUsers} icon={<Users className="w-6 h-6" />} />
          <StatCard title="Revenue (Est.)" value={`$${stats?.totalRevenue}`} icon={<DollarSign className="w-6 h-6" />} />
          <StatCard title="Affiliate Clicks" value={stats?.totalClicks} icon={<MousePointerClick className="w-6 h-6" />} />
          <StatCard title="Conversion" value={`${stats?.conversionRate}%`} icon={<Target className="w-6 h-6" />} />
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Users (Coach Alex Interactions)</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">WhatsApp Number</th>
                <th className="px-6 py-4 font-medium">Goal</th>
                <th className="px-6 py-4 font-medium">Credit Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{user.whatsapp_number}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{user.current_goal || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{user.credit_score}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: any, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
