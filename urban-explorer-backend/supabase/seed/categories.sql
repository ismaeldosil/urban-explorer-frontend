INSERT INTO public.categories (name, slug, icon, color) VALUES
    ('Restaurantes', 'restaurant', 'restaurant', '#FF6B35'),
    ('Cafés', 'cafe', 'cafe', '#8B4513'),
    ('Parques', 'park', 'leaf', '#28A745'),
    ('Museos', 'museum', 'library', '#9C27B0'),
    ('Tiendas', 'shop', 'cart', '#3880FF'),
    ('Bares', 'bar', 'wine', '#E91E63'),
    ('Cultura', 'culture', 'color-palette', '#FF9800'),
    ('Deportes', 'sports', 'basketball', '#00BCD4')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.badges (name, description, icon, criteria, points) VALUES
    ('First Review', 'Escribiste tu primera review', 'star', '{"type": "reviews", "count": 1}', 10),
    ('Explorer', 'Visitaste 10 lugares', 'compass', '{"type": "visits", "count": 10}', 50),
    ('Critic', 'Escribiste 10 reviews', 'create', '{"type": "reviews", "count": 10}', 100),
    ('Photographer', 'Subiste 20 fotos', 'camera', '{"type": "photos", "count": 20}', 75),
    ('Night Owl', 'Visitaste 5 lugares después de las 10pm', 'moon', '{"type": "night_visits", "count": 5}', 50),
    ('Weekend Warrior', 'Exploraste 3 fines de semana seguidos', 'calendar', '{"type": "weekend_streak", "count": 3}', 100),
    ('Foodie', 'Visitaste 15 restaurantes', 'restaurant', '{"type": "category_visits", "category": "restaurant", "count": 15}', 75)
ON CONFLICT DO NOTHING;
