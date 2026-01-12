-- Update get_ranked_coaches to use meaningful profile completeness checks
-- instead of the strict onboarding_completed flag

CREATE OR REPLACE FUNCTION public.get_ranked_coaches(
    p_user_city TEXT DEFAULT NULL,
    p_user_region TEXT DEFAULT NULL,
    p_user_country_code TEXT DEFAULT NULL,
    p_filter_country_code TEXT DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_coach_types TEXT[] DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_online_only BOOLEAN DEFAULT FALSE,
    p_in_person_only BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 50,
    p_user_lat DOUBLE PRECISION DEFAULT NULL,
    p_user_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    username TEXT,
    display_name TEXT,
    bio TEXT,
    coach_types TEXT[],
    certifications TEXT[],
    experience_years INTEGER,
    hourly_rate NUMERIC,
    currency TEXT,
    location TEXT,
    location_city TEXT,
    location_region TEXT,
    location_country TEXT,
    location_country_code TEXT,
    online_available BOOLEAN,
    in_person_available BOOLEAN,
    profile_image_url TEXT,
    card_image_url TEXT,
    booking_mode TEXT,
    is_verified BOOLEAN,
    verified_at TIMESTAMPTZ,
    gym_affiliation TEXT,
    marketplace_visible BOOLEAN,
    selected_avatar_id UUID,
    created_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN,
    who_i_work_with TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    tiktok_url TEXT,
    x_url TEXT,
    threads_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    avatar_slug TEXT,
    avatar_rarity TEXT,
    is_sponsored BOOLEAN,
    visibility_score NUMERIC,
    location_tier INTEGER,
    review_count BIGINT,
    avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_search_pattern TEXT;
BEGIN
    -- Prepare search pattern if search term provided
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        v_search_pattern := '%' || LOWER(p_search_term) || '%';
    END IF;

    RETURN QUERY
    WITH boost_status AS (
        -- Check which coaches have active boosts
        SELECT DISTINCT cb.coach_id, TRUE as is_boosted
        FROM coach_boosts cb
        WHERE cb.is_active = TRUE
          AND cb.starts_at <= NOW()
          AND cb.expires_at > NOW()
    ),
    review_stats AS (
        -- Pre-aggregate review statistics per coach
        SELECT 
            cr.coach_id,
            COUNT(*)::BIGINT as review_count,
            ROUND(AVG(cr.rating)::NUMERIC, 1) as avg_rating
        FROM coach_reviews cr
        WHERE cr.is_published = TRUE
        GROUP BY cr.coach_id
    ),
    ranked_coaches AS (
        SELECT
            cp.id,
            cp.username,
            cp.display_name,
            cp.bio,
            cp.coach_types,
            cp.certifications,
            cp.experience_years,
            cp.hourly_rate,
            cp.currency,
            cp.location,
            cp.location_city,
            cp.location_region,
            cp.location_country,
            cp.location_country_code,
            cp.online_available,
            cp.in_person_available,
            cp.profile_image_url,
            -- Fallback: use profile_image_url if card_image_url is null
            COALESCE(cp.card_image_url, cp.profile_image_url) as card_image_url,
            cp.booking_mode,
            cp.is_verified,
            cp.verified_at,
            cp.gym_affiliation,
            cp.marketplace_visible,
            cp.selected_avatar_id,
            cp.created_at,
            cp.onboarding_completed,
            cp.who_i_work_with,
            cp.facebook_url,
            cp.instagram_url,
            cp.tiktok_url,
            cp.x_url,
            cp.threads_url,
            cp.linkedin_url,
            cp.youtube_url,
            -- Avatar info from join
            a.slug as avatar_slug,
            a.rarity as avatar_rarity,
            -- Boost status
            COALESCE(bs.is_boosted, FALSE) as is_sponsored,
            -- Review stats
            COALESCE(rs.review_count, 0) as review_count,
            COALESCE(rs.avg_rating, 0) as avg_rating,
            -- Location tier scoring (primary ranking factor)
            CASE
                -- Exact city match (highest priority)
                WHEN p_user_city IS NOT NULL 
                     AND LOWER(cp.location_city) = LOWER(p_user_city) THEN 1000
                -- Same region/county
                WHEN p_user_region IS NOT NULL 
                     AND LOWER(cp.location_region) = LOWER(p_user_region) THEN 700
                -- Same country
                WHEN p_user_country_code IS NOT NULL 
                     AND LOWER(cp.location_country_code) = LOWER(p_user_country_code) THEN 400
                -- Online-only coaches (available everywhere)
                WHEN cp.online_available = TRUE AND cp.in_person_available = FALSE THEN 300
                -- Has online option
                WHEN cp.online_available = TRUE THEN 200
                -- No location match
                ELSE 100
            END as location_tier,
            -- Visibility score (secondary ranking within location tier)
            (
                -- Boost adds significant score within tier
                CASE WHEN COALESCE(bs.is_boosted, FALSE) THEN 500 ELSE 0 END
                -- Verified coaches get bonus
                + CASE WHEN cp.is_verified = TRUE THEN 100 ELSE 0 END
                -- Profile completeness signals
                + CASE WHEN cp.bio IS NOT NULL AND LENGTH(cp.bio) > 50 THEN 50 ELSE 0 END
                + CASE WHEN COALESCE(cp.card_image_url, cp.profile_image_url) IS NOT NULL THEN 50 ELSE 0 END
                + CASE WHEN cp.experience_years IS NOT NULL AND cp.experience_years > 0 THEN 25 ELSE 0 END
                -- Review engagement
                + LEAST(COALESCE(rs.review_count, 0) * 10, 100)
                + COALESCE(rs.avg_rating, 0) * 20
            )::NUMERIC as visibility_score
        FROM coach_profiles cp
        LEFT JOIN boost_status bs ON bs.coach_id = cp.id
        LEFT JOIN review_stats rs ON rs.coach_id = cp.id
        LEFT JOIN avatars a ON a.id = cp.selected_avatar_id
        WHERE 
            -- Must be visible in marketplace
            cp.marketplace_visible = TRUE
            -- Must have active status
            AND (cp.status IS NULL OR cp.status = 'active')
            -- NEW: Replace onboarding_completed check with meaningful profile checks
            -- Coach must have a display name and at least one coach type
            AND cp.display_name IS NOT NULL
            AND cp.coach_types IS NOT NULL 
            AND array_length(cp.coach_types, 1) > 0
            -- Country filter (when explicitly filtering by country)
            AND (p_filter_country_code IS NULL 
                 OR LOWER(cp.location_country_code) = LOWER(p_filter_country_code))
            -- Search filter
            AND (v_search_pattern IS NULL OR (
                LOWER(cp.display_name) LIKE v_search_pattern
                OR LOWER(cp.bio) LIKE v_search_pattern
                OR LOWER(cp.location_city) LIKE v_search_pattern
                OR LOWER(cp.location_region) LIKE v_search_pattern
                OR EXISTS (
                    SELECT 1 FROM unnest(cp.coach_types) ct 
                    WHERE LOWER(ct) LIKE v_search_pattern
                )
            ))
            -- Coach type filter
            AND (p_coach_types IS NULL OR cp.coach_types && p_coach_types)
            -- Price filters
            AND (p_min_price IS NULL OR cp.hourly_rate >= p_min_price)
            AND (p_max_price IS NULL OR cp.hourly_rate <= p_max_price)
            -- Availability filters
            AND (p_online_only = FALSE OR cp.online_available = TRUE)
            AND (p_in_person_only = FALSE OR cp.in_person_available = TRUE)
    )
    SELECT
        rc.id,
        rc.username,
        rc.display_name,
        rc.bio,
        rc.coach_types,
        rc.certifications,
        rc.experience_years,
        rc.hourly_rate,
        rc.currency,
        rc.location,
        rc.location_city,
        rc.location_region,
        rc.location_country,
        rc.location_country_code,
        rc.online_available,
        rc.in_person_available,
        rc.profile_image_url,
        rc.card_image_url,
        rc.booking_mode,
        rc.is_verified,
        rc.verified_at,
        rc.gym_affiliation,
        rc.marketplace_visible,
        rc.selected_avatar_id,
        rc.created_at,
        rc.onboarding_completed,
        rc.who_i_work_with,
        rc.facebook_url,
        rc.instagram_url,
        rc.tiktok_url,
        rc.x_url,
        rc.threads_url,
        rc.linkedin_url,
        rc.youtube_url,
        rc.avatar_slug,
        rc.avatar_rarity,
        rc.is_sponsored,
        rc.visibility_score,
        rc.location_tier,
        rc.review_count,
        rc.avg_rating
    FROM ranked_coaches rc
    ORDER BY 
        -- Primary: Location tier (city > region > country > online)
        rc.location_tier DESC,
        -- Secondary: Visibility score (boost, verified, profile quality)
        rc.visibility_score DESC,
        -- Tertiary: Randomize within same scores for fairness
        RANDOM()
    LIMIT p_limit;
END;
$$;