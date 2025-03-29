import DashboardLayout from '../components/DashboardLayout';
import { CubeIcon, ShoppingCartIcon, BanknotesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Products', value: '256', icon: CubeIcon, color: 'bg-blue-500' },
  { name: 'Pending Orders', value: '12', icon: ShoppingCartIcon, color: 'bg-yellow-500' },
  { name: 'Revenue', value: '$45,231', icon: BanknotesIcon, color: 'bg-green-500' },
  { name: 'Low Stock Items', value: '8', icon: ExclamationCircleIcon, color: 'bg-red-500' },
];

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="mt-4 space-y-4">
              {/* Add your recent activity items here */}
              <p className="text-gray-500">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 