UPDATE music_provider_settings
SET 
    [value]=?3
WHERE
    [provider]=?1 AND
    [id]=?2
