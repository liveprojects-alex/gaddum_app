SELECT 
t1.name,
t1.album,
t1.artist,
t1.duration_ms,
t2.web_uri,
t2.thumbnail_uri,
t2.player_uri
FROM tracks t1 
JOIN track_references t2 
ON(
t1.name = ?1 and 
t1.album= ?2 and 
t1.artist = ?3 and
t1.duration_ms = ?4
OR 
t1.id = ?5 
)
AND
t1.id = t2.track_id 
AND 
t2.provider_id = ?6; 