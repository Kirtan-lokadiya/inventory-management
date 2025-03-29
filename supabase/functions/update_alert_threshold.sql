CREATE OR REPLACE FUNCTION update_alert_threshold(new_threshold INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the threshold in the alerts table
  UPDATE alerts
  SET threshold = new_threshold
  WHERE resolved = false;

  -- Create new alerts for parts with quantity below the new threshold
  INSERT INTO alerts (part_id, current_quantity, threshold, resolved)
  SELECT p.id, p.quantity, new_threshold, false
  FROM parts p
  WHERE p.quantity < new_threshold
  AND NOT EXISTS (
    SELECT 1
    FROM alerts a
    WHERE a.part_id = p.id
    AND a.resolved = false
  );
END;
$$; 