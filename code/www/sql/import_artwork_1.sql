UPDATE image_cache
SET 
    [web_uri]=?1,
    [base64_image]=?2
WHERE
    [web_uri]=?1; 