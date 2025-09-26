import React, { useState } from 'react';
import { Employee, AttendanceRecord, Advance } from '../types';
import { formatCurrency, getCurrentWeek, getWeekStart } from '../utils/dateUtils';
import { CreditCard, User, Calendar, IndianRupee, TrendingUp, TrendingDown, Search } from 'lucide-react';

interface PaymentManagerProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  advances: Advance[];
  userRole: 'admin' | 'viewer';
}

const PaymentManager: React.FC<PaymentManagerProps> = ({
  employees,
  attendance,
  advances,
  userRole,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const calculateEmployeePayment = (employeeId: string) => {
    const currentWeek = getCurrentWeek();
    const employee = employees.find(e => e.id === employeeId);
    
    if (!employee) return null;

    // Calculate total wages for current week
    const weekAttendance = attendance.filter(a => 
      a.employeeId === employeeId && 
      a.weekStart === currentWeek && 
      a.present
    ).length;
    
    const weekWages = weekAttendance * employee.dailyWage;
    
    // Calculate total advances for current week
    const weekAdvances = advances
      .filter(a => {
        const advanceWeek = getWeekStart(new Date(a.date));
        return a.employeeId === employeeId && advanceWeek === currentWeek;
      })
      .reduce((sum, a) => sum + a.amount, 0);
    
    const finalPayment = weekWages - weekAdvances;
    
    return {
      employee,
      daysWorked: weekAttendance,
      weekWages,
      weekAdvances,
      finalPayment,
      advances: advances.filter(a => {
        const advanceWeek = getWeekStart(new Date(a.date));
        return a.employeeId === employeeId && advanceWeek === currentWeek;
      })
    };
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployeeData = selectedEmployee ? calculateEmployeePayment(selectedEmployee) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
            <p className="text-gray-600">Calculate final payments after advance deductions</p>
          </div>
        </div>
        {userRole === 'viewer' && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            View Only
          </span>
        )}
      </div>

      {/* Employee Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Employee for Payment</h3>
        
        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee by name or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => {
            const paymentData = calculateEmployeePayment(employee.id);
            if (!paymentData) return null;

            const isSelected = selectedEmployee === employee.id;
            const isPositive = paymentData.finalPayment >= 0;

            return (
              <button
                key={employee.id}
                onClick={() => setSelectedEmployee(employee.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{employee.name}</span>
                  </div>
                  <div className={`text-sm font-semibold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{formatCurrency(paymentData.finalPayment)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{employee.designation}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {paymentData.daysWorked} days worked this week
                </div>
              </button>
            );
          })}
        </div>

        {filteredEmployees.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600">Try adjusting your search terms.</p>
          </div>
        )}
        
        {employees.length === 0 && !searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No employees found. Add employees first to calculate payments.</p>
          </div>
        )}
      </div>

      {/* Payment Details */}
      {selectedEmployeeData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Details - {selectedEmployeeData.employee.name}
            </h3>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Week of {new Date(getCurrentWeek()).toLocaleDateString('en-IN', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Wages Earned</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(selectedEmployeeData.weekWages)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedEmployeeData.daysWorked} days × {formatCurrency(selectedEmployeeData.employee.dailyWage)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Advances</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(selectedEmployeeData.weekAdvances)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {selectedEmployeeData.advances.length} advance(s) taken
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              selectedEmployeeData.finalPayment >= 0 
                ? 'bg-green-50' 
                : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    selectedEmployeeData.finalPayment >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    Final Payment
                  </p>
                  <p className={`text-2xl font-bold ${
                    selectedEmployeeData.finalPayment >= 0 
                      ? 'text-green-900' 
                      : 'text-red-900'
                  }`}>
                    {selectedEmployeeData.finalPayment >= 0 ? '+' : ''}
                    {formatCurrency(selectedEmployeeData.finalPayment)}
                  </p>
                  <p className={`text-xs mt-1 ${
                    selectedEmployeeData.finalPayment >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {selectedEmployeeData.finalPayment >= 0 
                      ? 'Amount to pay' 
                      : 'Excess advance taken'
                    }
                  </p>
                </div>
                <IndianRupee className={`h-8 w-8 ${
                  selectedEmployeeData.finalPayment >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Advance Details */}
          {selectedEmployeeData.advances.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Advance Details This Week</h4>
              <div className="space-y-3">
                {selectedEmployeeData.advances.map((advance) => (
                  <div key={advance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{advance.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(advance.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="font-semibold text-orange-600">
                      -{formatCurrency(advance.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                selectedEmployeeData.finalPayment >= 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedEmployeeData.finalPayment >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ready to pay {formatCurrency(selectedEmployeeData.finalPayment)}
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Excess advance of {formatCurrency(Math.abs(selectedEmployeeData.finalPayment))}
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedEmployeeData.finalPayment >= 0
                  ? 'This employee should receive the above amount after deducting advances.'
                  : 'This employee has taken more advance than earned wages this week.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Employees Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Employees Payment Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Days Worked</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Wages Earned</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Advances</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Final Payment</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const paymentData = calculateEmployeePayment(employee.id);
                if (!paymentData) return null;

                return (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.designation}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium">{paymentData.daysWorked}/7</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-green-600">
                        {formatCurrency(paymentData.weekWages)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-orange-600">
                        {formatCurrency(paymentData.weekAdvances)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${
                        paymentData.finalPayment >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {paymentData.finalPayment >= 0 ? '+' : ''}
                        {formatCurrency(paymentData.finalPayment)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No employees found to calculate payments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManager;