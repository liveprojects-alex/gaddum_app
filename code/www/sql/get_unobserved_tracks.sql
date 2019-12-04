with track_observations as (
select distinct t1.*, t2.mood_id
from tracks t1
left outer join
observations t2 on
t1.id = t2.track 
)
select t1.* from tracks t1 inner join track_observations t2 on t1.id = t2.id and t2.mood_id is null 
order by random()
limit ?1; 