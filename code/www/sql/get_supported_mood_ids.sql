SELECT t1.id, t1.name, t2.mood_hot, t2.mood_cool from supported_moods t1 join mood_pairings t2 on t1.id = t2.mood_hot or t1.id = t2.mood_cool;
