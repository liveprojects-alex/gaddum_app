UPDATE music_provider_settings
SET 
    [value]=null
WHERE
    [provider]=?1 AND
    [id]=?2