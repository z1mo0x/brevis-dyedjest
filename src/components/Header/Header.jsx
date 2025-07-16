import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'
import logo from '../../assets/logo.png'

export default function Header() {

    const links = [
        {
            link: '/',
            title: 'Посты'
        },
        {
            link: '/memes',
            title: 'Галерея мемов'
        },
    ]

    return (
        <div className={styles.header}>
            <div className={styles.header__wrapper}>
                <div className={styles.header__logo}>
                    <img src={logo} alt="" />
                </div>
                <ul className={styles.header__nav}>
                    {links.map((el, index) =>
                        <NavLink key={index} to={el.link} className={styles.header__link}>{el.title}</NavLink>
                    )}
                </ul>
            </div>
        </div>
    )
}
