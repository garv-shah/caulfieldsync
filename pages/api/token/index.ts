import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.query['username'] == undefined) {
        res.status(403).json({ error: "No username provided. Please provide a user's Student ID from CaulfieldLife" })
    } else if (req.query['password'] == undefined) {
        res.status(403).json({ error: "No password provided. Please provide a user's password from CaulfieldLife" })
    }

    const username: string = req.query['username'].toString();
    const password: string = req.query['password'].toString();
    res.redirect(`https://australia-southeast1-studentlife-a0531.cloudfunctions.net/token?username=${username}&password=${password}`)
}
