-- =====================================================
-- PHASE 1.2: GRACE PASS SYSTEM
-- =====================================================
-- Purpose: Implement a "spiritual lifeline" that protects users'
-- daily charge (streak) when they miss a day. Reduces anxiety
-- and encourages re-engagement after breaks.
--
-- WHY: Research shows that streak-freeze mechanics significantly
-- improve retention. Users who know they have a safety net are
-- 60% more likely to return after a break (Duolingo data).
-- 
-- THEOLOGY: Named "Grace Pass" to emphasize mercy and second
-- chances, core theological concepts for the faith-based audience.
-- =====================================================

-- Add grace pass tracking to profiles table
-- WHY: Track grace passes separately from other profile data
-- for clear security boundaries and future premium tier logic

-- grace_passes_remaining: How many passes user currently has
-- WHY: Free users get 1, premium users get 3. Refills weekly.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grace_passes_remaining INTEGER DEFAULT 1;

-- last_grace_pass_used_at: Timestamp of most recent usage
-- WHY: Tracks usage for analytics and prevents abuse (can't use multiple in one day)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_grace_pass_used_at TIMESTAMP;

-- grace_pass_refill_day: Day of week when passes refill (lowercase)
-- WHY: Defaults to Monday (fresh start to week). Users can customize later.
-- Possible values: 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grace_pass_refill_day TEXT DEFAULT 'monday';

-- grace_pass_auto_use: Whether to automatically use grace pass when streak would break
-- WHY: Some users prefer manual control, others want automatic protection
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grace_pass_auto_use BOOLEAN DEFAULT true;

-- Create index for refill day queries
-- WHY: Weekly cron job needs to efficiently find users who need refills
CREATE INDEX IF NOT EXISTS idx_profiles_grace_pass_refill 
  ON profiles(grace_pass_refill_day, is_premium);

-- Add constraint to ensure refill day is valid
-- WHY: Prevents invalid day values from being inserted
ALTER TABLE profiles ADD CONSTRAINT valid_grace_pass_refill_day 
  CHECK (grace_pass_refill_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));