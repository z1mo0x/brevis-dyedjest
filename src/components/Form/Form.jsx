import React, { useEffect, useState } from 'react'
import styles from './Form.module.css'
import { supabase } from '../../supabase'

export default function Form() {

    const [formTypes, setFormTypes] = useState([]);
    const [loading, setLoading] = useState(false)

    const [descr, setDescr] = useState('')
    const [type, setType] = useState('')
    const [user, setUser] = useState('')
    const [typeTitle, setTypeTitle] = useState('')
    const [validation, setValidation] = useState(false)

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

        console.log('Описание:', descr);
        console.log('Заголовок:', typeTitle);
        console.log('Тип:', type);

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
            console.log('Данные успешно добавлены:', data);
            // Возможно, вы хотите обновить состояние или перезагрузить данные
            // await fetchData(); // Если нужно обновить список новостей
        }

        setLoading(false);
    }


    return (
        <>
            {
                loading
                    ?
                    'загрузка...'
                    :
                    <form className={`${styles.form} ${validation ? styles.form__decline : ''} `}>
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
                        <div>{type}</div>
                        <button className={styles.form__button} onClick={(e) => {
                            if (type !== '' && user !== '' && descr !== '') {
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
                    </form>
            }

        </>
    )
}
