INSERT INTO 
    tracks (
    [id],
    [name],
    [album],
    [artist],
    [duration_ms]
    )
SELECT  
    ?1,     
    ?2,
    ?3,
    ?4,
    ?5
WHERE (Select Changes() = 0);