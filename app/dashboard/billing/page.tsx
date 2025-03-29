'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import BillPDF from '@/components/BillPDF';

type Part = {
  id: string;
  name: string;
  rate: number;
  gst_rate: number;
};

type BillItem = {
  part_id: string;
  quantity: number;
  rate: number;
  total: number;
};

type Bill = {
  id: string;
  invoice_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: BillItem[];
  total_amount: number;
  created_at: string;
};

export default function BillingPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [newBill, setNewBill] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    items: [{ part_id: '', quantity: 1, rate: 0, total: 0 }] as BillItem[],
  });

  useEffect(() => {
    fetchParts();
    fetchBills();
  }, []);

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('id, name, rate, gst_rate')
        .order('name');

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
      toast.error('Failed to fetch parts');
    }
  };

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          bill_items (
            part_id,
            quantity,
            rate,
            total
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setNewBill({
      ...newBill,
      items: [
        ...newBill.items,
        { part_id: '', quantity: 1, rate: 0, total: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewBill({
      ...newBill,
      items: newBill.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof BillItem,
    value: string | number
  ) => {
    const updatedItems = [...newBill.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Update rate and total when part is selected
    if (field === 'part_id') {
      const selectedPart = parts.find((p) => p.id === value);
      if (selectedPart) {
        updatedItems[index].rate = selectedPart.rate;
        updatedItems[index].total =
          selectedPart.rate * updatedItems[index].quantity;
      }
    }

    // Update total when quantity changes
    if (field === 'quantity') {
      updatedItems[index].total =
        updatedItems[index].rate * (value as number);
    }

    setNewBill({ ...newBill, items: updatedItems });
  };

  const calculateTotal = () => {
    return newBill.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            name: newBill.customer_name,
            email: newBill.customer_email,
            phone: newBill.customer_phone,
          },
        ])
        .select()
        .single();

      if (customerError) throw customerError;

      // Create bill
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert([
          {
            customer_id: customer.id,
            total_amount: calculateTotal(),
          },
        ])
        .select()
        .single();

      if (billError) throw billError;

      // Create bill items
      const billItems = newBill.items.map((item) => ({
        bill_id: bill.id,
        part_id: item.part_id,
        quantity: item.quantity,
        rate: item.rate,
        total: item.total,
      }));

      const { error: billItemsError } = await supabase
        .from('bill_items')
        .insert(billItems);

      if (billItemsError) throw billItemsError;

      // Update part quantities
      for (const item of newBill.items) {
        const { error: updateError } = await supabase.rpc('update_part_quantity', {
          part_id: item.part_id,
          quantity_change: -item.quantity,
        });

        if (updateError) throw updateError;
      }

      toast.success('Bill created successfully');
      setShowNewBillModal(false);
      setNewBill({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        items: [{ part_id: '', quantity: 1, rate: 0, total: 0 }],
      });
      fetchBills();
      fetchParts();
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Failed to create bill');
    }
  };

  const filteredBills = bills.filter(
    (bill) =>
      bill.invoice_number.toString().includes(searchQuery) ||
      bill.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage bills for spare parts.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowNewBillModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            New Bill
          </button>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search by invoice number or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Invoice No.
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {bill.invoice_number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bill.customer_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(bill.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ₹{bill.total_amount.toFixed(2)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <PDFDownloadLink
                          document={<BillPDF bill={bill} />}
                          fileName={`bill-${bill.invoice_number}.pdf`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {({ loading }) =>
                            loading ? 'Generating PDF...' : 'Download PDF'
                          }
                        </PDFDownloadLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* New Bill Modal */}
      {showNewBillModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-medium mb-4">Create New Bill</h2>
            <form onSubmit={handleCreateBill}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBill.customer_name}
                    onChange={(e) =>
                      setNewBill({ ...newBill, customer_name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={newBill.customer_email}
                    onChange={(e) =>
                      setNewBill({ ...newBill, customer_email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={newBill.customer_phone}
                    onChange={(e) =>
                      setNewBill({ ...newBill, customer_phone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Add Item
                    </button>
                  </div>
                  {newBill.items.map((item, index) => (
                    <div key={index} className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <select
                          required
                          value={item.part_id}
                          onChange={(e) =>
                            handleItemChange(index, 'part_id', e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select Part</option>
                          {parts.map((part) => (
                            <option key={part.id} value={part.id}>
                              {part.name} - ₹{part.rate}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'quantity',
                              parseInt(e.target.value)
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'rate',
                              parseFloat(e.target.value)
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={item.total}
                          readOnly
                          className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <p className="text-lg font-medium">
                    Total: ₹{calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                >
                  Create Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewBillModal(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 