SELECT * FROM track_references t1 
WHERE  
t1.track_id = ?3 and
t1.provider_id = ?2
or 
t1.id = ?1;
