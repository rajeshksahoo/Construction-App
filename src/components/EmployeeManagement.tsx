import React, { useState } from 'react';
import { Employee, AttendanceRecord, Advance } from '../types';
import { formatCurrency, getCurrentWeek, getWeekStart } from '../utils/dateUtils';
import { Plus, CreditCard as Edit2, Phone, Calendar, IndianRupee, User } from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  advances: Advance[];
  userRole: 'admin' | 'viewer';
  onAddEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  attendance,
  advances,
  userRole,
  onAddEmployee,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    contactNumber: '',
    dailyWage: 500,
    photo: '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData({ ...formData, photo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee(formData);
    setFormData({ name: '', designation: '', contactNumber: '', dailyWage: 500, photo: '' });
    setShowAddForm(false);
  };

  const calculateEmployeeBalance = (employeeId: string) => {
    const currentWeek = getCurrentWeek();
    
    // Calculate total wages for current week
    const weekAttendance = attendance.filter(a => 
      a.employeeId === employeeId && 
      a.weekStart === currentWeek && 
      a.present
    ).length;
    
    const employee = employees.find(e => e.id === employeeId);
    const weekWages = weekAttendance * (employee?.dailyWage || 0);
    
    // Calculate total advances for current week
    const weekAdvances = advances
      .filter(a => {
        const advanceWeek = getWeekStart(new Date(a.date));
        return a.employeeId === employeeId && advanceWeek === currentWeek;
      })
      .reduce((sum, a) => sum + a.amount, 0);
    
    return {
      weekWages,
      weekAdvances,
      balance: weekWages - weekAdvances,
      daysWorked: weekAttendance
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Add Employee Form */}
      {showAddForm && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Employee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter employee name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mason, Helper, Electrician"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Wage (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.dailyWage}
                  onChange={(e) => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Add Employee
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((employee) => {
          const balance = calculateEmployeeBalance(employee.id);
          
          return (
            <div
              key={employee.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => {/* Will be handled by EmployeeCard component */}}
            >
              <div className="text-center">
                <div className="mb-3">
                  {employee.photo ? (
                    <img
                      src={employee.photo}
                      alt={employee.name}
                      className="w-16 h-16 object-cover rounded-full mx-auto border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-center">{employee.name}</h3>
                <p className="text-sm text-gray-600 text-center mb-3">{employee.designation}</p>
                
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    balance.balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {balance.balance >= 0 ? '+' : ''}{formatCurrency(balance.balance)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {employees.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first employee to the system.</p>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add First Employee
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;