-- priority search of behaviour observations
-- most important:  
-- mood, location and timeslot coincide on tracks which are suitable for mood. 
-- then: mood, location and suitability
-- then: mood, timeslot and suitability
-- then: mood and suitability
-- then: mood and unsuitable
-- joins with generic tracks so we get comprehensive output

-- ?1 mood_id,
-- ?2 timeslot_id,
-- ?3 postcode_id,
-- ?4 lat,
-- ?5 lon,
-- ?6 limit_m_l_t_s,
-- ?7 limit_m_t_s,
-- ?8 limit_m_l_s,
-- ?9 limit_m_s,
-- ?10 limit_t_s,
-- ?11 limit_m_u_s

with 
priorities as (
WITH T(priority) AS (
VALUES (1),(2),(3),(4),(5),(6)
)
SELECT * FROM T
), 
m_l_t_s as
(
select 
t1.*
,t2.priority
,(
(?4 - t1.location_lat) * (?4 - t1.location_lat) 
+
(?5 - t1.location_lon) * (?5 - t1.location_lon)) 
as dist
from observations t1 join priorities t2 on
t2.priority = 1 
AND 
t1.mood_id = ?1 
AND t1.mood_suitable = 'true'
AND t1.timeslot = ?2
AND t1.location_code = ?3 -- filter first on postcode
ORDER BY  
dist ASC, -- ordering by something related to distance from specified location -- closest first
t1.timestamp_ms DESC -- oldest first
LIMIT ?6
),
m_l_s as
(
select t1.*,t2.priority
,(
(?4 - t1.location_lat) * (?4 - t1.location_lat) 
+
(?5 - t1.location_lon) * (?5 - t1.location_lon)) 
as dist 
from observations t1 join priorities t2 on 
t2.priority = 2 
AND t1.mood_id = ?1 
AND t1.mood_suitable = 'true'
AND NOT t1.timeslot = ?2
AND t1.location_code = ?3 -- filter first on postcode
ORDER BY -- ordering by something related to distance from specified location - closest first
dist ASC, t1.timestamp_ms ASC -- favour oldest first
LIMIT ?8
)
,
m_t_s as
(
select t1.*,t2.priority from observations t1 join priorities t2 on 
t2.priority = 3 
AND t1.mood_id = ?1 
AND t1.mood_suitable = 'true'
AND t1.timeslot = ?2
AND NOT t1.location_code = ?3 
ORDER BY t1.timestamp_ms ASC -- favour oldest first
LIMIT ?7
)
,
m_s as
(
select t1.*,t2.priority from observations t1 join priorities t2 on 
t2.priority = 4 
AND t1.mood_id = ?1 
AND t1.mood_suitable = 'true'
AND NOT t1.timeslot = ?2 
AND NOT t1.location_code = ?3
ORDER BY t1.timestamp_ms ASC -- favour_oldest first
LIMIT ?9
)
,
t_s as
(
select 
t1.*
,t2.priority
from observations t1 join priorities t2 on
t2.priority = 5 
AND t1.mood_suitable = 'true'
AND t1.timeslot = ?2
ORDER BY t1.timestamp_ms -- favour oldest first
LIMIT ?10
),
m_u_s as
(
select t1.*,t2.priority from observations t1 join priorities t2 on 
t2.priority = 6 
AND t1.mood_id = ?1 
AND t1.mood_suitable = 'false'
AND NOT t1.timeslot = ?2 
AND NOT t1.location_code = ?3
ORDER BY t1.timestamp_ms ASC -- favour_oldest first
LIMIT ?11
)
,
collation as
(
select t1.timestamp_ms, t1.mood_id, t1.timeslot, t1.location_lat, t1.location_lon, t1.location_code, t1.track_percent, t1.num_repeats, t1.mood_suitable, t1.track, t1.priority from m_l_t_s t1
UNION ALL
select t1.timestamp_ms, t1.mood_id, t1.timeslot, t1.location_lat, t1.location_lon, t1.location_code, t1.track_percent, t1.num_repeats, t1.mood_suitable, t1.track, t1.priority  from m_l_s t1
UNION ALL
select t1.timestamp_ms, t1.mood_id, t1.timeslot, t1.location_lat, t1.location_lon, t1.location_code, t1.track_percent, t1.num_repeats, t1.mood_suitable, t1.track, t1.priority  from m_t_s t1
UNION ALL
select t1.timestamp_ms, t1.mood_id, t1.timeslot, t1.location_lat, t1.location_lon, t1.location_code, t1.track_percent, t1.num_repeats, t1.mood_suitable, t1.track, t1.priority  from m_s t1
UNION ALL
select t1.timestamp_ms, t1.mood_id, t1.timeslot, t1.location_lat, t1.location_lon, t1.location_code, t1.track_percent, t1.num_repeats, t1.mood_suitable, t1.track, t1.priority  from t_s t1
UNION ALL
select t1.timestamp_ms, t1.mood_id, t1.timeslot, t1.location_lat, t1.location_lon, t1.location_code, t1.track_percent, t1.num_repeats, t1.mood_suitable, t1.track, t1.priority  from m_u_s t1
)
select * from collation;




