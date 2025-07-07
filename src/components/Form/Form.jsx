import React, { useEffect, useState } from 'react'
import styles from './Form.module.css'
import { supabase } from '../../supabase'
import { NavLink } from 'react-router-dom';
import Loader from '../Loader/Loader';
import memasForm from '../../assets/memas-form.jpeg'

export default function Form() {

    const [formTypes, setFormTypes] = useState([]);
    const [loading, setLoading] = useState(false)

    const [descr, setDescr] = useState('')
    const [type, setType] = useState('')
    const [user, setUser] = useState('')
    const [typeTitle, setTypeTitle] = useState('')
    const [validation, setValidation] = useState(false)
    const [success, setSuccess] = useState(false)

    const [imageFile, setImageFile] = useState(null);
    const [pastedImage, setPastedImage] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

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

    const pushData = async () => {
        setLoading(true);

        let imageUrl = null;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error('Ошибка загрузки изображения:', uploadError.message);
                setLoading(false);
                return;
            }

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            imageUrl = data.publicUrl;

            if (!imageUrl) {
                console.error('Ошибка получения URL изображения');
                setLoading(false);
                return;
            }

            setUploadedImageUrl(imageUrl);
        }

        const { data, error } = await supabase
            .from('news')
            .insert([
                {
                    description: descr,
                    title: typeTitle,
                    type: type,
                    imageUrl: imageUrl,
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

    useEffect(() => {
        function onPaste(e) {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    const url = URL.createObjectURL(blob);
                    setPastedImage(url);
                    setImageFile(blob);
                    e.preventDefault();
                    break;
                }
            }
        }
        document.body.addEventListener('paste', onPaste);
        return () => {
            document.body.removeEventListener('paste', onPaste);
            if (pastedImage) {
                URL.revokeObjectURL(pastedImage);
            }
        };
    }, [pastedImage]);

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
                        <select defaultValue="0" type="text" className={styles.form__select}
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

                        <label htmlFor="file" className={styles.form__file}>
                            Загрузить мемчик <img src={memasForm} alt="" />
                            <input
                                id='file'
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImageFile(file);
                                        if (pastedImage) {
                                            URL.revokeObjectURL(pastedImage);
                                            setPastedImage(null);
                                        }
                                    }
                                }}
                            />
                        </label>

                        {/* Превью вставленной из буфера картинки */}
                        {pastedImage && (
                            <div style={{ marginTop: '10px' }}>
                                <p>Вставленное изображение:</p>
                                <img src={pastedImage} alt="Превью вставленной картинки" style={{ maxWidth: '300px' }} />
                            </div>
                        )}

                        {/* Превью выбранного файла из input (если нет вставленного) */}
                        {!pastedImage && imageFile && (
                            <div style={{ marginTop: '10px' }}>
                                <p>Выбранное изображение:</p>
                                <img src={URL.createObjectURL(imageFile)} alt="Превью выбранного файла" style={{ maxWidth: '300px' }} />
                            </div>
                        )}

                        {/* Превью загруженного изображения */}
                        {uploadedImageUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <p>Загруженное изображение:</p>
                                <img src={uploadedImageUrl} alt="Загруженное изображение" style={{ maxWidth: '300px' }} />
                            </div>
                        )}

                        <button type='button' className={styles.form__button} onClick={() => {
                            if (type !== '' && user.trim() !== '' && descr.trim() !== '') {
                                setValidation(false);
                                pushData();
                            }
                            else {
                                setValidation(true)
                            }
                        }}>
                            Выложить новость
                        </button>
                    </form >
            }

        </>
    )
}
