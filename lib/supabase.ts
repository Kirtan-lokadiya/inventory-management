import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          email: string;
          password_hash: string;
        };
        Update: {
          email?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
      parts: {
        Row: {
          id: string;
          serial_number: number;
          name: string;
          description: string | null;
          quantity: number;
          rate: number;
          gst_rate: number;
          image_url: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          quantity?: number;
          rate: number;
          gst_rate?: number;
          image_url?: string;
          location?: string;
        };
        Update: {
          name?: string;
          description?: string;
          quantity?: number;
          rate?: number;
          gst_rate?: number;
          image_url?: string;
          location?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          email?: string;
          phone?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string;
          created_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          invoice_number: number;
          customer_id: string;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          customer_id: string;
          total_amount: number;
        };
        Update: {
          customer_id?: string;
          total_amount?: number;
          created_at?: string;
        };
      };
      bill_items: {
        Row: {
          id: string;
          bill_id: string;
          part_id: string;
          quantity: number;
          rate: number;
          total: number;
          created_at: string;
        };
        Insert: {
          bill_id: string;
          part_id: string;
          quantity: number;
          rate: number;
          total: number;
        };
        Update: {
          bill_id?: string;
          part_id?: string;
          quantity?: number;
          rate?: number;
          total?: number;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          part_id: string;
          current_quantity: number;
          threshold: number;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          part_id: string;
          current_quantity: number;
          threshold: number;
          resolved?: boolean;
        };
        Update: {
          part_id?: string;
          current_quantity?: number;
          threshold?: number;
          resolved?: boolean;
          created_at?: string;
        };
      };
    };
  };
}; 