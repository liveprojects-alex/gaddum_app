SELECT * FROM tracks t1 
WHERE  
t1.name = ?1 and 
t1.album = ?2 and 
t1.artist = ?3 and
t1.duration_ms = ?4
or 
t1.id = ?5 ;