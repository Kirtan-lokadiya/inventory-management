'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

type StockOverview = {
  name: string;
  quantity: number;
};

type TopSellingItem = {
  name: string;
  quantity: number;
};

type MonthlySale = {
  month: string;
  total: number;
};

type ReportData = {
  stockOverview: StockOverview[];
  topSellingItems: TopSellingItem[];
  monthlySales: MonthlySale[];
  totalSales: number;
  totalStock: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData>({
    stockOverview: [],
    topSellingItems: [],
    monthlySales: [],
    totalSales: 0,
    totalStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Fetch stock overview
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('name, quantity')
        .order('quantity', { ascending: true })
        .limit(5);

      if (partsError) throw partsError;

      // Fetch top selling items
      const { data: billItemsData, error: billItemsError } = await supabase
        .from('bill_items')
        .select(`
          quantity,
          parts (
            name
          )
        `)
        .order('quantity', { ascending: false })
        .limit(10);

      if (billItemsError) throw billItemsError;

      // Fetch monthly sales
      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('total_amount, created_at')
        .order('created_at', { ascending: true });

      if (billsError) throw billsError;

      // Process monthly sales data
      const monthlySalesMap = new Map<string, number>();
      billsData.forEach((bill) => {
        const month = new Date(bill.created_at).toLocaleString('default', {
          month: 'short',
        });
        monthlySalesMap.set(
          month,
          (monthlySalesMap.get(month) || 0) + bill.total_amount
        );
      });

      const monthlySales = Array.from(monthlySalesMap.entries()).map(
        ([month, total]) => ({
          month,
          total,
        })
      );

      // Calculate total sales
      const totalSales = billsData.reduce(
        (sum, bill) => sum + bill.total_amount,
        0
      );

      // Calculate total stock
      const totalStock = partsData.reduce(
        (sum, part) => sum + part.quantity,
        0
      );

      setData({
        stockOverview: partsData.map((part) => ({
          name: part.name,
          quantity: part.quantity,
        })),
        topSellingItems: billItemsData.map((item) => ({
          name: item.parts.name,
          quantity: item.quantity,
        })),
        monthlySales,
        totalSales,
        totalStock,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{data.totalSales.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Stock
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.totalStock}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Stock Overview */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Stock Overview (Low Stock Items)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockOverview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Top Selling Items
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSellingItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white shadow rounded-lg p-4 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Sales
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#4F46E5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 