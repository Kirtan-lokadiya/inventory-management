create or replace function get_monthly_sales()
returns table (
  month text,
  total_sales numeric
) language sql as $$
  select 
    to_char(b.created_at, 'YYYY-MM') as month,
    sum(b.total_amount) as total_sales
  from bills b
  group by to_char(b.created_at, 'YYYY-MM')
  order by month desc
  limit 12;
$$; 