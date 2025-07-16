import React from 'react'
import Header from '../Header/Header'
import memesDev2 from '../../assets/memes-dev-2.webp'
import styles from './Memes.module.css'

export default function Memes() {
    return (
        <>
            <div className="container">
                <Header />
                <div className={styles.development}>
                    <img src={memesDev2} alt="" />
                </div>
            </div>
        </>
    )
}
