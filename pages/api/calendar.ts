// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch';
import ical, {ICalCalendar} from 'ical-generator';
import { titleCase } from "title-case";

async function getCalendar(): Promise<ICalCalendar> {
  async function main() {
    const response = await fetch("https://life-api.caulfieldlife.com.au/", {
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
        "x-community-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImpTMVhvMU9XRGpfNTJ2YndHTmd2UU8yVnpNYyJ9.eyJhdWQiOiI5ZjA3YjE3Yy1jOTVkLTQ3OTAtOWFhMi1jMzIwZmFiNmRlMGEiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMjNhMzg2M2EtNGJkMy00NGVhLTkzMjktYWYzZWU4YmM2MTUzL3YyLjAiLCJpYXQiOjE2NTI0MDgxMDIsIm5iZiI6MTY1MjQwODEwMiwiZXhwIjoxNjUyNDEyMDAyLCJhaW8iOiJBVFFBeS84VEFBQUFFd2xpLzFkMjlHSVFiNWllcTA0ckFnSW02UUZQekduR05McXJONFVQL1NZM3lTai9XSmFLNzNWMU83TmtVcHBJIiwiZW1haWwiOiJHYXJ2U2hhaEBjYXVsZmllbGRncy52aWMuZWR1LmF1IiwibmFtZSI6IkdhcnYgU2hhaCIsIm9pZCI6ImYxZmYxNDk1LTNiZGUtNDk2ZC1hMDZiLTRiMTZkOTNhOGFjNSIsInByZWZlcnJlZF91c2VybmFtZSI6IjE1MzUyN0BjYXVsZmllbGRncy52aWMuZWR1LmF1IiwicmgiOiIwLkFXY0FPb2FqSTlOTDZrU1RLYTgtNkx4aFUzeXhCNTlkeVpCSG1xTERJUHEyM2dwbkFJZy4iLCJzdWIiOiJjNWU4ZUgzeUZSNHBPMVVfVTl2MWYzT0M0bVBNbUhBekVNYzVxRnlQbkdvIiwidGlkIjoiMjNhMzg2M2EtNGJkMy00NGVhLTkzMjktYWYzZWU4YmM2MTUzIiwidXRpIjoiWkdVYnlxajFrMHVrT3ljdk1ZTVZBQSIsInZlciI6IjIuMCJ9.n8lW8AgQUpnj8IIQqfX5l5PWmqtLnsB7j5td7SGVFg6qaeWhQI46A-vKVIjx8fb39i8h0p_mzWCzr9L_6yqVzrAa_5OUU7xPOTxcw9CN55Ar4Rj4O4rR-BtJuXe9e-w1sClw_vLEGFMkXCng5giN0ANsCwqjaEylIMSuUHf5b-Pysx6igxRwPe7Z_xOqSkXW4S6DCj0ChkPnuUhqRTyngFKe8JOavPIafnv4gXNAeK9WTpZ70Ics9BHOnZhvm_bw8Qv7iO6ZOgtE6LbD4xy2INOhfP0HSsjbmMnkG8hNo_gfkxNyrRb_TWnJte8Eg7e6BEoStyOVhKsuP-U1RSN8NQ"
      },
      "referrer": "https://caulfieldlife.com.au/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "{\"operationName\":\"ClassData\",\"variables\":{\"startTime\":\"2022-05-08T14:00:00.000Z\",\"endTime\":\"2022-05-22T13:59:59.999Z\",\"memberId\":\"cjw0mjhvf1fac0993081nfrp6\"},\"query\":\"fragment ClassFields on Class {\\n  id\\n  title\\n  description\\n  startTime\\n  endTime\\n  dayOrder\\n  periodOrder\\n  periodName\\n  colour\\n  room\\n  teacherName\\n  __typename\\n}\\n\\nquery ClassData($memberId: ID!, $startTime: DateTime!, $endTime: DateTime) {\\n  classes(where: {startTime: $startTime, endTime: $endTime, memberId: $memberId}, orderBy: {property: \\\"startTime\\\", sort: ASC}) {\\n    ...ClassFields\\n    __typename\\n  }\\n}\\n\"}",
      "method": "POST",
      // @ts-ignore
      "mode": "cors",
      "credentials": "include"
    })

    // @ts-ignore
    const data: object = await response.json()


    // @ts-ignore
    const classes = data['data']['classes']

    const calendar = ical({name: 'School Timetable'});

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

  return main()
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ICalCalendar>
) {
  const calendar = await getCalendar()
  calendar.serve(res)
}
