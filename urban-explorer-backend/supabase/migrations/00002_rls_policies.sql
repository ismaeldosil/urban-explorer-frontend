-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Locations policies
CREATE POLICY "Locations are viewable by everyone"
    ON public.locations FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert locations"
    ON public.locations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own locations"
    ON public.locations FOR UPDATE
    USING (auth.uid() = created_by);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
    ON public.favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
    ON public.favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON public.favorites FOR DELETE
    USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "User badges are viewable by everyone"
    ON public.user_badges FOR SELECT
    USING (true);

-- User stats policies
CREATE POLICY "User stats are viewable by everyone"
    ON public.user_stats FOR SELECT
    USING (true);
