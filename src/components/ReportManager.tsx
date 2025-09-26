import React, { useState } from 'react';
import { Employee, AttendanceRecord, Advance, MonthlyReport } from '../types';
import { formatCurrency, getWeekStart } from '../utils/dateUtils';
import { FileText, Download, Calendar, User, IndianRupee, Clock, TrendingUp, TrendingDown, Search } from 'lucide-react';

interface ReportManagerProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  advances: Advance[];
  userRole: 'admin' | 'viewer';
}

const ReportManager: React.FC<ReportManagerProps> = ({
  employees,
  attendance,
  advances,
  userRole,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [searchTerm, setSearchTerm] = useState('');

  const generateMonthlyReport = (employeeId: string, month: string): MonthlyReport | null => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return null;

    const monthStart = new Date(month + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    // Get attendance records for the month
    const monthAttendance = attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      return a.employeeId === employeeId && 
             attendanceDate >= monthStart && 
             attendanceDate <= monthEnd;
    });

    // Get advance records for the month
    const monthAdvances = advances.filter(a => {
      const advanceDate = new Date(a.date);
      return a.employeeId === employeeId && 
             advanceDate >= monthStart && 
             advanceDate <= monthEnd;
    });

    // Calculate totals
    const totalDaysWorked = monthAttendance.filter(a => a.present).length;
    const totalWagesEarned = monthAttendance.reduce((sum, a) => {
      if (a.present) {
        return sum + employee.dailyWage + (a.customAmount || 0);
      }
      return sum;
    }, 0);
    const totalAdvancesTaken = monthAdvances.reduce((sum, a) => sum + a.amount, 0);
    const finalAmount = totalWagesEarned - totalAdvancesTaken;

    return {
      employeeId,
      month,
      totalDaysWorked,
      totalWagesEarned,
      totalAdvancesTaken,
      finalAmount,
      attendanceDetails: monthAttendance,
      advanceDetails: monthAdvances,
    };
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployeeData = selectedEmployee ? employees.find(e => e.id === selectedEmployee) : null;
  const monthlyReport = selectedEmployee ? generateMonthlyReport(selectedEmployee, selectedMonth) : null;

  const downloadReport = () => {
    if (!monthlyReport || !selectedEmployeeData) return;

    const reportContent = `
MONTHLY PAYSLIP REPORT
======================

Employee Details:
Name: ${selectedEmployeeData.name}
Designation: ${selectedEmployeeData.designation}
Contact: ${selectedEmployeeData.contactNumber}
Daily Wage: ${formatCurrency(selectedEmployeeData.dailyWage)}

Report Period: ${new Date(selectedMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}

ATTENDANCE SUMMARY:
Total Days Worked: ${monthlyReport.totalDaysWorked}
Total Wages Earned: ${formatCurrency(monthlyReport.totalWagesEarned)}

ADVANCE SUMMARY:
Total Advances Taken: ${formatCurrency(monthlyReport.totalAdvancesTaken)}

FINAL CALCULATION:
Wages Earned: ${formatCurrency(monthlyReport.totalWagesEarned)}
Less: Advances: ${formatCurrency(monthlyReport.totalAdvancesTaken)}
Final Amount: ${formatCurrency(monthlyReport.finalAmount)}

ATTENDANCE DETAILS:
${monthlyReport.attendanceDetails.map(a => 
  `${new Date(a.date).toLocaleDateString('en-IN')}: ${a.present ? 'Present' : 'Absent'}${a.customType ? ` (${a.customType})` : ''}${a.customAmount ? ` +${formatCurrency(a.customAmount)}` : ''}`
).join('\n')}

ADVANCE DETAILS:
${monthlyReport.advanceDetails.map(a => 
  `${new Date(a.date).toLocaleDateString('en-IN')}: ${formatCurrency(a.amount)} - ${a.description}`
).join('\n')}

Generated on: ${new Date().toLocaleDateString('en-IN')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEmployeeData.name}_${selectedMonth}_payslip.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Reports</h2>
            <p className="text-gray-600">Generate monthly payslip reports</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Employee & Month</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Employee
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => {
            const isSelected = selectedEmployee === employee.id;
            const report = generateMonthlyReport(employee.id, selectedMonth);

            return (
              <button
                key={employee.id}
                onClick={() => setSelectedEmployee(employee.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {employee.photo ? (
                    <img
                      src={employee.photo}
                      alt={employee.name}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900">{employee.name}</span>
                    <p className="text-sm text-gray-600">{employee.designation}</p>
                  </div>
                </div>
                {report && (
                  <div className="text-xs text-gray-500">
                    {report.totalDaysWorked} days worked • {formatCurrency(report.finalAmount)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredEmployees.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No employees found matching your search.</p>
          </div>
        )}
      </div>

      {/* Monthly Report */}
      {monthlyReport && selectedEmployeeData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Report - {selectedEmployeeData.name}
            </h3>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>

          {/* Employee Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {selectedEmployeeData.photo ? (
                <img
                  src={selectedEmployeeData.photo}
                  alt={selectedEmployeeData.name}
                  className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
              )}
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedEmployeeData.name}</h4>
                <p className="text-gray-600">{selectedEmployeeData.designation}</p>
                <p className="text-sm text-gray-500">Daily Wage: {formatCurrency(selectedEmployeeData.dailyWage)}</p>
              </div>
            </div>
            <div className="text-center">
              <h5 className="text-lg font-semibold text-gray-900">
                Report for {new Date(selectedMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h5>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Days Worked</p>
                  <p className="text-2xl font-bold text-blue-900">{monthlyReport.totalDaysWorked}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Wages Earned</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(monthlyReport.totalWagesEarned)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Advances Taken</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(monthlyReport.totalAdvancesTaken)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              monthlyReport.finalAmount >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    monthlyReport.finalAmount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Final Amount
                  </p>
                  <p className={`text-2xl font-bold ${
                    monthlyReport.finalAmount >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {monthlyReport.finalAmount >= 0 ? '+' : ''}
                    {formatCurrency(monthlyReport.finalAmount)}
                  </p>
                </div>
                <IndianRupee className={`h-8 w-8 ${
                  monthlyReport.finalAmount >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Attendance Details</h4>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {monthlyReport.attendanceDetails.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {monthlyReport.attendanceDetails.map((record) => (
                      <div key={record.id} className="p-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium">
                            {new Date(record.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {record.customType && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {record.customType}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`font-medium ${
                            record.present ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                          {record.customAmount && (
                            <div className="text-sm text-blue-600">
                              +{formatCurrency(record.customAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No attendance records for this month
                  </div>
                )}
              </div>
            </div>

            {/* Advance Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Advance Details</h4>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {monthlyReport.advanceDetails.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {monthlyReport.advanceDetails.map((advance) => (
                      <div key={advance.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">
                              {new Date(advance.date).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <p className="text-sm text-gray-600">{advance.description}</p>
                          </div>
                          <span className="font-medium text-orange-600">
                            -{formatCurrency(advance.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No advances taken this month
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManager;