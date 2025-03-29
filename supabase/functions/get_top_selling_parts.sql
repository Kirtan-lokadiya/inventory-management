create or replace function get_top_selling_parts(limit_count int)
returns table (
  name text,
  total_quantity bigint
) language sql as $$
  select 
    p.name,
    sum(bi.quantity) as total_quantity
  from parts p
  join bill_items bi on p.id = bi.part_id
  group by p.id, p.name
  order by total_quantity desc
  limit limit_count;
$$; 