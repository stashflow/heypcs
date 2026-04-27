ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS listing_status VARCHAR(20) DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS location_city VARCHAR(120) DEFAULT 'Marietta',
  ADD COLUMN IF NOT EXISTS location_zip VARCHAR(20) DEFAULT '30067',
  ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN DEFAULT true;

UPDATE listings
SET listing_status = CASE WHEN is_sold THEN 'sold' ELSE COALESCE(listing_status, 'available') END,
    location_city = COALESCE(location_city, 'Marietta'),
    location_zip = COALESCE(location_zip, '30067'),
    is_mobile = COALESCE(is_mobile, true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_listing_status_check'
  ) THEN
    ALTER TABLE listings
      ADD CONSTRAINT listings_listing_status_check
      CHECK (listing_status IN ('available', 'pending', 'sold'));
  END IF;
END $$;
