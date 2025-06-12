import styles from './NewsItem.module.css'
import iconLike from '../../assets/heart.svg'
import iconLikeActive from '../../assets/hearts_active.svg'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function NewsItem({ id, title, description, user, type, created_at, likes }) {

    let newDate = created_at.split('T')[0]
    let newTime = created_at.split('T')[1].slice(0, 8)

    const [likeActive, setLikeActive] = useState(false)
    const [likesCount, setLikesCount] = useState(likes)

    useEffect(() => {
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
        if (likedPosts.includes(id)) {
            setLikeActive(true)
        }
    }, [id])

    async function likePost() {
        if (likeActive) {
            await dislikePost();
            return; // прерываем, чтобы не ставить лайк снова
        }

        const newLikes = likesCount + 1;

        // Получаем текущие лайкнутые посты
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');

        // Добавляем id, если его там нет (на всякий случай)
        if (!likedPosts.includes(id)) {
            likedPosts.push(id);
        }

        // Сохраняем в localStorage и ставим состояние
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        setLikeActive(true);

        // Обновляем лайки на сервере
        const { data, error } = await supabase
            .from('news')
            .update({ likes: newLikes })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Ошибка обновления лайков:', error.message);
            // Откатываем изменения в localStorage и состоянии
            const revertedLikedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]').filter(postId => postId !== id);
            localStorage.setItem('likedPosts', JSON.stringify(revertedLikedPosts));
            setLikeActive(false);
        } else {
            setLikesCount(data.likes);
        }
    }

    async function dislikePost() {
        const newLikes = likesCount - 1;

        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        const updatedLikedPosts = likedPosts.filter(postId => postId !== id);

        localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
        setLikeActive(false);

        const { data, error } = await supabase
            .from('news')
            .update({ likes: newLikes })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Ошибка обновления лайков:', error.message);
            // Откатываем изменения localStorage и состояние лайка
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            setLikeActive(true);
        } else {
            setLikesCount(data.likes);
        }
    }

    return (
        <div className={styles.item}>
            <div className={styles.item__user}>{user || 'Неизвестный'}</div>
            <div className={styles.item__type}>
                {title + ' #' + id}
            </div>
            <div className={styles.item__descr}>{description}</div>
            <div className={styles.item__like} onClick={likePost}>
                <img src={likeActive ? iconLikeActive : iconLike} alt="like" />
                {likesCount}
            </div>
            <div className={styles.item__date}> {newTime + ' ' + newDate}</div>
        </div>
    )
}
