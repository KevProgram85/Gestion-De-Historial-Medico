import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date_of_birth: string;
          address: string | null;
          blood_type: string | null;
          allergies: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date_of_birth: string;
          address?: string | null;
          blood_type?: string | null;
          allergies?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          date_of_birth?: string;
          address?: string | null;
          blood_type?: string | null;
          allergies?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          created_at?: string;
          user_id?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          symptoms: string;
          diagnosis: string;
          treatment: string;
          prescription: string | null;
          notes: string | null;
          follow_up_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          symptoms: string;
          diagnosis: string;
          treatment: string;
          prescription?: string | null;
          notes?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          date?: string;
          symptoms?: string;
          diagnosis?: string;
          treatment?: string;
          prescription?: string | null;
          notes?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
          status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          date?: string;
          time?: string;
          type?: 'consultation' | 'follow-up' | 'emergency' | 'routine';
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
          notes?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'doctor';
          specialization: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'doctor';
          specialization?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'doctor';
          specialization?: string | null;
          created_at?: string;
        };
      };
    };
  };
}