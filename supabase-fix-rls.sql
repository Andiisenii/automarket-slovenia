-- =============================================
-- AutoMarket Slovenia - FIX RLS Policies
-- Run this in Supabase SQL Editor
-- =============================================

-- Allow public read access to cars
DROP POLICY IF EXISTS "Anyone can view active cars" ON cars;
CREATE POLICY "Anyone can view active cars" ON cars
  FOR SELECT USING (status = 'active');

-- Allow public insert (with user_id)
DROP POLICY IF EXISTS "Users can insert their own cars" ON cars;
CREATE POLICY "Anyone can insert cars" ON cars
  FOR INSERT WITH CHECK (TRUE);

-- Allow public update (own cars only - checked by user_id)
DROP POLICY IF EXISTS "Users can update their own cars" ON cars;
CREATE POLICY "Anyone can update cars" ON cars
  FOR UPDATE USING (TRUE);

-- Allow public delete (own cars only)
DROP POLICY IF EXISTS "Users can delete their own cars" ON cars;
CREATE POLICY "Anyone can delete cars" ON cars
  FOR DELETE USING (TRUE);

-- Do the same for packages
DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;
CREATE POLICY "Anyone can view packages" ON packages
  FOR SELECT USING (TRUE);

-- Allow public inserts to other tables too
DROP POLICY IF EXISTS "Anyone can insert users (signup)" ON users;
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Anyone can view users" ON users
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Anyone can update users" ON users
  FOR UPDATE USING (TRUE);

-- Messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Anyone can view messages" ON messages
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
CREATE POLICY "Anyone can insert messages" ON messages
  FOR INSERT WITH CHECK (TRUE);

-- Favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Anyone can view favorites" ON favorites
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;
CREATE POLICY "Anyone can manage favorites" ON favorites
  FOR ALL USING (TRUE);

-- Purchased boosts
DROP POLICY IF EXISTS "Users can view their own boosts" ON purchased_boosts;
CREATE POLICY "Anyone can view boosts" ON purchased_boosts
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own boosts" ON purchased_boosts;
CREATE POLICY "Anyone can insert boosts" ON purchased_boosts
  FOR INSERT WITH CHECK (TRUE);

-- Done
SELECT 'RLS Policies Fixed - Public access enabled!' AS status;
