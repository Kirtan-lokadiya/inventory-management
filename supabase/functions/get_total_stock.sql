create or replace function get_total_stock()
returns numeric language sql as $$
  select coalesce(sum(quantity * rate), 0)
  from parts;
$$; 