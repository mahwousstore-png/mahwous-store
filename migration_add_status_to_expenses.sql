-- Migration: Add status column and related fields to expenses table
-- This migration adds the missing status, approved_by, approved_at, and employee_balance_transaction_id columns
-- Run this in Supabase SQL Editor if you get "Could not find the 'status' column" error

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'expenses' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.expenses 
        ADD COLUMN status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));
        
        CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
        
        RAISE NOTICE 'Added status column to expenses table';
    ELSE
        RAISE NOTICE 'Status column already exists in expenses table';
    END IF;
END $$;

-- Add approved_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'expenses' 
        AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE public.expenses 
        ADD COLUMN approved_by TEXT;
        
        RAISE NOTICE 'Added approved_by column to expenses table';
    ELSE
        RAISE NOTICE 'approved_by column already exists in expenses table';
    END IF;
END $$;

-- Add approved_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'expenses' 
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE public.expenses 
        ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Added approved_at column to expenses table';
    ELSE
        RAISE NOTICE 'approved_at column already exists in expenses table';
    END IF;
END $$;

-- Add employee_balance_transaction_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'expenses' 
        AND column_name = 'employee_balance_transaction_id'
    ) THEN
        ALTER TABLE public.expenses 
        ADD COLUMN employee_balance_transaction_id UUID;
        
        RAISE NOTICE 'Added employee_balance_transaction_id column to expenses table';
    ELSE
        RAISE NOTICE 'employee_balance_transaction_id column already exists in expenses table';
    END IF;
END $$;

-- Verify all columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'expenses'
ORDER BY ordinal_position;

-- Refresh Supabase schema cache
-- Note: In Supabase dashboard, you may need to go to Table Editor and click on the expenses table
-- to force a schema cache refresh
