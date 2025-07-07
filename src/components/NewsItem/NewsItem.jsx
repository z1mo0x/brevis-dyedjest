import styles from './NewsItem.module.css'
import iconLike from '../../assets/heart.svg'
import iconLikeActive from '../../assets/hearts_active.svg'
import { useEffect, useState } from 'react'
import { likePost } from '../../scripts/likes'

export default function NewsItem({ className, id, title, description, image, user, type, created_at, likes }) {

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

    return (
        <div className={`${styles.item} ${className}`}>
            <div className={styles.item__user}>{user}</div>
            <div className={styles.item__type}>
                {title + ' #' + id}
            </div>
            <div className={styles.item__wrap}>
                <div className={styles.item__image}>
                    {image && <img src={image} className={styles.newsImage} />}
                    {console.log(image)}
                </div>
                <div className={styles.item__descr}>{description}</div>
            </div>
            <div className={styles.item__like}
                onClick={() => likePost({ id, likesCount, setLikesCount, likeActive, setLikeActive })}
            >
                <img src={likeActive ? iconLikeActive : iconLike} alt="like" />
                {likesCount}
            </div>
            <div className={styles.item__date}> {newTime + ' ' + newDate}</div>
        </div>
    )
}
