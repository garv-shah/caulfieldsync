import {NextApiRequest, NextApiResponse} from "next";
import fetch, {Response} from "node-fetch";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const username: string = req.query['username'].toString();
    const password: string = req.query['password'].toString();

    function getResponse(username: string, password: string): Promise<Response> {
        return fetch(`https://us-central1-verdis-communications.cloudfunctions.net/token?username=${username}&password=${password}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: null,
        });
    }

    const response = await getResponse(username, password);
    const returnJson = await response.json();
    res.status(response.status).json(returnJson)
}