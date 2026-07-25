create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price_kes integer not null,
  cadence text not null default 'month',
  intensity smallint not null,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('supplement', 'gym_wear')),
  name text not null,
  price_kes integer not null,
  note text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category, name)
);

-- item_id intentionally has no FK: it points into either plans or products
-- depending on item_type, which a single foreign key can't express.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  item_type text not null check (item_type in ('plan', 'product')),
  item_id uuid not null,
  item_name text not null,
  amount_kes integer not null,
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  mpesa_checkout_request_id text,
  mpesa_receipt_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into plans (slug, name, price_kes, cadence, intensity, features, sort_order) values
  ('foundation', 'Foundation', 4500, 'month', 3,
    '["3x weekly virtual check-ins", "Custom training split", "Form review via video", "WhatsApp support"]', 1),
  ('momentum', 'Momentum', 8500, 'month', 5,
    '["Daily coaching access", "Progressive training program", "Base meal plan included", "Monthly progress review"]', 2),
  ('competition-prep', 'Competition Prep', 12000, 'month', 7,
    '["Daily coaching access", "Full meal plan + macros", "Supplement protocol", "Peak-week guidance"]', 3)
on conflict (slug) do nothing;

insert into products (category, name, price_kes, note, sort_order) values
  ('supplement', 'Whey Isolate', 5500, '900g · Vanilla / Chocolate', 1),
  ('supplement', 'Creatine Monohydrate', 2200, '300g', 2),
  ('supplement', 'Pre-Workout', 3800, '30 servings', 3),
  ('gym_wear', 'Maxverse Training Tee', 1800, 'S–XXL', 1),
  ('gym_wear', 'Compression Shorts', 2400, 'S–XXL', 2),
  ('gym_wear', 'Lifting Belt', 4200, 'One size, adjustable', 3)
on conflict (category, name) do nothing;
