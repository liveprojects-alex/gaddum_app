UPDATE track_references
SET 
    [web_uri]=?1,
    [player_uri]=?2,
    [thumbnail_uri]=?3
WHERE
    [track_id] = ?4 AND
    [provider_id] = ?5;
