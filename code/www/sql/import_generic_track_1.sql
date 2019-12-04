UPDATE tracks
SET 
    [name]=?1,
    [album]=?2,
    [artist]=?3,
    [duration_ms]=?4
WHERE
    [name]=?1 AND
    [album]=?2 AND
    [artist]=?3 AND
    [duration_ms]=?4;

