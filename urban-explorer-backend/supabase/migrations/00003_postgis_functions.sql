-- Get nearby locations function
CREATE OR REPLACE FUNCTION get_nearby_locations(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000,
    category_filter UUID DEFAULT NULL,
    result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address VARCHAR,
    category_id UUID,
    price_level SMALLINT,
    average_rating DECIMAL,
    review_count INTEGER,
    photos TEXT[],
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.name,
        l.description,
        ST_Y(l.coordinates::geometry) as latitude,
        ST_X(l.coordinates::geometry) as longitude,
        l.address,
        l.category_id,
        l.price_level,
        l.average_rating,
        l.review_count,
        l.photos,
        ST_Distance(
            l.coordinates,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) as distance_meters
    FROM public.locations l
    WHERE ST_DWithin(
        l.coordinates,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        radius_meters
    )
    AND (category_filter IS NULL OR l.category_id = category_filter)
    ORDER BY distance_meters
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Update location rating function
CREATE OR REPLACE FUNCTION update_location_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.locations
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(2,1), 0)
            FROM public.reviews
            WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
        )
    WHERE id = COALESCE(NEW.location_id, OLD.location_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_location_rating();
