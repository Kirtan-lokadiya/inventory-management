CREATE OR REPLACE FUNCTION update_part_quantity(part_id UUID, quantity_change INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_quantity INTEGER;
  current_threshold INTEGER;
BEGIN
  -- Get the current threshold from the most recent alert
  SELECT threshold INTO current_threshold
  FROM alerts
  WHERE resolved = false
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no threshold is set, use a default value of 5
  IF current_threshold IS NULL THEN
    current_threshold := 5;
  END IF;

  -- Update the part quantity
  UPDATE parts
  SET quantity = quantity + quantity_change
  WHERE id = part_id
  RETURNING quantity INTO new_quantity;

  -- Create an alert if the new quantity is below the threshold
  IF new_quantity < current_threshold THEN
    INSERT INTO alerts (part_id, current_quantity, threshold, resolved)
    VALUES (part_id, new_quantity, current_threshold, false);
  END IF;
END;
$$; 