import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Patient } from '../types';
import { 
  Search, 
  User, 
  FileText, 
  Calendar as CalendarIcon,
  Activity,
  Pill,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';

export default function MedicalRecords() {
  const { patients, getPatientConsultations, getPatientAppointments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientMedicalRecord = (patient: Patient) => {
    const consultations = getPatientConsultations(patient.id);
    const appointments = getPatientAppointments(patient.id);
    
    return {
      patient,
      consultations: consultations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      appointments: appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'no-show':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'no-show':
        return 'No asistió';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta';
      case 'follow-up':
        return 'Seguimiento';
      case 'emergency':
        return 'Emergencia';
      case 'routine':
        return 'Rutina';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historiales Clínicos</h1>
        <p className="text-gray-600 mt-1">Consulta el historial médico completo de cada paciente</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar paciente por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const consultationsCount = getPatientConsultations(patient.id).length;
          const appointmentsCount = getPatientAppointments(patient.id).length;
          const lastConsultation = getPatientConsultations(patient.id).sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

          return (
            <div
              key={patient.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {calculateAge(patient.dateOfBirth)} años
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">
                        {consultationsCount} consulta{consultationsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">
                        {appointmentsCount} cita{appointmentsCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {lastConsultation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">
                          Última consulta: {new Date(lastConsultation.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {patient.allergies && patient.allergies !== 'Ninguna conocida' && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-1 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">Alergias</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1 truncate">{patient.allergies}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
          </p>
        </div>
      )}

      {/* Medical Record Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Historial Clínico</h2>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const record = getPatientMedicalRecord(selectedPatient);
              
              return (
                <div className="space-y-6">
                  {/* Patient Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {record.patient.firstName} {record.patient.lastName}
                        </h3>
                        <p className="text-gray-600">{calculateAge(record.patient.dateOfBirth)} años</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{record.patient.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium">{record.patient.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Sangre</p>
                        <p className="font-medium">{record.patient.bloodType || 'No especificado'}</p>
                      </div>
                    </div>

                    {record.patient.allergies && record.patient.allergies !== 'Ninguna conocida' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 mb-1">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">Alergias</span>
                        </div>
                        <p className="text-red-600">{record.patient.allergies}</p>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Total Consultas</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700 mt-1">{record.consultations.length}</p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Total Citas</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700 mt-1">{record.appointments.length}</p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-800">Miembro desde</span>
                      </div>
                      <p className="text-lg font-bold text-purple-700 mt-1">
                        {new Date(record.patient.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Consultations History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Historial de Consultas
                    </h3>
                    
                    {record.consultations.length > 0 ? (
                      <div className="space-y-4">
                        {record.consultations.map((consultation, index) => (
                          <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-600">
                                Consulta #{record.consultations.length - index}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(consultation.date).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Diagnóstico</p>
                                <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">{consultation.diagnosis}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-gray-700">Síntomas</p>
                                <p className="text-sm text-gray-600">{consultation.symptoms}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-gray-700">Tratamiento</p>
                                <p className="text-sm text-gray-600">{consultation.treatment}</p>
                              </div>

                              {consultation.prescription && (
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Pill className="w-4 h-4 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-700">Receta</p>
                                  </div>
                                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{consultation.prescription}</p>
                                </div>
                              )}

                              {consultation.followUpDate && (
                                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 p-2 rounded">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>Seguimiento programado: {new Date(consultation.followUpDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No hay consultas registradas</p>
                    )}
                  </div>

                  {/* Appointments History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      Historial de Citas
                    </h3>
                    
                    {record.appointments.length > 0 ? (
                      <div className="space-y-3">
                        {record.appointments.map((appointment) => (
                          <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-4">
                                  <span className="font-medium text-gray-900">
                                    {new Date(appointment.date).toLocaleDateString()}
                                  </span>
                                  <span className="text-gray-600">{appointment.time}</span>
                                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                    {getTypeLabel(appointment.type)}
                                  </span>
                                </div>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                                {getStatusLabel(appointment.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No hay citas registradas</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}