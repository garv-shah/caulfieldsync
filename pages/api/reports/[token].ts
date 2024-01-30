import fetch, {Response} from "node-fetch";
import {NextApiRequest, NextApiResponse} from "next";
import {getUserID} from "../timetable/[token]/[[...userID]]";


function getResponse(token: string, userID: string): Promise<Response> {
    return fetch("https://life-api.caulfieldlife.com.au/", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-AU,en;q=0.9",
            "authorization": "Bearer X-ae97a16a-3e28-4365:Y-53e74b38-8a53-4ef7",
            "content-type": "application/json",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-community-token": token,
            "Referer": "https://caulfieldlife.com.au/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{\"operationName\":\"ReportsData\",\"variables\":{\"memberIds\":[\"${userID}\"]},\"query\":\"query ReportsData($memberIds: [ID!]!) {\\n  membersReports(memberIds: $memberIds) {\\n    semester\\n    externalId\\n    memberId\\n    year\\n    file\\n    name\\n    reportingPeriod\\n    __typename\\n  }\\n}\\n\"}`,
        "method": "POST"
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    // This will allow OPTIONS request
    if (method === "OPTIONS") {
        return res.status(200).send("ok");
    }

    const token: string = req.query['token'].toString()

    let userID: string;

    if (req.query['userID'] == undefined) {
        const response = await getUserID(token)
        // @ts-ignore
        userID = (await response.json())['id']
    } else {
        userID = req.query['userID'][0]
    }

    const response = await getResponse(token, userID);
    const jsonResponse = await response.json()

    // @ts-ignore
    if (jsonResponse != null) {
        // @ts-ignore
        res.status(response.status).json(jsonResponse)
    } else {
        res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
    }
}
