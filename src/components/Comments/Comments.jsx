import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabase"
import CommentItem from "../CommentItem/CommentItem";
import styles from './Comments.module.css';

export default function Comments({ postId }) {

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('')
    const [isSending, setIsSending] = useState(false)
    const itemsRef = useRef(null);

    useEffect(() => {
        getComments()
    }, [])

    async function getComments() {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)

        if (error) {
            console.error('Ошибка получения данных:', error.message);
        } else {
            setComments(data)
        }
    }

    async function sendComment() {
        setIsSending(true)
        const { data, error } = await supabase
            .from("comments")
            .insert([
                { 'post_id': postId, 'text': commentText }
            ])
            .select()

        if (error) {
            console.error('Ошибка получения данных:', error.message);
        }
        // else {
        //     console.log('Комментарий отправлен:' + data);
        // }
        setIsSending(false)
    }

    function openComments() {
        itemsRef.current.classList.toggle(`${styles.active}`)
    }

    return (
        <div className={styles.comments}>
            <div className={styles.comments__title} onClick={openComments}>Комментарии({comments.length})</div>

            <div className={styles.comments__items} ref={itemsRef}>
                {comments.map((comment) => { return <CommentItem key={comment.id} text={comment.text} /> })}
                <div className={styles.comments__form}>
                    <textarea onChange={(e) => {
                        setCommentText(e.target.value);
                    }} placeholder="Ваш комментарий"></textarea>
                    <button disabled={isSending} onClick={sendComment} className={styles.comments__button}>
                        {isSending
                            ?
                            "Отправляю..."
                            :
                            "Отправить комментарий"
                        }

                    </button>
                </div>
            </div>
        </div>
    )
}
