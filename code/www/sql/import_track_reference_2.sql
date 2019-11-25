INSERT INTO 
    track_references (
    [id],
    [web_uri],
    [player_uri],
    [thumbnail_uri],
    [track_id],
    [provider_id]
    )
SELECT  
    ?1,     
    ?2,
    ?3,
    ?4,
    ?5,
    ?6
WHERE (Select Changes() = 0);