export interface LocationDto {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  imageUrl?: string;
  averageRating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
