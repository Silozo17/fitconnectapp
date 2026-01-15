-- Phase 1.2: Apply proper RLS policies using the new helper functions

-- GYM_MEMBERS policies
DROP POLICY IF EXISTS "Gym staff can manage members" ON public.gym_members;
DROP POLICY IF EXISTS "Members can view their own data" ON public.gym_members;
DROP POLICY IF EXISTS "Gym staff can insert members" ON public.gym_members;
DROP POLICY IF EXISTS "Gym staff can update members" ON public.gym_members;
DROP POLICY IF EXISTS "Gym staff can delete members" ON public.gym_members;
DROP POLICY IF EXISTS "Gym staff can view members" ON public.gym_members;

CREATE POLICY "Gym staff can view members"
ON public.gym_members FOR SELECT
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id) OR user_id = auth.uid()
);

CREATE POLICY "Gym staff can insert members"
ON public.gym_members FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can update members"
ON public.gym_members FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id) OR user_id = auth.uid()
);

CREATE POLICY "Gym staff can delete members"
ON public.gym_members FOR DELETE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

-- GYM_MEMBERSHIPS policies
DROP POLICY IF EXISTS "Gym staff can manage memberships" ON public.gym_memberships;
DROP POLICY IF EXISTS "Anyone can view memberships" ON public.gym_memberships;
DROP POLICY IF EXISTS "Gym staff can insert memberships" ON public.gym_memberships;
DROP POLICY IF EXISTS "Gym staff can update memberships" ON public.gym_memberships;
DROP POLICY IF EXISTS "Anyone can view gym memberships" ON public.gym_memberships;
DROP POLICY IF EXISTS "Gym staff can delete memberships" ON public.gym_memberships;

CREATE POLICY "Anyone can view gym memberships"
ON public.gym_memberships FOR SELECT
USING (true);

CREATE POLICY "Gym staff can insert memberships"
ON public.gym_memberships FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can update memberships"
ON public.gym_memberships FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can delete memberships"
ON public.gym_memberships FOR DELETE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

-- GYM_CLASSES policies
DROP POLICY IF EXISTS "Anyone can view gym classes" ON public.gym_classes;
DROP POLICY IF EXISTS "Gym staff can manage classes" ON public.gym_classes;
DROP POLICY IF EXISTS "Gym staff can insert classes" ON public.gym_classes;
DROP POLICY IF EXISTS "Gym staff can update classes" ON public.gym_classes;
DROP POLICY IF EXISTS "Gym staff can delete classes" ON public.gym_classes;

CREATE POLICY "Anyone can view gym classes"
ON public.gym_classes FOR SELECT
USING (true);

CREATE POLICY "Gym staff can insert classes"
ON public.gym_classes FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can update classes"
ON public.gym_classes FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can delete classes"
ON public.gym_classes FOR DELETE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

-- GYM_STAFF policies
DROP POLICY IF EXISTS "Gym staff can view staff" ON public.gym_staff;
DROP POLICY IF EXISTS "Gym owner can manage staff" ON public.gym_staff;
DROP POLICY IF EXISTS "Staff can view their own record" ON public.gym_staff;
DROP POLICY IF EXISTS "View gym staff" ON public.gym_staff;
DROP POLICY IF EXISTS "Insert gym staff" ON public.gym_staff;
DROP POLICY IF EXISTS "Update gym staff" ON public.gym_staff;
DROP POLICY IF EXISTS "Delete gym staff" ON public.gym_staff;

CREATE POLICY "View gym staff"
ON public.gym_staff FOR SELECT
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id) OR user_id = auth.uid()
);

CREATE POLICY "Insert gym staff"
ON public.gym_staff FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_owner(gym_id)
);

CREATE POLICY "Update gym staff"
ON public.gym_staff FOR UPDATE
TO authenticated
USING (
  public.is_gym_owner(gym_id) OR user_id = auth.uid()
);

CREATE POLICY "Delete gym staff"
ON public.gym_staff FOR DELETE
TO authenticated
USING (
  public.is_gym_owner(gym_id)
);

