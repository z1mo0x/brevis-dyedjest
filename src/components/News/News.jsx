import React, { useEffect, useState, useRef } from 'react';
import styles from './News.module.css'
import NewsItem from '../NewsItem/NewsItem';
import { supabase } from '../../supabase'
import { NavLink } from 'react-router-dom';
import Loader from '../Loader/Loader';

export default function News() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortedByLikes, setSortedByLikes] = useState(false);
    const listRef = useRef(null); // === 2 ===

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!listRef.current) return;

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.animate); // === 3 === добавляем класс анимации
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: .3 }
        );

        const elements = listRef.current.querySelectorAll(`.${styles.animateOnScroll}`); // === 4 === ищем элементы с классом для анимации
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [data, sortedByLikes]);


    function getWeekRange(date) {
        const day = date.getDay(); // 0 (вс), 1 (пн), ..., 6 (сб)
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
        const { data, error } = await supabase
            .from('news')
            .select()
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .order('created_at', { ascending: false }); // по дате по умолчанию

        if (error) {
            console.error('Ошибка получения данных:', error.message);
        } else {
            setData(data);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        const value = e.target.value;
        if (value === 'likes') {
            setSortedByLikes(true);
        } else {
            setSortedByLikes(false);
        }
    };

    const mostLiked = [...data].sort((a, b) => b.likes - a.likes)[0];

    const displayedData = sortedByLikes ? [...data].sort((a, b) => b.likes - a.likes) : data.filter(obj => obj.id !== mostLiked.id);


    if (loading) return <Loader />;

    return (
        <div className={styles.news}>
            <h1>Дайджест недели</h1>
            <NavLink to="/create" className={styles.button__add}>Добавить новость</NavLink>

            <select className={styles.button__filter} defaultChecked={'0'} onChange={handleFilterChange}>
                <option value="0">Сортировать по:</option>
                <option value="likes">Популярнее</option>
                <option value="date">Новее</option>
            </select>

            <div className={styles.popular}>
                <h2 className={styles.popular__title}>Самый популярный пост принадлежит <span>{mostLiked.user}</span></h2>
                <NewsItem className={styles.popular__item} key={mostLiked.id} id={mostLiked.id} likes={mostLiked.likes} title={mostLiked.title} type={mostLiked.type} description={mostLiked.description} user={mostLiked.user} created_at={mostLiked.created_at} />
            </div>

            <ul ref={listRef} className={styles.news__list}>
                {displayedData.map((item) => (
                    <NewsItem className={styles.animateOnScroll} key={item.id} id={item.id} likes={item.likes} title={item.title} type={item.type} description={item.description} user={item.user} created_at={item.created_at} />
                ))}
            </ul>
        </div>
    );
}
