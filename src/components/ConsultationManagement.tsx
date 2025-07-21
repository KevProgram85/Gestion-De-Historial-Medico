import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Consultation } from '../types';
import { 
  Plus, 
  Search, 
  User, 
  Calendar as CalendarIcon,
  FileText,
  Pill,
  X,
  Stethoscope
} from 'lucide-react';

export default function ConsultationManagement() {
  const { consultations, patients, addConsultation } = useData();
  const { user } = useAuth();
  const [isAddingConsultation, setIsAddingConsultation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    followUpDate: ''
  });

  const filteredConsultations = consultations.filter(consultation => {
    const patient = patients.find(p => p.id === consultation.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
           consultation.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
  }).map(consultation => ({
    ...consultation,
    patient: patients.find(p => p.id === consultation.patientId)
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addConsultation({
        ...formData,
        doctorId: user?.id || ''
      });
      setFormData({
        patientId: '',
        date: new Date().toISOString().split('T')[0],
        symptoms: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
        followUpDate: ''
      });
      setIsAddingConsultation(false);
    } catch (error) {
      console.error('Error adding consultation:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Consultas</h1>
          <p className="text-gray-600 mt-1">Registra diagnósticos y tratamientos médicos</p>
        </div>
        <button
          onClick={() => setIsAddingConsultation(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Consulta
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por paciente, diagnóstico o síntomas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.map((consultation) => (
          <div
            key={consultation.id}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedConsultation(consultation)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {consultation.patient?.firstName} {consultation.patient?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{consultation.patient?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(consultation.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Diagnóstico: </span>
                    <span className="text-sm text-gray-900">{consultation.diagnosis}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Síntomas: </span>
                    <span className="text-sm text-gray-600">
                      {consultation.symptoms.length > 100 
                        ? `${consultation.symptoms.substring(0, 100)}...` 
                        : consultation.symptoms}
                    </span>
                  </div>

                  {consultation.prescription && (
                    <div className="flex items-center gap-2 mt-3">
                      <Pill className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">Receta prescrita</span>
                    </div>
                  )}

                  {consultation.followUpDate && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Seguimiento: {new Date(consultation.followUpDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredConsultations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron consultas' : 'No hay consultas registradas'}
          </p>
        </div>
      )}

      {/* Add Consultation Modal */}
      {isAddingConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nueva Consulta Médica</h2>
              <button
                onClick={() => setIsAddingConsultation(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paciente *
                  </label>
                  <select
                    name="patientId"
                    required
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Consulta *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Síntomas *
                </label>
                <textarea
                  name="symptoms"
                  required
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe los síntomas reportados por el paciente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico *
                </label>
                <textarea
                  name="diagnosis"
                  required
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Diagnóstico médico basado en los síntomas y examen..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tratamiento *
                </label>
                <textarea
                  name="treatment"
                  required
                  value={formData.treatment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Plan de tratamiento recomendado..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receta Médica
                </label>
                <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Medicamentos prescritos, dosis e instrucciones..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Seguimiento
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: fecha para próxima consulta de seguimiento
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Registrar Consulta
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingConsultation(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Detalle de Consulta</h2>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Información del Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">
                      {selectedConsultation.patient?.firstName} {selectedConsultation.patient?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Consulta</p>
                    <p className="font-medium">{new Date(selectedConsultation.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Síntomas</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{selectedConsultation.symptoms}</p>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Diagnóstico</h3>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg">{selectedConsultation.diagnosis}</p>
              </div>

              {/* Treatment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tratamiento</h3>
                <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">{selectedConsultation.treatment}</p>
              </div>

              {/* Prescription */}
              {selectedConsultation.prescription && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Receta Médica</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800">Medicamentos Prescritos</span>
                    </div>
                    <p className="text-gray-700">{selectedConsultation.prescription}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedConsultation.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notas Adicionales</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedConsultation.notes}</p>
                </div>
              )}

              {/* Follow-up */}
              {selectedConsultation.followUpDate && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Seguimiento Programado</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    {new Date(selectedConsultation.followUpDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}