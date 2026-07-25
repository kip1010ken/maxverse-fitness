create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_kes integer not null,
  description text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into meal_plans (name, price_kes, description, sort_order) values
  ('Lean Cut', 3500, 'Calorie-deficit meal plan built around Nairobi grocery staples, structured for fat loss without muscle loss.', 1),
  ('Lean Bulk', 3500, 'Surplus meal plan for steady muscle gain, macro-balanced and shopping-list ready.', 2),
  ('Competition Peak', 6000, 'Precision macro and water-manipulation plan for the final weeks before a show, paired with Competition Prep coaching.', 3)
on conflict (name) do nothing;
