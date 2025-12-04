export type Sale = {
  id: string;
  purchaseNumber: string;
  value: number;
  date: Date;
  employeeId: string;
};

export type Coupon = {
  id: string;
  saleId: string;
  employeeId: string;
};
