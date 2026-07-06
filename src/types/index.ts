export type TaxStatus = "Paid" | "Pending" | "Overdue";

export type PropertyType = "Residential" | "Commercial" | "Industrial" | "Vacant Land";

export type PropertyStatus = "Active" | "Under Review" | "Disputed";

export interface Property {
  id: string;
  owner: string;
  district: string;
  address: string;
  type: PropertyType;
  assessedValue: number;
  taxAmount: number;
  balanceDue: number;
  status: PropertyStatus;
  lastAssessed: string;
  lat: number;
  lng: number;
}

export interface TaxRecord {
  id: string;
  propertyId: string;
  owner: string;
  dueDate: string;
  amount: number;
  status: TaxStatus;
}

export interface DelinquentEntry {
  propertyId: string;
  owner: string;
  district: string;
  lastAssessed: string;
  balanceDue: number;
}

export interface CollectionEntry {
  propertyId: string;
  owner: string;
  amount: number;
  date: string;
}

export interface MonthlyCollection {
  month: string;
  amount: number;
}

export interface District {
  id: string;
  name: string;
}

export type Delta = {
  value: string;
  direction: "up" | "down";
};
