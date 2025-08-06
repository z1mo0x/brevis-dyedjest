import React, { useEffect, useState } from 'react';
import Header from '../Header/Header';
import styles from './Memes.module.css';
import { supabase } from '../../supabase';
import EmojiPicker from 'emoji-picker-react';
import Emojipicker from '../Emojipicker/Emojipicker';

export default function Memes() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [customName, setCustomName] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const allowedExtensions = ['jpeg', 'jpg', 'png', 'webp', 'mp4'];

    useEffect(() => {
        getMemes();

        const handlePaste = (event) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') === 0) {
                    const blob = item.getAsFile();
                    if (blob) {
                        // Проверяем расширение pasted файла
                        const ext = blob.name?.split('.').pop().toLowerCase();
                        if (ext && allowedExtensions.includes(ext)) {
                            setFile(blob);
                            setPreviewUrl(URL.createObjectURL(blob));
                        } else {
                            alert('Разрешены только файлы форматов jpeg, jpg, png, webp и mp4');
                        }
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
        if (!selectedFile) return;

        const ext = selectedFile.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            alert('Разрешены только файлы форматов jpeg, jpg, png, webp и mp4');
            e.target.value = null; // очистить input
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            alert('Разрешены только файлы форматов jpeg, jpg, png, webp и mp4');
            return;
        }

        setUploading(true);

        const rawName = customName.trim();
        const fileName = rawName
            ? `${rawName}.${ext}`
            : `${Date.now()}.${ext}`;

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedImage(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
                                {/* Для превью видео можно добавить условие */}
                                {file && ['mp4'].includes(file.name.split('.').pop().toLowerCase()) ? (
                                    <video src={previewUrl} controls className={styles.memes__thumbnail} />
                                ) : (
                                    <img src={previewUrl} alt="Preview" />
                                )}
                            </div>
                        )}
                        <input
                            id="imageMem"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
                            onChange={handleFileChange}
                        />
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
                    {!loading && images.map(image => {
                        const ext = image.name.split('.').pop().toLowerCase();
                        const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

                        return (
                            <div key={image.name} className={styles.memes__item}>
                                {isVideo ? (
                                    <video
                                        src={image.url}
                                        className={styles.memes__thumbnail}
                                        onClick={() => setSelectedImage(image.url)}
                                    />
                                ) : (
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        onClick={() => setSelectedImage(image.url)}
                                        className={styles.memes__thumbnail}
                                    />
                                )}
                                <p>{image.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedImage && (() => {
                const ext = selectedImage.split('.').pop().toLowerCase();
                const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

                return (
                    <div className={styles.modal} onClick={() => setSelectedImage(null)}>
                        <div className={styles.modal__content} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.modal__close} onClick={() => setSelectedImage(null)}>×</button>
                            {isVideo ? (
                                <video src={selectedImage} controls autoPlay className={styles.modal__media} />
                            ) : (
                                <img src={selectedImage} alt="Просмотр" />
                            )}
                        </div>
                        {/* <Emojipicker /> */}
                    </div>
                );
            })()}
        </div>
    );
}
