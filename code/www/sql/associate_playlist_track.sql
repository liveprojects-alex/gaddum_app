INSERT INTO 
    playlists_to_tracks (
    [id],
    [playlist_id],
    [track_id],
    [order]
    )
SELECT       
    ?1,
    ?2,
    ?3,
    ?4