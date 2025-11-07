// 공통 타입 정의

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member";
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  code: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  createdBy: number;
  createdAt: string;
}

export interface DuesStatus {
  userId: number;
  userName: string;
  isPaid: boolean;
  paidAt?: string;
}

export interface DashboardStats {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}
