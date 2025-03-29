import Link from 'next/link';
import { HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-gray-800 h-screen fixed">
      <div className="flex items-center justify-center h-16 px-4">
        <h1 className="text-white text-lg font-semibold">Inventory Manager</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white group"
          >
            <item.icon className="mr-4 h-6 w-6" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 