import React, { useEffect, useState } from 'react'
import styles from './Form.module.css'
import { supabase } from '../../supabase'
import { NavLink } from 'react-router-dom';
import Loader from '../Loader/Loader';

export default function Form() {

    const [formTypes, setFormTypes] = useState([]);
    const [loading, setLoading] = useState(false)

    const [descr, setDescr] = useState('')
    const [type, setType] = useState('')
    const [user, setUser] = useState('')
    const [typeTitle, setTypeTitle] = useState('')
    const [validation, setValidation] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('types')
            .select()

        if (error) {
            console.error('Ошибка получения данных:', error.message);
        } else {
            setFormTypes(data);
        }
        setLoading(false)
    };

    const pushData = async (e) => {
        // e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase
            .from('news')
            .insert([
                {
                    description: descr,
                    title: typeTitle,
                    type: type,
                    user: user,
                },
            ])
            .select();

        if (error) {
            console.error('Ошибка при вставке данных:', error.message);
        } else {
            setSuccess(true)
            console.log('Данные успешно добавлены:', data);
        }

        setLoading(false);
    }


    return (
        <>
            {
                loading
                    ?
                    <Loader />
                    :

                    <form className={`${styles.form} ${validation ? styles.form__decline : ''} `}>
                        {
                            success
                                ?
                                <div className={styles.form__success}>
                                    Успешно отправлено, <NavLink to="/">можешь проверить свою новость</NavLink>
                                </div>
                                :
                                ''
                        }
                        <div className={styles.form__title}>{validation ? 'Заполните все поля! (дада, выделены все  поля, не хватило времени на нормальную валидацию!)' : 'Запостить новость'}</div>
                        <input type="text" className={styles.form__input} placeholder='Кто пишет? Кто ты воин?' onChange={(e) => { setUser(e.target.value) }} />
                        <textarea type="text" className={styles.form__input} placeholder='Что опять произошло в офисе?'
                            onChange={(e) => { setDescr(e.target.value) }} >
                        </textarea>
                        <select defaultValue={0} type="text" className={styles.form__select}
                            onChange={(e) => {
                                setTypeTitle(e.target.value)
                                const selectedType = formTypes.find(el => el.type_title === e.target.value);
                                if (selectedType) {
                                    setType(selectedType.type);
                                    console.log(selectedType.type);
                                }
                            }}>
                            <option value="0" disabled>Выберите тип новости</option>
                            {formTypes.map((el, index) => {
                                return (
                                    <option key={index}
                                        value={el.type_title}>
                                        {el.type_title}
                                    </option>)
                            })}
                        </select>
                        <button type='button' className={styles.form__button} onClick={(e) => {
                            if (type !== '' && user.trim() !== '' && descr.trim() !== '') {
                                pushData()
                            }
                            else {
                                e.preventDefault()
                                setValidation(true)
                            }

                        }
                        }>
                            Выложить новость
                        </button>
                    </form >
            }

        </>
    )
}