-- GYM_LOCATIONS policies
DROP POLICY IF EXISTS "Anyone can view locations" ON public.gym_locations;
DROP POLICY IF EXISTS "Gym staff can manage locations" ON public.gym_locations;
DROP POLICY IF EXISTS "Anyone can view gym locations" ON public.gym_locations;
DROP POLICY IF EXISTS "Gym staff can insert locations" ON public.gym_locations;
DROP POLICY IF EXISTS "Gym staff can update locations" ON public.gym_locations;
DROP POLICY IF EXISTS "Gym staff can delete locations" ON public.gym_locations;

CREATE POLICY "Anyone can view gym locations"
ON public.gym_locations FOR SELECT
USING (true);

CREATE POLICY "Gym staff can insert locations"
ON public.gym_locations FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can update locations"
ON public.gym_locations FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can delete locations"
ON public.gym_locations FOR DELETE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

-- GYM_PAYMENTS policies
DROP POLICY IF EXISTS "Gym staff can view payments" ON public.gym_payments;
DROP POLICY IF EXISTS "Members can view their payments" ON public.gym_payments;
DROP POLICY IF EXISTS "Gym staff can manage payments" ON public.gym_payments;
DROP POLICY IF EXISTS "View payments" ON public.gym_payments;
DROP POLICY IF EXISTS "Insert payments" ON public.gym_payments;
DROP POLICY IF EXISTS "Update payments" ON public.gym_payments;

CREATE POLICY "View payments"
ON public.gym_payments FOR SELECT
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id) OR
  EXISTS (
    SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Insert payments"
ON public.gym_payments FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Update payments"
ON public.gym_payments FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

-- GYM_CHECK_INS policies
DROP POLICY IF EXISTS "Gym staff can manage check-ins" ON public.gym_check_ins;
DROP POLICY IF EXISTS "Members can view their check-ins" ON public.gym_check_ins;
DROP POLICY IF EXISTS "View check-ins" ON public.gym_check_ins;
DROP POLICY IF EXISTS "Insert check-ins" ON public.gym_check_ins;
DROP POLICY IF EXISTS "Update check-ins" ON public.gym_check_ins;

CREATE POLICY "View check-ins"
ON public.gym_check_ins FOR SELECT
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id) OR
  EXISTS (
    SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Insert check-ins"
ON public.gym_check_ins FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id) OR
  EXISTS (
    SELECT 1 FROM public.gym_members gm WHERE gm.id = member_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Update check-ins"
ON public.gym_check_ins FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

-- GYM_LEADS policies
DROP POLICY IF EXISTS "Gym staff can view leads" ON public.gym_leads;
DROP POLICY IF EXISTS "Gym staff can manage leads" ON public.gym_leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.gym_leads;
DROP POLICY IF EXISTS "View gym leads" ON public.gym_leads;
DROP POLICY IF EXISTS "Insert gym leads" ON public.gym_leads;
DROP POLICY IF EXISTS "Update gym leads" ON public.gym_leads;
DROP POLICY IF EXISTS "Delete gym leads" ON public.gym_leads;

CREATE POLICY "View gym leads"
ON public.gym_leads FOR SELECT
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Insert gym leads"
ON public.gym_leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Update gym leads"
ON public.gym_leads FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Delete gym leads"
ON public.gym_leads FOR DELETE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

-- GYM_CONTRACT_TEMPLATES policies
DROP POLICY IF EXISTS "Anyone can view contracts" ON public.gym_contract_templates;
DROP POLICY IF EXISTS "Gym staff can manage contracts" ON public.gym_contract_templates;
DROP POLICY IF EXISTS "Anyone can view gym contracts" ON public.gym_contract_templates;
DROP POLICY IF EXISTS "Gym staff can insert contracts" ON public.gym_contract_templates;
DROP POLICY IF EXISTS "Gym staff can update contracts" ON public.gym_contract_templates;
DROP POLICY IF EXISTS "Gym staff can delete contracts" ON public.gym_contract_templates;

CREATE POLICY "Anyone can view gym contracts"
ON public.gym_contract_templates FOR SELECT
USING (true);

CREATE POLICY "Gym staff can insert contracts"
ON public.gym_contract_templates FOR INSERT
TO authenticated
WITH CHECK (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can update contracts"
ON public.gym_contract_templates FOR UPDATE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);

CREATE POLICY "Gym staff can delete contracts"
ON public.gym_contract_templates FOR DELETE
TO authenticated
USING (
  public.is_gym_staff(gym_id) OR public.is_gym_owner(gym_id)
);