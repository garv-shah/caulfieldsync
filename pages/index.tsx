import {Grid} from '@mantine/core'
import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>CaulfieldSync</title>
                <meta name="description" content="A wrapper for the CaulfieldLife API!"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to <a>CaulfieldSync!</a>
                </h1>

                <p className={styles.description}>
                    Get started by making an API request at{' '}
                    <code className={styles.code}>/api</code>
                </p>

                <Grid>
                    <a href="https://github.com/garv-shah/caulfieldsync/blob/main/README.md" className={styles.card}>
                        <h2>Documentation &rarr;</h2>
                        <p>Find information on how to use the API and more!</p>
                    </a>

                    <a href="https://github.com/garv-shah/caulfieldsync" className={styles.card}>
                        <h2>GitHub &rarr;</h2>
                        <p>Check the project out on GitHub!</p>
                    </a>

                    <a href="/calendar" className={styles.card}>
                        <h2>Calendar &rarr;</h2>
                        <p>Get an Apple Calendar subscription that syncs with your CaulfieldLife timetable!</p>
                    </a>
                </Grid>
            </main>

            <footer className={styles.footer}>
                <a href="https://garv-shah.github.io">By Garv Shah</a>
            </footer>
        </div>
    )
}

export default Home
