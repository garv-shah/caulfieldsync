import {useForm} from '@mantine/form';
import {PasswordInput, Group, Button, TextInput, Title, Text, Space, LoadingOverlay} from '@mantine/core';
import styles from "../styles/Home.module.css";
import Head from "next/head";
import {useElementSize} from "@mantine/hooks";
import {useState} from "react";

export default function Calendar() {
    function isNumeric(str: string | number) {
        if (typeof str != "string") return false // we only process strings!
        return !isNaN(Number(str)) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }

    function downloadURI(uri: string, name: string) {
        let link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const form = useForm({
        initialValues: {
            studentID: '',
            password: '',
        },
        validate: {
            studentID: (value) =>
                !isNumeric(value) ? 'Invalid Student ID!!' : null,
            password: (value) =>
                value == '' ? 'Please enter a password!' : null
        },
    });

    const [visible, setVisible] = useState(false);

    return (
        <div className={styles.container}>
            <Head>
                <title>CaulfieldSync - Calendar</title>
                <meta name="description"
                      content="Get an Apple Calendar subscription that syncs with your CaulfieldLife timetable!"/>

                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="theme-color" content="#ffffff" />
            </Head>

            <main className={styles.main}>
                <Title className={styles.title}>
                    <Text inherit variant="gradient" component="span">Calendar</Text>
                </Title>

                <Space h="md"/>

                <Text>Please enter your CaulfieldLife login details to proceed!</Text>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <Text>Be patient, it'll take about 15 seconds :)</Text>

                <Space h="lg"/>
                <div>
                    <form onSubmit={
                        form.onSubmit(async (values) => {
                            setVisible(true);

                            const response = await fetch(`/api/token/${values.studentID}/${values.password}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                            });

                            const token: string = (await response.json())['token']

                            // await fetch(`/api/calendar/${token}`);
                            downloadURI(`/api/calendar/${token}`, "timetable.ics")

                            setVisible(false);
                        })
                    }>
                        <TextInput
                            label="Student ID"
                            placeholder="Student ID"
                            description="Please input your Student ID that you would use on services such as CaulfieldLife"
                            {...form.getInputProps('studentID')}
                        />

                        <PasswordInput
                            label="Password"
                            placeholder="Password"
                            description="Please input the password that you would use on services such as CaulfieldLife"
                            {...form.getInputProps('password')}
                        />

                        <Space h="md"/>

                        <Group position="center" mt="md">
                            <Button type="submit">Download Calendar</Button>
                        </Group>
                    </form>

                    <LoadingOverlay visible={visible} />
                </div>
            </main>

            <footer className={styles.footer}>
                <a href="https://garv-shah.github.io">By Garv Shah</a>
            </footer>
        </div>
    );
}