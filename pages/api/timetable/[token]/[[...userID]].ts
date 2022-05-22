// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import fetch, {Response} from 'node-fetch';
import {getDate, getUserID} from "../../calendar/[token]/[alertTime]/[[...userID]]";

function getResponse(token: string, userID: string): Promise<Response> {
    return fetch("https://life-api.caulfieldlife.com.au/", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-AU,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
            "authorization": "Bearer X-ae97a16a-3e28-4365:Y-53e74b38-8a53-4ef7",
            "content-type": "application/json",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-community-token": token
        },
        "referrer": "https://caulfieldlife.com.au/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `{\"operationName\":\"ClassData\",\"variables\":{\"startTime\":\"${getDate({
            dayOffset: -1,
            monthOffset: 0
        })}T14:00:00.000Z\",\"endTime\":\"${getDate({
            dayOffset: 0,
            monthOffset: 0
        })}T13:59:59.999Z\",\"memberId\":\"${userID}\"},\"query\":\"fragment ClassFields on Class {\\n  id\\n  title\\n  description\\n  startTime\\n  endTime\\n  dayOrder\\n  periodOrder\\n  periodName\\n  colour\\n  room\\n  teacherName\\n  __typename\\n}\\n\\nquery ClassData($memberId: ID!, $startTime: DateTime!, $endTime: DateTime) {\\n  classes(where: {startTime: $startTime, endTime: $endTime, memberId: $memberId}, orderBy: {property: \\\"startTime\\\", sort: ASC}) {\\n    ...ClassFields\\n    __typename\\n  }\\n}\\n\"}`,
        "method": "POST",
        // @ts-ignore
        "mode": "cors",
        "credentials": "include"
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
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

    if (response.status == 403) {
        res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
    } else {
        res.status(response.status).json(jsonResponse)
    }
}
