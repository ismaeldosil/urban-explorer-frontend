export interface ReviewDto {
  id: string;
  locationId: string;
  userId: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}
