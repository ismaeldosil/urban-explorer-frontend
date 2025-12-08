-- Urban Explorer Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable PostGIS extension for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500) NOT NULL,
  category VARCHAR(50) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster geospatial queries
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations (category);

-- Create the find_nearby_locations RPC function
CREATE OR REPLACE FUNCTION find_nearby_locations(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5,
  max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  address VARCHAR(500),
  category VARCHAR(50),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating DECIMAL(2,1),
  review_count INTEGER,
  image_url TEXT,
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.description,
    l.address,
    l.category,
    l.latitude,
    l.longitude,
    l.rating,
    l.review_count,
    l.image_url,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(l.latitude)) *
        cos(radians(l.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(l.latitude))
      )
    ) AS distance_km
  FROM locations l
  WHERE (
    6371 * acos(
      cos(radians(lat)) * cos(radians(l.latitude)) *
      cos(radians(l.longitude) - radians(lng)) +
      sin(radians(lat)) * sin(radians(l.latitude))
    )
  ) <= radius_km
  ORDER BY distance_km
  LIMIT max_results;
END;
$$;

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read locations
CREATE POLICY "Allow public read access" ON locations
  FOR SELECT
  USING (true);

-- Insert sample data for Montevideo
INSERT INTO locations (name, description, address, category, latitude, longitude, rating, review_count, image_url) VALUES
('Mercado del Puerto', 'Histórico mercado gastronómico con parrillas tradicionales', 'Rambla 25 de Agosto, Ciudad Vieja', 'restaurant', -34.9069, -56.2125, 4.7, 2850, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'),
('Café Brasilero', 'El café más antiguo de Uruguay, desde 1877', 'Ituzaingó 1447, Ciudad Vieja', 'cafe', -34.9055, -56.2089, 4.6, 1200, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'),
('Parque Rodó', 'Hermoso parque urbano con lago y feria de artesanos', 'Av. Julio Herrera y Reissig, Parque Rodó', 'park', -34.9167, -56.1667, 4.5, 3200, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
('Teatro Solís', 'Principal teatro de ópera y ballet de Uruguay', 'Buenos Aires s/n, Ciudad Vieja', 'museum', -34.9067, -56.2044, 4.8, 4500, 'https://images.unsplash.com/photo-1574871786514-46e1680ea587?w=400'),
('Bar Fun Fun', 'Histórico bar de tango desde 1895', 'Ciudadela 1229, Ciudad Vieja', 'bar', -34.9078, -56.2033, 4.4, 890, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400'),
('Feria de Tristán Narvaja', 'Famosa feria dominical de antigüedades y artesanías', 'Tristán Narvaja, Cordón', 'shop', -34.9000, -56.1833, 4.3, 1800, 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400'),
('La Rambla', 'Icónico paseo costero de 22 km', 'Rambla de Montevideo', 'park', -34.9108, -56.1500, 4.9, 8900, 'https://images.unsplash.com/photo-1587162146766-e06b1189b907?w=400'),
('Museo Torres García', 'Museo dedicado al artista uruguayo Joaquín Torres García', 'Sarandí 683, Ciudad Vieja', 'museum', -34.9061, -56.2056, 4.6, 2100, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400'),
('Pocitos Beach', 'Playa urbana popular con vista a la rambla', 'Rambla República del Perú, Pocitos', 'park', -34.9167, -56.1500, 4.7, 5600, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'),
('Escaramuza', 'Librería-café con ambiente bohemio', 'Pablo de María 1185, Cordón', 'cafe', -34.9044, -56.1778, 4.5, 680, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400');

-- Grant access to the function for anon users
GRANT EXECUTE ON FUNCTION find_nearby_locations TO anon;
GRANT SELECT ON locations TO anon;
