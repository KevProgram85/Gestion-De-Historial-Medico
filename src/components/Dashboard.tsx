import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const { patients, appointments, consultations } = useData();
  const { user } = useAuth();

  // Calculate statistics
  const totalPatients = patients.length;
  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0] && apt.status === 'scheduled'
  ).length;
  const completedConsultations = consultations.length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'scheduled').length;

  const recentAppointments = appointments
    .filter(apt => apt.status === 'scheduled')
    .slice(0, 5)
    .map(apt => ({
      ...apt,
      patient: patients.find(p => p.id === apt.patientId)
    }));

  const stats = [
    {
      title: 'Total Pacientes',
      value: totalPatients,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Citas Hoy',
      value: todayAppointments,
      icon: Calendar,
      color: 'green',
      change: '+3'
    },
    {
      title: 'Consultas Realizadas',
      value: completedConsultations,
      icon: FileText,
      color: 'purple',
      change: '+8'
    },
    {
      title: 'Citas Pendientes',
      value: pendingAppointments,
      icon: Clock,
      color: 'orange',
      change: '+5'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Resumen de actividades del sistema médico
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
          </div>
          <div className="space-y-3">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.type === 'consultation' ? 'Consulta' :
                         appointment.type === 'follow-up' ? 'Seguimiento' :
                         appointment.type === 'routine' ? 'Rutina' : 'Emergencia'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <p className="text-xs text-gray-500">{appointment.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay citas programadas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}