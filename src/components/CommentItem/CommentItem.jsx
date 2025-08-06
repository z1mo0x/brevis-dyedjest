import styles from './CommentItem.module.css';

export default function CommentItem({ text }) {
    return (
        <div className={styles.comment}>
            {text}
        </div>
    )
}
