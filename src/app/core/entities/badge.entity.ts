export interface BadgeEntity {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requiredCount: number;
  type: 'review' | 'visit' | 'favorite';
  createdAt: Date;
}
