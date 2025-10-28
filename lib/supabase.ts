import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          full_name: string;
          company_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          full_name: string;
          company_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          full_name?: string;
          company_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          installer_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          address: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          installer_id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          address: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          installer_id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          address?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          installer_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_hours: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          installer_id: string;
          name: string;
          description?: string | null;
          price?: number;
          duration_hours?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          installer_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_hours?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_orders: {
        Row: {
          id: string;
          installer_id: string;
          client_id: string;
          service_id: string;
          title: string;
          description: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_date: string;
          completed_date: string | null;
          address: string;
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          installer_id: string;
          client_id: string;
          service_id: string;
          title: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_date: string;
          completed_date?: string | null;
          address: string;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          installer_id?: string;
          client_id?: string;
          service_id?: string;
          title?: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_date?: string;
          completed_date?: string | null;
          address?: string;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      installation_tracking: {
        Row: {
          id: string;
          work_order_id: string;
          status: string;
          latitude: number | null;
          longitude: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          work_order_id: string;
          status: string;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          work_order_id?: string;
          status?: string;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      installation_photos: {
        Row: {
          id: string;
          work_order_id: string;
          tracking_id: string | null;
          photo_url: string;
          description: string | null;
          photo_type: 'before' | 'during' | 'after' | 'issue';
          created_at: string;
        };
        Insert: {
          id?: string;
          work_order_id: string;
          tracking_id?: string | null;
          photo_url: string;
          description?: string | null;
          photo_type?: 'before' | 'during' | 'after' | 'issue';
          created_at?: string;
        };
        Update: {
          id?: string;
          work_order_id?: string;
          tracking_id?: string | null;
          photo_url?: string;
          description?: string | null;
          photo_type?: 'before' | 'during' | 'after' | 'issue';
          created_at?: string;
        };
      };
    };
  };
};
