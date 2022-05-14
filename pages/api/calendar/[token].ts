// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch, {Response} from 'node-fetch';
import ical, {ICalCalendar} from 'ical-generator';
import { titleCase } from "title-case";

function getResponse(token: string): Promise<Response> {
  const date = new Date();
  console.log(`${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`)

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
    "body": "{\"operationName\":\"ClassData\",\"variables\":{\"startTime\":\"2022-05-08T14:00:00.000Z\",\"endTime\":\"2022-05-22T13:59:59.999Z\",\"memberId\":\"cjw0mjhvf1fac0993081nfrp6\"},\"query\":\"fragment ClassFields on Class {\\n  id\\n  title\\n  description\\n  startTime\\n  endTime\\n  dayOrder\\n  periodOrder\\n  periodName\\n  colour\\n  room\\n  teacherName\\n  __typename\\n}\\n\\nquery ClassData($memberId: ID!, $startTime: DateTime!, $endTime: DateTime) {\\n  classes(where: {startTime: $startTime, endTime: $endTime, memberId: $memberId}, orderBy: {property: \\\"startTime\\\", sort: ASC}) {\\n    ...ClassFields\\n    __typename\\n  }\\n}\\n\"}",
    "method": "POST",
    // @ts-ignore
    "mode": "cors",
    "credentials": "include"
  });

  return response;
}

async function getCalendar(response: Response): Promise<ICalCalendar> {
  async function main(response: Response) {
    // @ts-ignore
    const data: object = await response.json()

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

      console.log(classes[classIndex]['description'])
      console.log(titleCase(classes[classIndex]['description'].toLowerCase()))

      calendar.createEvent({
        start: new Date(classes[classIndex]['startTime']),
        end: new Date(classes[classIndex]['endTime']),
        summary: titleCase(classes[classIndex]['description'].toLowerCase()),
        description: `Period ${classes[classIndex]['periodName']}`,
        location: classes[classIndex]['room'],
        attendees: attendees
      });
    }

    return calendar
  }

  return main(response)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
  const token: string = req.query['token'].toString()
  const response = await getResponse(token);

  if (response.status == 200) {
    const calendar = await getCalendar(response)
    calendar.serve(res)
  } else if (response.status == 403) {
    res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
  } else {
    res.status(response.status).json(await response.json())
  }
}
