-- Every Daraja callback does a lookup by this column; without an index it's
-- a full table scan once orders grow past a trivial size.
create index if not exists idx_orders_checkout_request_id on orders (mpesa_checkout_request_id);

-- Rate-limit check in orders-initiate filters by user_id + created_at.
create index if not exists idx_orders_user_created on orders (user_id, created_at);

-- Admin dashboard and Progress page both sort by created_at desc.
create index if not exists idx_contact_messages_created_at on contact_messages (created_at desc);
create index if not exists idx_progress_entries_created_at on progress_entries (created_at desc);
