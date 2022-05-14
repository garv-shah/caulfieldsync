import {NextApiRequest, NextApiResponse} from "next";
import chromium from "chrome-aws-lambda";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const username: string = req.query['username'].toString();
    const password: string = req.query['password'].toString();

    await (async () => {
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        page.on('request', async req => {
            const auth = req.headers()['x-community-token']
            if (auth != undefined && auth.length == 1264) {
                await browser.close();
                res.status(200).json({
                    token: auth
                })
            }
        });
        await page.goto(`https://identity.caulfieldgs.vic.edu.au/adfs/ls/?client-request-id=00d7a467-42b4-4a2d-9a85-331319fd4546&wa=wsignin1.0&wtrealm=urn%3afederation%3aMicrosoftOnline&wctx=LoginOptions%3D3%26estsredirect%3d2%26estsrequest%3drQQIARAA42I11LPQM9BiNtIzsFKxTDMwTzI0T9ZNtjRN0TUxtzTQtUxMNNJNNjYySEtMMktJNUgsEuISSF9ynWGLk67XrFZjYcm_rm6rGB0ySkoKiq309XMy01J1Ewsy9ZITS3PSMlNzUkAiesn5uXqJpfq-xe5FiQUZ-omlJRn6-QWpeZkp-kWpJaVFeTsYGS8wMr5gZLzFxO_vCJQ2AhH5RZlVqZ-YWAtLU4sqVzGrGECAsS6IhBDJMBYMbGJWMTJONLYwM07UNUlKMdY1MUlN1LU0NrLUTUwzTk21SEo2MzQ1PsUcBnGAQmpuYmaOQmhxapFeUGpiikJBUX5aZk6qQn5aWk5mXmp8YnJyanGxgktmUWpySX5RpZ4jWMCxGKzFMQdJL4h3g5nxEbMs0AZTI3MHeCikF-uVZSbrpaaUAsPhAgvjKxYxDkYBDgkGBQYNFQNWKw4OLgF-CXYFhh8sjItYgWH87rhY-VnVaU6TX9Xsbn5tw3CKVT_YOLLCNzPUxycs37VCuywtM93Ho7Qyo7zIKdi7IinKPDs8O9W7IjRUP8PA1sLKcAIb4wQ24VNsPLnFiTl6WcV6efkpqR_YGDvYGXZxUhxhM7gYD_Ay_OA78Lf1_oyNvW89AA2&cbcxt=&username=${username}&mkt=&lc=`);
        await page.keyboard.type(password);
        await page.click('#submitButton');
        try {
            await page.waitForSelector('#idSIButton9', { timeout: 2000 });
        } catch (error) {
            await browser.close();
            res.status(401).json({
                error: 'Authorisation failed. Make sure you have typed in your username and password correctly!'
            })
        }
        await page.click('#idSIButton9');
    })();
}