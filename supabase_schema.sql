-- ========================================================
-- RetinaAI - Supabase Database Schema & Storage Setup
-- ========================================================
-- Safe to re-run multiple times (idempotent)
-- ========================================================

-- 1. Create Patient Analyses Table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    age INT,
    sex TEXT,
    hba1c NUMERIC(4, 2),
    blood_glucose NUMERIC(6, 2),
    systolic_bp INT,
    diastolic_bp INT,
    diabetes_duration INT,
    diabetes_type TEXT,
    bmi NUMERIC(4, 1),
    predicted_severity TEXT NOT NULL,
    confidence NUMERIC(4, 3) NOT NULL,
    class_probabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    fundus_image_url TEXT,
    oct_image_url TEXT,
    clinical_explanation JSONB DEFAULT '[]'::jsonb,
    modality_contribution JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for faster patient lookups and date sorting
CREATE INDEX IF NOT EXISTS idx_analyses_patient_id ON public.analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Allow public read access to analyses (drop first to prevent duplicate errors)
DROP POLICY IF EXISTS "Allow anonymous read access on analyses" ON public.analyses;
CREATE POLICY "Allow anonymous read access on analyses"
    ON public.analyses
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow public insert access for incoming predictions (drop first to prevent duplicate errors)
DROP POLICY IF EXISTS "Allow anonymous insert on analyses" ON public.analyses;
CREATE POLICY "Allow anonymous insert on analyses"
    ON public.analyses
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ========================================================
-- 3. Storage Bucket: retina-images
-- ========================================================
-- Create bucket for Fundus and OCT images
INSERT INTO storage.buckets (id, name, public)
VALUES ('retina-images', 'retina-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for retina-images bucket (drop first to prevent duplicate errors)
DROP POLICY IF EXISTS "Allow public uploads to retina-images" ON storage.objects;
CREATE POLICY "Allow public uploads to retina-images"
    ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'retina-images');

DROP POLICY IF EXISTS "Allow public viewing of retina-images" ON storage.objects;
CREATE POLICY "Allow public viewing of retina-images"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'retina-images');
