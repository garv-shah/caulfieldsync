// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import fetch, {Response} from 'node-fetch';
import ical, {ICalCalendar, ICalCategory} from 'ical-generator';
import {titleCase} from "title-case";
import { server } from '../../../../config';
import {ICalAlarmType} from "ical-generator/dist/alarm";

export function getDate(args: {
  dayOffset: number,
  monthOffset: number
}): string {
  const date = new Date();
  date.setMonth(date.getMonth() + args.monthOffset);
  date.setDate(date.getDate() + args.dayOffset);
  return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
}

function getResponse(token: string, userID: string, events: boolean, shorten: boolean): Promise<Response> {
  return fetch(`${server}/api/${events ? 'events' : 'timetable'}/${token}${(userID == 'null') ? '' : `/${userID}`}?dayMinus=5&dayPlus=100&shorten=${shorten}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  });
}

async function getCalendar(data: unknown, request: NextApiRequest): Promise<ICalCalendar> {
  async function main(data: unknown) {
    let alertTime = (request.query['alertTime'] ?? 'null').toString();
    const shorten = (request.query['shorten'] ?? 'true').toString();
    const events: boolean = request.query['events'] == 'true'

    const calendar = ical({name: events ? 'School Events' : 'School Timetable'});

    if (events) {
      // @ts-ignore
      const events = data['data']['events']

      for (let eventsIndex = 0; eventsIndex < events.length; eventsIndex++) {
        let eventName = events[eventsIndex]['title']

        if (shorten == 'true') {
          eventName = eventName
              .replace(/\*/, "")
        }

        let attendees = [];

        for (let i = 0; i < events[eventsIndex]['organisers'].length; i++) {
          const organiser = events[eventsIndex]['organisers'][i]
          const name = `${organiser['firstName']} ${organiser['lastName']}`
          const email = `${organiser['firstName']}${organiser['lastName']}@caulfieldgs.vic.edu.au`
          attendees.push({name: name, email: email})
        }

        let event = calendar.createEvent({
          start: new Date(events[eventsIndex]['startTime']),
          end: new Date(events[eventsIndex]['endTime']),
          summary: eventName,
          description: events[eventsIndex]['description'],
          location: (events[eventsIndex]['location'] ?? {'details': null})['details'],
          attendees: attendees
        });

        if (alertTime != 'null') {
          let alertNum = 1

          if (alertTime != '0') {
            alertNum = Number(alertTime)
          }

          event.createAlarm({
            type: ICalAlarmType.display,
            trigger: alertNum,
          });
        }
      }
    } else {
      // @ts-ignore
      const classes = data['data']['classes']

      let classNames = new Set<string>();
      let categoryDict = new Map<string, ICalCategory>();
      let detailedName = '';

      for (let classIndex = 0; classIndex < classes.length; classIndex++) {
        let subjectName = classes[classIndex]['description'];

        if (classes[classIndex]['detailedName'] != undefined) {
          detailedName = `\n${classes[classIndex]['detailedName']}`;
        }

        let attendees = [];

        let classNamesLength = classNames.size
        classNames.add(subjectName)

        if (classNamesLength != classNames.size) {
          categoryDict.set(subjectName, new ICalCategory({name: subjectName}));
        }

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
          summary: subjectName,
          description: `Period ${classes[classIndex]['periodName']}${detailedName}`,
          location: classes[classIndex]['room'],
          attendees: attendees
        });

        event.categories([categoryDict.get(subjectName) ?? new ICalCategory({name: subjectName})]);

        if (alertTime != 'null') {
          let alertNum = 1

          if (alertTime != '0') {
            alertNum = Number(alertTime)
          }

          event.createAlarm({
            type: ICalAlarmType.display,
            trigger: alertNum,
          });
        }
      }
    }

    return calendar
  }

  return main(data)
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

  // @ts-ignore
  const token: string = req.query['token'].toString()
  const events: boolean = req.query['events'] == 'true'
  let userID: string = 'null';
  const shorten: boolean = (req.query['shorten'] ?? 'true').toString() == 'true';

  if (req.query['userID'] != undefined) {
    userID = req.query['userID'].toString()
  }

  const response = await getResponse(token, userID, events, shorten);
  console.log(response);
  let jsonResponse;

  try {
    jsonResponse = await response.json()
  } catch {
    res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
  }

  // @ts-ignore
  if (response.status == 200 && jsonResponse['errors'] == undefined) {
    const calendar = await getCalendar(jsonResponse, req)
    calendar.serve(res)
  } else if (response.status == 403) {
    res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
  } else {
    res.status(response.status).json(jsonResponse)
  }
}
