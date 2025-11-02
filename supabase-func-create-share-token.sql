-- RPC: create_share_token(public_id TEXT, expires_in_days INTEGER DEFAULT 7, p_token TEXT DEFAULT NULL)
-- Generates a share token for the event identified by public_id.
-- Returns the created token and expiration timestamp.

CREATE OR REPLACE FUNCTION public.create_share_token(
  public_id TEXT,
  expires_in_days INTEGER DEFAULT 7,
  p_token TEXT DEFAULT NULL
)
RETURNS TABLE(token TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_event_id UUID;
  v_token TEXT;
  v_expires TIMESTAMPTZ;
  tries INT := 0;
BEGIN
  IF public_id IS NULL OR length(trim(public_id)) = 0 THEN
    RAISE EXCEPTION 'public_id required';
  END IF;

  SELECT id INTO v_event_id FROM events WHERE events.public_id = public_id LIMIT 1;
  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'event not found for public_id %', public_id;
  END IF;

  IF expires_in_days IS NULL OR expires_in_days <= 0 THEN
    expires_in_days := 7;
  END IF;
  v_expires := now() + make_interval(days => expires_in_days);

  v_token := NULLIF(p_token, '');

  IF v_token IS NULL THEN
    LOOP
      tries := tries + 1;
      v_token := encode(gen_random_bytes(6), 'hex'); -- 12 chars
      BEGIN
        INSERT INTO event_share_tokens (event_id, token, expires_at)
        VALUES (v_event_id, v_token, v_expires);
        EXIT; -- success
      EXCEPTION WHEN unique_violation THEN
        IF tries > 3 THEN
          RAISE;
        END IF;
        v_token := NULL; -- retry
      END;
    END LOOP;
  ELSE
    INSERT INTO event_share_tokens (event_id, token, expires_at)
    VALUES (v_event_id, v_token, v_expires);
  END IF;

  RETURN QUERY SELECT v_token, v_expires;
END;
$$ LANGUAGE plpgsql VOLATILE;

