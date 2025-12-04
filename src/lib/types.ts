
import type { Timestamp } from 'firebase/firestore';

export type Sale = {
  id: string;
  sellerName: string;
  cpf: string;
  value: number;
  date: Date | Timestamp; // Allow both for frontend and backend
  employeeId: string;
  store: string;
};

export type Coupon = {
  id: string;
  saleId: string;
  employeeId: string;
};

export type Winner = {
  couponId: string;
  sellerName: string;
  store: string;
  date: Date | Timestamp;
  saleValue: number;
  saleDate: Date | Timestamp;
};
