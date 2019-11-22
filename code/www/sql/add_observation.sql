INSERT INTO observations (
                             id,
                             timestamp_ms,
                             mood_id,
                             timeslot,
                             location_lat,
                             location_lon,
                             location_code,
                             track_percent,
                             num_repeats,
                             mood_suitable,
                             track
                         )
                         VALUES (
                             ?1,
                             ?2,
                             ?3,
                             ?4,
                             ?5,
                             ?6,
                             ?7,
                             ?8,
                             ?9,
                             ?10,
                             ?11
                         );
