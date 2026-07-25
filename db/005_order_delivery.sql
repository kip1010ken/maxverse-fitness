-- Nullable: only required (at the application level) for product orders.
-- Plan purchases have nothing to deliver.
alter table orders add column if not exists recipient_name text;
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists delivery_notes text;
