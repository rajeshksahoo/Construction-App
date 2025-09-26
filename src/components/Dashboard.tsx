import React, { useState } from 'react';
import { Employee, AttendanceRecord, Advance } from '../types';
import { formatCurrency, getCurrentWeek, getWeekStart } from '../utils/dateUtils';
import { Users, Calendar, IndianRupee, TrendingUp, X } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  advances: Advance[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees, attendance, advances }) => {
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const currentWeek = getCurrentWeek();
  
  // Calculate current week statistics
  const currentWeekAttendance = attendance.filter(a => a.weekStart === currentWeek);
  const currentWeekAdvances = advances.filter(a => {
    const advanceWeek = getWeekStart(new Date(a.date));
    return advanceWeek === currentWeek;
  });

  const totalEmployees = employees.length;
  const totalPresentToday = currentWeekAttendance.filter(a => 
    a.present && a.date === new Date().toISOString().split('T')[0]
  ).length;
  
  const totalCurrentWeekWages = currentWeekAttendance
    .filter(a => a.present)
    .reduce((sum, a) => {
      const employee = employees.find(e => e.id === a.employeeId);
      return sum + (employee?.dailyWage || 0);
    }, 0);
  
  const totalCurrentWeekAdvances = currentWeekAdvances.reduce((sum, a) => sum + a.amount, 0);

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => setShowAllEmployees(true),
      clickable: true
    },
    {
      title: 'Present Today',
      value: totalPresentToday,
      icon: Calendar,
      color: 'bg-green-500',
      clickable: false
    },
    {
      title: 'Week Wages',
      value: formatCurrency(totalCurrentWeekWages),
      icon: TrendingUp,
      color: 'bg-purple-500',
      clickable: false
    },
    {
      title: 'Week Advances',
      value: formatCurrency(totalCurrentWeekAdvances),
      icon: IndianRupee,
      color: 'bg-orange-500',
      clickable: false
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Week of {new Date(currentWeek).toLocaleDateString('en-IN', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${
                stat.clickable ? 'cursor-pointer hover:border-blue-300 hover:ring-2 hover:ring-blue-100' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Employees Modal */}
      {showAllEmployees && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                All Employees ({employees.length})
              </h2>
              <button 
                onClick={() => setShowAllEmployees(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => {
                  const employeeAttendance = currentWeekAttendance.filter(a => 
                    a.employeeId === employee.id && a.present
                  ).length;
                  const weekEarnings = employeeAttendance * employee.dailyWage;
                  
                  return (
                    <div key={employee.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.designation}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Daily Wage</p>
                          <p className="font-medium">{formatCurrency(employee.dailyWage)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">This Week</p>
                          <p className="font-medium">{employeeAttendance} days</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Week Earnings</p>
                          <p className="font-semibold text-green-600">{formatCurrency(weekEarnings)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {employees.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No employees added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Advances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Advances</h3>
          <div className="space-y-3">
            {advances
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((advance) => {
                const employee = employees.find(e => e.id === advance.employeeId);
                return (
                  <div key={advance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{employee?.name}</p>
                      <p className="text-sm text-gray-600">{advance.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">{formatCurrency(advance.amount)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(advance.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            {advances.length === 0 && (
              <p className="text-gray-500 text-center py-4">No advances recorded yet</p>
            )}
          </div>
        </div>

        {/* Top Earners This Week */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earners This Week</h3>
          <div className="space-y-3">
            {employees
              .map((employee) => {
                const weekAttendance = currentWeekAttendance.filter(a => 
                  a.employeeId === employee.id && a.present
                ).length;
                const weekEarnings = weekAttendance * employee.dailyWage;
                return { employee, weekEarnings, weekAttendance };
              })
              .sort((a, b) => b.weekEarnings - a.weekEarnings)
              .slice(0, 5)
              .map(({ employee, weekEarnings, weekAttendance }) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.designation}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(weekEarnings)}</p>
                    <p className="text-xs text-gray-500">{weekAttendance} days</p>
                  </div>
                </div>
              ))}
            {employees.length === 0 && (
              <p className="text-gray-500 text-center py-4">No employees added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;