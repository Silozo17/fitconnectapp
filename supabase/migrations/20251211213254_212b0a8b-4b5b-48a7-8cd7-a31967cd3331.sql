-- Create role enum
create type public.app_role as enum ('client', 'coach', 'admin');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS policies for user_roles
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

-- Create client_profiles table
create table public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  first_name text,
  last_name text,
  age integer,
  gender_pronouns text,
  height_cm numeric,
  weight_kg numeric,
  body_measurements jsonb default '{}'::jsonb,
  fitness_goals text[] default '{}',
  dietary_restrictions text[] default '{}',
  allergies text[] default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on client_profiles
alter table public.client_profiles enable row level security;

-- RLS policies for client_profiles
create policy "Users can view their own client profile"
on public.client_profiles for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own client profile"
on public.client_profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own client profile"
on public.client_profiles for update
to authenticated
using (auth.uid() = user_id);

-- Create coach_profiles table
create table public.coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  bio text,
  coach_types text[] default '{}',
  certifications jsonb default '[]'::jsonb,
  experience_years integer,
  hourly_rate numeric,
  location text,
  online_available boolean default true,
  in_person_available boolean default false,
  profile_image_url text,
  subscription_tier text default 'free',
  onboarding_completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on coach_profiles
alter table public.coach_profiles enable row level security;

-- RLS policies for coach_profiles
create policy "Anyone can view coach profiles"
on public.coach_profiles for select
to authenticated
using (true);

create policy "Coaches can insert their own profile"
on public.coach_profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Coaches can update their own profile"
on public.coach_profiles for update
to authenticated
using (auth.uid() = user_id);

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_client_profiles_updated_at
before update on public.client_profiles
for each row execute function public.update_updated_at_column();

create trigger update_coach_profiles_updated_at
before update on public.coach_profiles
for each row execute function public.update_updated_at_column();