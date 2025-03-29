create or replace function get_total_sales()
returns numeric language sql as $$
  select coalesce(sum(total_amount), 0)
  from bills;
$$; 