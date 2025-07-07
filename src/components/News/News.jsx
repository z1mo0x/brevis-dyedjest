import React, { useEffect, useState, useRef } from 'react';
import styles from './News.module.css'
import NewsItem from '../NewsItem/NewsItem';
import { supabase } from '../../supabase'
import { NavLink } from 'react-router-dom';
import Loader from '../Loader/Loader';
import memas from '../../assets/memas.webp'

export default function News() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortType, setSortType] = useState('0');
    const listRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!listRef.current) return;

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.animate);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: .3 }
        );

        const elements = listRef.current.querySelectorAll(`.${styles.animateOnScroll}`);
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [data, sortType]);

    function getWeekRange(date) {
        const day = date.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        const monday = new Date(date);
        monday.setDate(date.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { start: monday, end: sunday };
    }

    const fetchData = async () => {
        setLoading(true);
        const { start, end } = getWeekRange(new Date());
        const { data: fetchedData, error } = await supabase
            .from('news')
            .select()
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Ошибка получения данных:', error.message);
        } else {
            setData(fetchedData || []);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setSortType(e.target.value);
    };

    const mostLiked = data.length > 0 ? [...data].sort((a, b) => b.likes - a.likes)[0] : null;

    let displayedData;

    if (sortType === 'likes') {
        displayedData = [...data].sort((a, b) => b.likes - a.likes);
    } else if (sortType === 'date') {
        displayedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
        displayedData = mostLiked ? data.filter(obj => obj.id !== mostLiked.id) : data;
    }

    if (loading) return <Loader />;

    if (data.length === 0) {
        return (
            <>
                <div className={styles.news}>
                    <h1>Дайджест недели</h1>
                    <div className={styles.news__empty}>
                        <div>
                            Постов нет, стань первым на этой неделе!
                            <NavLink to="/create" className={styles.button__add}>Стать первым</NavLink>
                        </div>
                        <img src={memas} alt="" />
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className={styles.news}>
            <h1>Дайджест недели</h1>
            <NavLink to="/create" className={styles.button__add}>Добавить новость</NavLink>

            <select className={styles.button__filter} defaultValue="0" onChange={handleFilterChange}>
                <option value="0">Сортировать по:</option>
                <option value="likes">Популярнее</option>
                <option value="date">Новее</option>
            </select>

            {mostLiked && (
                <div className={styles.popular}>
                    <h2 className={styles.popular__title}>Самый популярный пост принадлежит <span>{mostLiked.user}</span></h2>
                    <NewsItem
                        className={styles.popular__item}
                        key={mostLiked.id}
                        id={mostLiked.id}
                        likes={mostLiked.likes}
                        title={mostLiked.title}
                        type={mostLiked.type}
                        description={mostLiked.description}
                        image={mostLiked.imageUrl}
                        user={mostLiked.user}
                        created_at={mostLiked.created_at}
                    />
                </div>
            )}

            <ul ref={listRef} className={styles.news__list}>
                {displayedData.map((item) => (
                    <NewsItem
                        className={styles.animateOnScroll}
                        key={item.id}
                        id={item.id}
                        likes={item.likes}
                        title={item.title}
                        type={item.type}
                        description={item.description}
                        image={item.imageUrl}
                        user={item.user}
                        created_at={item.created_at}
                    />
                ))}
            </ul>
        </div>
    );
}
