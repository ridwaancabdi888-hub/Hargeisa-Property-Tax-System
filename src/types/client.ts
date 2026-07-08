export interface Client {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDetail extends Client {
  propertyCount: number;
}

export interface ClientListMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ClientListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ClientFormValues {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}
