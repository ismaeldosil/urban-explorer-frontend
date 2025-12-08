import { Coordinates } from '../value-objects/coordinates.vo';
import { DomainError } from '../errors/domain-error';

export interface LocationProps {
  id: string;
  name: string;
  description: string;
  category: string;
  coordinates: Coordinates;
  address: string;
  city: string;
  country: string;
  imageUrl?: string;
  images?: string[];
  rating: number;
  reviewCount?: number;
  priceLevel?: number;
  phone?: string;
  website?: string;
  amenities?: string[];
  tags?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LocationEntity {
  private constructor(private props: LocationProps) {}

  static create(props: LocationProps): LocationEntity {
    if (!props.name || props.name.length < 2) {
      throw new DomainError('Location name must be at least 2 characters', 'INVALID_NAME');
    }
    return new LocationEntity(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string { return this.props.description; }
  get category(): string { return this.props.category; }
  get coordinates(): Coordinates { return this.props.coordinates; }
  get address(): string { return this.props.address; }
  get city(): string { return this.props.city; }
  get country(): string { return this.props.country; }
  get imageUrl(): string | undefined { return this.props.imageUrl; }
  get images(): string[] { return this.props.images ?? []; }
  get rating(): number { return this.props.rating; }
  get reviewCount(): number { return this.props.reviewCount ?? 0; }
  get priceLevel(): number | undefined { return this.props.priceLevel; }
  get phone(): string | undefined { return this.props.phone; }
  get website(): string | undefined { return this.props.website; }
  get amenities(): string[] { return this.props.amenities ?? []; }
  get tags(): string[] { return this.props.tags ?? []; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isNear(coords: Coordinates, radiusMeters: number): boolean {
    return this.coordinates.distanceTo(coords) <= radiusMeters;
  }

  distanceTo(coords: Coordinates): number {
    return this.coordinates.distanceTo(coords);
  }

  hasHighRating(): boolean {
    return this.rating >= 4.0;
  }
}
