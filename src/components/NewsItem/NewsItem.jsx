import styles from './NewsItem.module.css'

export default function NewsItem({ id, title, description, user, type, created_at }) {

    let newDate = created_at.split('T')[0]
    let newTime = created_at.split('T')[1].slice(0, 8)

    return (
        <div className={styles.item}>
            <div className={styles.item__user}>Андрей</div>
            <div className={styles.item__type}>
                {title + ' #' + id}
            </div>
            <div className={styles.item__descr}>{description}</div>
            <div className={styles.item__date}> {newDate + ' ' + newTime}</div>
        </div>
    )
}
