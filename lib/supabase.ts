import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Types for our database tables
export type Part = {
  id: number;
  serial_number: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  image_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
};

export type Bill = {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
  items: BillItem[];
};

export type BillItem = {
  id: number;
  bill_id: number;
  part_id: number;
  quantity: number;
  rate: number;
  total: number;
  part: Part;
};

// API Functions
export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    getSession: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  },

  // Parts Management
  parts: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id: number) => {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (part: Omit<Part, 'id' | 'serial_number' | 'created_at' | 'updated_at'>) => {
      const session = await api.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('parts')
        .insert([part])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: number, updates: Partial<Part>) => {
      const session = await api.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('parts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: number) => {
      const session = await api.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    search: async (query: string) => {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,serial_number.ilike.%${query}%`);
      if (error) throw error;
      return data;
    },
  },

  // Bills Management
  bills: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          items:bill_items (
            *,
            part:parts (*)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id: number) => {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          items:bill_items (
            *,
            part:parts (*)
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (bill: Omit<Bill, 'id' | 'created_at'>) => {
      const session = await api.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bills')
        .insert([bill])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    search: async (invoiceNumber: string) => {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          items:bill_items (
            *,
            part:parts (*)
          )
        `)
        .eq('invoice_number', invoiceNumber)
        .single();
      if (error) throw error;
      return data;
    },
  },

  // Analytics
  analytics: {
    getStockOverview: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('name, quantity')
        .order('quantity', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },

    getTopSellingParts: async () => {
      const { data, error } = await supabase
        .rpc('get_top_selling_parts', { limit: 10 });
      if (error) throw error;
      return data;
    },

    getMonthlySales: async () => {
      const { data, error } = await supabase
        .rpc('get_monthly_sales');
      if (error) throw error;
      return data;
    },

    getTotalSales: async () => {
      const { data, error } = await supabase
        .rpc('get_total_sales');
      if (error) throw error;
      return data;
    },

    getTotalStock: async () => {
      const { data, error } = await supabase
        .rpc('get_total_stock');
      if (error) throw error;
      return data;
    },
  },
}; 