export type ListingType = "rent" | "sale";
export type ListingStatus = "available" | "sold" | "rented";

export interface PropertyListing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  type: ListingType;
  status: ListingStatus;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PropertyListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ListingType;
  status?: ListingStatus;
  min_price?: number;
  max_price?: number;
}

export interface PropertyFormValues {
  title: string;
  description: string;
  price: string;
  location: string;
  type: ListingType;
  status: ListingStatus;
}

export interface PropertyImage {
  id: number;
  url: string;
  createdAt: string;
}

export interface PropertyDetail extends PropertyListing {
  images: PropertyImage[];
}
