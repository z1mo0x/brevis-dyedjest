import React, { useEffect, useState } from 'react';
import styles from './News.module.css'
import NewsItem from '../NewsItem/NewsItem';
import { supabase } from '../../supabase'
import { Link } from 'react-router-dom';

export default function News() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data, error } = await supabase
            .from('news')
            .select()
            .order('type', { ascending: true })


        if (error) {
            console.error('Ошибка получения данных:', error.message);
        } else {
            setData(data);
        }
        setLoading(false);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.news}>
            <h1>Дайджест недели</h1>
            <NavLink to="/create" className={styles.button__add}>Добавить новость</NavLink>
            <ul className={styles.news__list}>
                {data.map((item) => (
                    <NewsItem key={item.id} id={item.id} title={item.title} type={item.type} description={item.description} user={item.user} created_at={item.created_at} />
                ))}
            </ul>
        </div>
    );
}
