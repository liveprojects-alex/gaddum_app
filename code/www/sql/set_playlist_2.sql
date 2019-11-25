INSERT INTO 
    playlists (
    id,
    [name]
    )
SELECT   
    ?1,
    ?2
WHERE (Select Changes() = 0);
