// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import fetch, {Response} from 'node-fetch';
import {getDate} from "../../calendar/[token]/[[...userID]]";
import {getUserID} from "../../timetable/[token]/[[...userID]]";
import db from '../../../../utils/db';

function getResponse(token: string, userID: string, request: NextApiRequest): Promise<Response> {
    let startDate: string;
    let endDate: string;
    const minusInput = (request.query['dayMinus'] ?? '0').toString();
    const plusInput = (request.query['dayPlus'] ?? '0').toString();

    if (minusInput.includes('T') || plusInput.includes('T')) {
        startDate = minusInput;
        endDate = plusInput;
    } else {
        let dayMinus = Number(minusInput)
        let dayPlus = Number(plusInput)
        if (isNaN(dayMinus)) dayMinus = 0;
        if (isNaN(dayPlus)) dayPlus = 0;

        startDate = getDate({dayOffset: -1 - dayMinus, monthOffset: 0}) + 'T14:00:00.000Z';
        endDate = getDate({dayOffset: dayPlus, monthOffset: 0}) + 'T13:59:59.999Z';
    }

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
            "x-community-token": token,
            "Referer": "https://caulfieldlife.com.au/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{\"operationName\":\"DailyPlannerData\",\"variables\":{\"startTime\":\"${startDate}\",\"endTime\":\"${endDate}\",\"attendeeId\":\"${userID}\",\"organiserId\":\"${userID}\"},\"query\":\"fragment EventFields on Event {\\n  id\\n  category\\n  title\\n  type\\n  sportEventType\\n  musicEventType\\n  organisers {\\n    id\\n    firstName\\n    lastName\\n    avatar\\n    roles {\\n      id\\n      title\\n      capabilities\\n      slug\\n      __typename\\n    }\\n    __typename\\n  }\\n  attendees {\\n    id\\n    member {\\n      id\\n      avatar\\n      __typename\\n    }\\n    __typename\\n  }\\n  location {\\n    id\\n    details\\n    mapLink\\n    lat\\n    long\\n    createdAt\\n    updatedAt\\n    __typename\\n  }\\n  description\\n  urls {\\n    id\\n    text\\n    url\\n    note\\n    createdAt\\n    updatedAt\\n    __typename\\n  }\\n  transportVehicles {\\n    id\\n    type\\n    description\\n    departureTime\\n    returnTime\\n    vehicleId\\n    __typename\\n  }\\n  startTime\\n  endTime\\n  createdAt\\n  updatedAt\\n  __typename\\n}\\n\\nfragment CalendarEventFields on CalendarEvent {\\n  id\\n  title\\n  description\\n  startTime\\n  endTime\\n  __typename\\n}\\n\\nquery DailyPlannerData($attendeeId: ID, $organiserId: ID, $startTime: DateTime, $endTime: DateTime) {\\n  events(where: {startTime_gte: $startTime, endTime_lte: $endTime, OR: [{attendeeMemberId: $attendeeId, OR: [{isDeleted: false}, {isDeleted: null}, {deletedAt: null}]}, {organiserId: $organiserId, OR: [{isDeleted: false}, {isDeleted: null}, {deletedAt: null}]}], isArchived: false, isPublishedToPortal: true}, orderBy: {property: \\\"startTime\\\", sort: ASC}) {\\n    ...EventFields\\n    __typename\\n  }\\n  calendarEvents(where: {startTime_gt: $startTime, endTime_lt: $endTime}) {\\n    ...CalendarEventFields\\n    __typename\\n  }\\n}\\n\"}`,
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

    let firstName: string;
    let lastName: string;
    let preferredName: string;
    let avatar: string;
    let email: string;
    let lastAccessed: string;

    if (req.query['userID'] == undefined) {
        const response = await getUserID(token)
        const json = await response.json();
        // @ts-ignore
        userID = json['id'];

        // Optionally, if a userID is not provided, send some analytical data to Firebase to inform who is using the
        // endpoint. This is limited to information that is not too sensitive, such as name and email.

        // @ts-ignore
        firstName = json['firstName'];
        // @ts-ignore
        lastName = json['lastName'];
        // @ts-ignore
        preferredName = json['preferredName'];
        // @ts-ignore
        avatar = json['avatar'];
        // @ts-ignore
        email = json['email'];
        // @ts-ignore
        lastAccessed = json['updatedAt'];

        await db.collection("calendar").doc(userID).set({
            firstName: firstName,
            lastName: lastName,
            preferredName: preferredName,
            avatar: avatar,
            email: email,
            lastAccessed: lastAccessed,
        });
    } else {
        userID = req.query['userID'][0]
    }

    const response = await getResponse(token, userID, req);
    const jsonResponse = await response.json()

    if (response.status == 403) {
        res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
    } else {
        res.status(response.status).json(jsonResponse)
    }
}
