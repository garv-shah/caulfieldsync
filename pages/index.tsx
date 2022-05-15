import {Grid} from '@mantine/core'
import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link'

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>CaulfieldSync</title>
                <meta name="description" content="A wrapper for the CaulfieldLife API!"/>

                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="theme-color" content="#ffffff" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to <a>CaulfieldSync!</a>
                </h1>

                <p className={styles.description}>
                    Get started by making an API request at{' '}
                    <code className={styles.code}>/api</code>
                </p>

                <div className={styles.grid}>
                    <a href="https://github.com/garv-shah/caulfieldsync/blob/main/README.md" className={styles.card}>
                        <h2>Documentation &rarr;</h2>
                        <p>Find information on how to use the API and more!</p>
                    </a>

                    <a href="https://github.com/garv-shah/caulfieldsync" className={styles.card}>
                        <h2>GitHub &rarr;</h2>
                        <p>Check the project out on GitHub!</p>
                    </a>

                    <Link href="/calendar">
                        <a className={styles.card}>
                            <h2>Calendar &rarr;</h2>
                            <p>Get an Apple Calendar subscription that syncs with your CaulfieldLife timetable!</p>
                        </a>
                    </Link>
                </div>
            </main>

            <footer className={styles.footer}>
                <a href="https://garv-shah.github.io">By Garv Shah</a>
            </footer>
        </div>
    )
}

export default Home
