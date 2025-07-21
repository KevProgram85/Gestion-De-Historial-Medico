import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Patient, Consultation, Appointment } from '../types';

interface DataContextType {
  patients: Patient[];
  consultations: Consultation[];
  appointments: Appointment[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Promise<void>;
  addConsultation: (consultation: Omit<Consultation, 'id'>) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
  getPatientConsultations: (patientId: string) => Consultation[];
  getPatientAppointments: (patientId: string) => Appointment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    } else {
      // Clear data when not authenticated
      setPatients([]);
      setConsultations([]);
      setAppointments([]);
    }
  }, [isAuthenticated, user]);

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadPatients(),
        loadConsultations(),
        loadAppointments()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPatients: Patient[] = (data || []).map(p => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        phone: p.phone,
        dateOfBirth: p.date_of_birth,
        address: p.address || '',
        bloodType: p.blood_type || '',
        allergies: p.allergies || '',
        emergencyContact: p.emergency_contact || '',
        emergencyPhone: p.emergency_phone || '',
        createdAt: p.created_at.split('T')[0]
      }));

      setPatients(formattedPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    }
  };

  const loadConsultations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedConsultations: Consultation[] = (data || []).map(c => ({
        id: c.id,
        patientId: c.patient_id,
        doctorId: c.doctor_id,
        date: c.date,
        symptoms: c.symptoms,
        diagnosis: c.diagnosis,
        treatment: c.treatment,
        prescription: c.prescription || '',
        notes: c.notes || '',
        followUpDate: c.follow_up_date || undefined
      }));

      setConsultations(formattedConsultations);
    } catch (error) {
      console.error('Error loading consultations:', error);
      setConsultations([]);
    }
  };

  const loadAppointments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedAppointments: Appointment[] = (data || []).map(a => ({
        id: a.id,
        patientId: a.patient_id,
        doctorId: a.doctor_id,
        date: a.date,
        time: a.time,
        type: a.type,
        status: a.status,
        notes: a.notes || ''
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          date_of_birth: patientData.dateOfBirth,
          address: patientData.address || null,
          blood_type: patientData.bloodType || null,
          allergies: patientData.allergies || null,
          emergency_contact: patientData.emergencyContact || null,
          emergency_phone: patientData.emergencyPhone || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newPatient: Patient = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        address: data.address || '',
        bloodType: data.blood_type || '',
        allergies: data.allergies || '',
        emergencyContact: data.emergency_contact || '',
        emergencyPhone: data.emergency_phone || '',
        createdAt: data.created_at.split('T')[0]
      };

      setPatients(prev => [newPatient, ...prev]);
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  const addConsultation = async (consultationData: Omit<Consultation, 'id'>) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          patient_id: consultationData.patientId,
          doctor_id: consultationData.doctorId,
          date: consultationData.date,
          symptoms: consultationData.symptoms,
          diagnosis: consultationData.diagnosis,
          treatment: consultationData.treatment,
          prescription: consultationData.prescription || null,
          notes: consultationData.notes || null,
          follow_up_date: consultationData.followUpDate || null
        })
        .select()
        .single();

      if (error) throw error;

      const newConsultation: Consultation = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        date: data.date,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        prescription: data.prescription || '',
        notes: data.notes || '',
        followUpDate: data.follow_up_date || undefined
      };

      setConsultations(prev => [newConsultation, ...prev]);
    } catch (error) {
      console.error('Error adding consultation:', error);
      throw error;
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointmentData.patientId,
          doctor_id: appointmentData.doctorId,
          date: appointmentData.date,
          time: appointmentData.time,
          type: appointmentData.type,
          status: appointmentData.status,
          notes: appointmentData.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      const newAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        date: data.date,
        time: data.time,
        type: data.type,
        status: data.status,
        notes: data.notes || ''
      };

      setAppointments(prev => [newAppointment, ...prev]);
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: updates.status,
          notes: updates.notes
        })
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? { ...appointment, ...updates } : appointment
        )
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const getPatientById = (id: string) => patients.find(p => p.id === id);

  const getPatientConsultations = (patientId: string) => 
    consultations.filter(c => c.patientId === patientId);

  const getPatientAppointments = (patientId: string) => 
    appointments.filter(a => a.patientId === patientId);

  const value = {
    patients,
    consultations,
    appointments,
    loading,
    refreshData,
    addPatient,
    addConsultation,
    addAppointment,
    updateAppointment,
    getPatientById,
    getPatientConsultations,
    getPatientAppointments
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}