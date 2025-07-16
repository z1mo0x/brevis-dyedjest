import React, { useEffect, useState } from 'react';
import Header from '../Header/Header';
import styles from './Memes.module.css';
import { supabase } from '../../supabase';

export default function Memes() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [customName, setCustomName] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);


    useEffect(() => {
        getMemes();

        const handlePaste = (event) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') === 0) {
                    const blob = item.getAsFile();
                    if (blob) {
                        setFile(blob);
                        setPreviewUrl(URL.createObjectURL(blob));
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const getMemes = async () => {
        setLoading(true);

        const { data, error } = await supabase.storage.from('memes').list('');

        if (error) {
            console.error('Ошибка при получении списка файлов:', error);
            setLoading(false);
            return;
        }

        const sortedData = [...data].sort((a, b) => {
            return new Date(b.updated_at) - new Date(a.updated_at);
        });

        const filesWithUrls = sortedData.map(file => {
            const { data: urlData } = supabase.storage.from('memes').getPublicUrl(file.name);
            return {
                name: file.name,
                url: urlData.publicUrl,
            };
        });

        setImages(filesWithUrls);
        setLoading(false);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);

        const fileExt = file.type.split('/').pop();
        const rawName = customName.trim();
        const fileName = rawName
            ? `${rawName}.${fileExt}`
            : `${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('memes')
            .upload(fileName, file);

        if (error) {
            console.error('Ошибка загрузки:', error.message);
        } else {
            getMemes();
            setFile(null);
            setPreviewUrl(null);
            setCustomName('');
        }

        setUploading(false);
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setSelectedImage(null)
        }
    })

    return (
        <div className="container">
            <Header />
            <div className={styles.memes}>
                <h1>Галерея мемов</h1>

                <form onSubmit={handleUpload} className={styles.memes__form}>
                    <label htmlFor="imageMem" className={styles.memes__input}>
                        Загрузить мемчик
                        {previewUrl && (
                            <div className={styles.preview}>
                                <p>Твой мем, только не опозорься:</p>
                                <img src={previewUrl} alt="Preview" />
                            </div>
                        )}
                        <input id="imageMem" type="file" accept="image/*" onChange={handleFileChange} />
                    </label>

                    <input
                        type="text"
                        placeholder="Имя файла (опционально)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className={styles.memes__filename}
                    />

                    <button type="submit" disabled={uploading || !file}>
                        {uploading ? 'Загрузка...' : 'Загрузить мем'}
                    </button>
                </form>




                <div className={styles.memes__wrapper}>
                    {loading && <p>Загрузка мемов...</p>}
                    {!loading && images.length === 0 &&
                        <p>Мемов нет, но вы держитесь...</p>
                    }
                    {!loading && images.map(image => (
                        <div key={image.name} className={styles.memes__item}>
                            <img
                                src={image.url}
                                alt={image.name}
                                onClick={() => setSelectedImage(image.url)}
                                className={styles.memes__thumbnail}
                            />
                            <p>{image.name}</p>
                        </div>
                    ))}

                </div>
            </div>
            {selectedImage && (
                <div className={styles.modal} onClick={() => setSelectedImage(null)}>
                    <div className={styles.modal__content} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modal__close} onClick={() => setSelectedImage(null)}>×</button>
                        <img src={selectedImage} alt="Просмотр" />
                    </div>
                </div>
            )}
        </div>
    );
}
