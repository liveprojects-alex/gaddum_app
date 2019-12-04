UPDATE settings
SET 
    value=null
WHERE
    id=?1;
INSERT INTO 
    settings (
    id,
    [value],
    value_type
    )
SELECT   
    ?1,
    null,
    ?2
WHERE (Select Changes() = 0);
