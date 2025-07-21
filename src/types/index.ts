export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  notes: string;
  followUpDate?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor';
  specialization?: string;
}

export interface MedicalRecord {
  patient: Patient;
  consultations: Consultation[];
  appointments: Appointment[];
}