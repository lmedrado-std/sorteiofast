export type Sale = {
  id: string;
  sellerName: string;
  cpf: string;
  value: number;
  date: Date;
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
  date: Date;
};
