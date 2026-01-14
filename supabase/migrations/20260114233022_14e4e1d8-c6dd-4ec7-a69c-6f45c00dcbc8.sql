
-- Phase 1: Security & Database Fixes - Using ALTER to set search_path
-- This avoids dropping functions with dependencies

-- Fix is_gym_member search_path
ALTER FUNCTION public.is_gym_member(uuid, uuid) SET search_path = public;

-- Fix is_gym_owner search_path
ALTER FUNCTION public.is_gym_owner(uuid, uuid) SET search_path = public;

-- Fix is_gym_staff search_path
ALTER FUNCTION public.is_gym_staff(uuid, uuid, gym_role[]) SET search_path = public;
