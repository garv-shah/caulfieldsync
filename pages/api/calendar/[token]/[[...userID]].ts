// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import fetch, {Response} from 'node-fetch';
import ical, {ICalCalendar} from 'ical-generator';
import {titleCase} from "title-case";
import { server } from '../../../../config';

function getDate(args: {
  dayOffset: number,
  monthOffset: number
}): string {
  const date = new Date();
  date.setMonth(date.getMonth() + args.monthOffset);
  date.setDate(date.getDate() + args.dayOffset);
  return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
}

function getUserID(token: string): Promise<Response> {
  return fetch(`${server}/api/userInfo/${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  });
}

function getResponse(token: string, userID: string): Promise<Response> {
  const response = fetch("https://life-api.caulfieldlife.com.au/", {
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
    "body": `{\"operationName\":\"ClassData\",\"variables\":{\"startTime\":\"${getDate({dayOffset: -5, monthOffset: 0})}T14:00:00.000Z\",\"endTime\":\"${getDate({dayOffset: 0, monthOffset: 1})}T13:59:59.999Z\",\"memberId\":\"${userID}\"},\"query\":\"fragment ClassFields on Class {\\n  id\\n  title\\n  description\\n  startTime\\n  endTime\\n  dayOrder\\n  periodOrder\\n  periodName\\n  colour\\n  room\\n  teacherName\\n  __typename\\n}\\n\\nquery ClassData($memberId: ID!, $startTime: DateTime!, $endTime: DateTime) {\\n  classes(where: {startTime: $startTime, endTime: $endTime, memberId: $memberId}, orderBy: {property: \\\"startTime\\\", sort: ASC}) {\\n    ...ClassFields\\n    __typename\\n  }\\n}\\n\"}`,
    "method": "POST",
    // @ts-ignore
    "mode": "cors",
    "credentials": "include"
  });

  return response;
}

async function getCalendar(data: unknown): Promise<ICalCalendar> {
  async function main(data: unknown) {

    const calendar = ical({name: 'School Timetable'});

    // @ts-ignore
    const classes = data['data']['classes']

    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
      let attendees = [];

      if (classes[classIndex]['teacherName'] != '') {
        for (let i = 0; i < classes[classIndex]['teacherName'].split(', ').length; i++) {
          const name = classes[classIndex]['teacherName'].split(', ')[i]
          const nameSplit = name.split(' ');
          const email = nameSplit[1] + nameSplit[2] + '@caulfieldgs.vic.edu.au'
          attendees.push({name: name, email: email})
        }
      }

      // console.log(classes[classIndex]['description'])
      // console.log(titleCase(classes[classIndex]['description'].toLowerCase()))

      let event = calendar.createEvent({
        start: new Date(classes[classIndex]['startTime']),
        end: new Date(classes[classIndex]['endTime']),
        summary: titleCase(classes[classIndex]['description'].toLowerCase()),
        description: `Period ${classes[classIndex]['periodName']}`,
        location: classes[classIndex]['room'],
        attendees: attendees
      });

      event.createAlarm({type: 'display', trigger: 300});
    }

    return calendar
  }

  return main(data)
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

  // @ts-ignore
  if (response.status == 200 && jsonResponse['errors'] == undefined) {
    const calendar = await getCalendar(jsonResponse)
    calendar.serve(res)
  } else if (response.status == 403) {
    res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
  } else {
    res.status(response.status).json(jsonResponse)
  }
}
