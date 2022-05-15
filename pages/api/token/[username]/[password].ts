import {NextApiRequest, NextApiResponse} from "next";
import fetch, {Response} from "node-fetch";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const username: string = req.query['username'].toString();
    const password: string = req.query['password'].toString();
    res.redirect(`https://us-central1-verdis-communications.cloudfunctions.net/token?username=${username}&password=${password}`)
}