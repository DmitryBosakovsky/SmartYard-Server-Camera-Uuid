ALTER TABLE cameras ADD COLUMN IF NOT EXISTS camera_uuid CHARACTER VARYING;
CREATE UNIQUE INDEX IF NOT EXISTS cameras_camera_uuid ON cameras(camera_uuid);