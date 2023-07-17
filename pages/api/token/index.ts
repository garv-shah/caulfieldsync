import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    // This will allow OPTIONS request
    if (method === "OPTIONS") {
        return res.status(200).send("ok");
    }

    if (req.query['username'] == undefined) {
        res.status(403).json({ error: "No username provided. Please provide a user's Student ID from CaulfieldLife" })
    } else if (req.query['password'] == undefined) {
        res.status(403).json({ error: "No password provided. Please provide a user's password from CaulfieldLife" })
    }

    // @ts-ignore
    const username: string = req.query['username'].toString();
    // @ts-ignore
    const password: string = req.query['password'].toString();
    res.redirect(`https://australia-southeast1-schoollife-21ac3.cloudfunctions.net/apiToken?username=${username}&password=${password}`)
}
