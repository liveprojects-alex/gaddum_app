INSERT INTO 
    settings (
    id,
    [value],
    value_type
    )
SELECT   
    ?1,
    ?2,
    ?3
WHERE (Select Changes() = 0);