import styles from './Loader.module.css'

export default function Loader() {
    return (
        <div className={styles.card}>
            <div className={styles.loader}>
                <p>Загрузка</p>
                <div className={styles.words}>
                    <span className={styles.word}>Новостей</span>
                    <span className={styles.word}>Пользователей</span>
                    <span className={styles.word}>Лайков</span>
                    <span className={styles.word}>Текста</span>
                    <span className={styles.word}>Кнопок</span>
                    <span className={styles.word}>Фраз</span>
                    <span className={styles.word}>Стилей</span>
                </div>
            </div>
        </div>

    )
}
