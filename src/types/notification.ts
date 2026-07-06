export interface Notification {
  id: number;
  type: string;
  message: string;
  relatedPropertyId: number | null;
  isRead: boolean;
  createdAt: string;
}
