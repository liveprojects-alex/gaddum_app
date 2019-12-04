INSERT INTO 
    image_cache (
    [web_uri],
    [base64_image]
    )
SELECT       
    ?1,
    ?2
WHERE (Select Changes() = 0);