-- Enable RLS
alter table auth.users enable row level security;

-- PROFILES
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  is_verified boolean default false,
  stripe_account_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- VIDEOS
create table videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  cloudflare_id text not null,
  title text,
  description text,
  status text default 'processing' check (status in ('processing', 'published', 'draft')),
  price_type text default 'free' check (price_type in ('free', 'ppv', 'sub_only')),
  price_amount integer default 0, -- in cents
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table videos enable row level security;

create policy "Videos are viewable by everyone if published."
  on videos for select
  using ( status = 'published' );

create policy "Users can insert their own videos."
  on videos for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own videos."
  on videos for update
  using ( auth.uid() = user_id );

-- SUBSCRIPTIONS
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  subscriber_id uuid references profiles(id) not null,
  creator_id uuid references profiles(id) not null,
  status text check (status in ('active', 'canceled', 'past_due')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(subscriber_id, creator_id)
);

alter table subscriptions enable row level security;

create policy "Users can see their own subscriptions."
  on subscriptions for select
  using ( auth.uid() = subscriber_id );

-- EARNINGS (Transactions)
create table earnings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  amount integer not null, -- in cents
  source_type text check (source_type in ('tip', 'subscription', 'ppv')),
  source_id text, -- generic reference
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table earnings enable row level security;

create policy "Users can see their own earnings."
  on earnings for select
  using ( auth.uid() = user_id );

-- TRIGGERS
-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
