export interface Employee {
  id: string;
  name: string;
  designation: string;
  contactNumber: string;
  dailyWage: number;
  createdAt: string;
  photo?: string; // base64 encoded image
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  present: boolean;
  late?: boolean;
  weekStart: string; // Monday of the week
}

export interface Advance {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  description: string;
}

export interface WeeklySummary {
  weekStart: string;
  daysWorked: number;
  totalWages: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'viewer';
}

export interface AttendanceStatus {
  present: boolean;
  late?: boolean;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleName: string;
  vehicleType: string;
  createdAt: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  fuelAmount: number; // in liters
  fuelCost: number; // in rupees
  description?: string;
  createdAt: string;
}

export interface MonthlyReport {
  employeeId: string;
  month: string; // YYYY-MM format
  totalDaysWorked: number;
  totalWagesEarned: number;
  totalAdvancesTaken: number;
  finalAmount: number;
  attendanceDetails: AttendanceRecord[];
  advanceDetails: Advance[];
}
// In your types file
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  weekStart: string;
  present: boolean;
  late?: boolean;
  customType?: 'ot' | 'half-day' | 'custom';
  customAmount?: number;
  notes?: string;
}