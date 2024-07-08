import * as functions from "firebase-functions";
import fetch from "cross-fetch";
import { db } from "./index";

export const timetable = functions
  .region("australia-southeast1")
  .https.onRequest(async (req, res) => {
    let username = req.query.username;
    if (username === undefined) {
      res.status(401).json({
        error: "You need to provide a username!",
      });
    } else {
      username = username.toString();
    }

    let token = req.query.token;
    if (token === undefined) {
      res.status(401).json({
        error: "You need to provide a token!",
      });
    } else {
      token = token.toString();
    }

    let userID = req.query.userID;
    if (userID === undefined) {
      res.status(401).json({
        error: "You need to provide a userID!",
      });
    } else {
      userID = userID.toString();
    }

    let date = req.query.date;
    let startDate = new Date();
    let endDate = new Date();
    if (date === undefined) {
      res.status(401).json({
        error: "You need to provide a date!",
      });
    } else {
      const dateString = date.toString();

      startDate = new Date(dateString);
      startDate.setHours(0);
      startDate.setMonth(startDate.getMonth());

      endDate = new Date(dateString);
      endDate.setDate(startDate.getDate() + 1);
      endDate.setHours(-16);
      endDate.setMonth(endDate.getMonth());

      const date2 = new Date(dateString);
      date =
        date2.getFullYear() +
        "-" +
        ("0" + (date2.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date2.getDate()).slice(-2);
    }

    type period = {
      periodCode: string;
      periodColour: string;
      periodEnd: string;
      periodName: string;
      periodOrder: string;
      periodRoom: string;
      periodStaff: string;
      periodStart: string;
    };

    console.log(`Start Date: ${startDate}, End Date ${endDate} `);


    const timetableResponse = await getTimetableResponse(
      // @ts-ignore
      token,
      userID,
      startDate.toISOString(),
      endDate.toISOString()
    );
    const timetableJsonResponse = await timetableResponse.json();

    if (timetableJsonResponse["data"]["classes"] != null) {
      if (typeof username === "string") {
        const classes: Array<Object> = timetableJsonResponse["data"]["classes"];

        if (typeof date === "string") {
          await db
            .collection("users")
            .doc(username)
            .collection("timetableCache")
            .doc(date)
            .set({
              retrievalDate: Math.floor(new Date().getTime() / 1000.0),
              periodCount: timetableJsonResponse["data"]["classes"].length,
            });
        }

        const todaySchedule: period[] = [];

        for (let classIndex = 0; classIndex < classes.length; classIndex++) {
          const today = timetableJsonResponse["data"]["classes"][classIndex];

          const detailedName = today["description"];
          let subjectName = detailedName.toLowerCase();

          subjectName = subjectName
            .split(" - ")[0]
            .replace(/ [W|C]\d\d?/gm, "")
            .replace(/ S1| S2/, "")
            .replace(/ \([Yr]\d\d?\)/gm, "")
            .replace(/ \(Yr \d\d?\)/, "")
            .replace(/\d\d?\w /gm, "")
            .replace(/\d\d? /gm, "")
            .replace(/ Music_ensembles/gm, "")
            .replace(/ \(Wh\)| \(Ca\)| \(CC\)| \(WH\)| \(Cc\)/, "");

          today["description"] = subjectName;
          today["detailedName"] = detailedName;

          const periodData: period = {
            periodCode: today["title"],
            periodColour: today["colour"],
            periodEnd: today["endTime"],
            periodName: toTitleCase(today["description"]),
            periodOrder: today["periodName"],
            periodRoom: today["room"],
            periodStaff: today["teacherName"],
            periodStart: today["startTime"],
          };

          todaySchedule.push(periodData);
        }
        if (typeof date === "string") {
          await db
            .collection("users")
            .doc(username)
            .collection("timetableCache")
            .doc(date)
            .update({
              periods: todaySchedule,
            })
            .then(function () {
              res.status(200);
              res.end();
            });
        }
      }
    } else {
      res.status(403).json({
        error:
          "Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife",
      });
    }
  });

function getTimetableResponse(
  token: string,
  userID: string,
  startDate: string,
  endDate: string
): Promise<Response> {
  return fetch("https://life-api.caulfieldlife.com.au/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-AU,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
      authorization: "Bearer X-ae97a16a-3e28-4365:Y-53e74b38-8a53-4ef7",
      "content-type": "application/json",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-community-token": token,
    },
    referrer: "https://caulfieldlife.com.au/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `{\"operationName\":\"ClassData\",\"variables\":{\"startTime\":\"${startDate}\",\"endTime\":\"${endDate}\",\"memberId\":\"${userID}\"},\"query\":\"fragment ClassFields on Class {\\n  id\\n  title\\n  description\\n  startTime\\n  endTime\\n  dayOrder\\n  periodOrder\\n  periodName\\n  colour\\n  room\\n  teacherName\\n  __typename\\n}\\n\\nquery ClassData($memberId: ID!, $startTime: DateTime!, $endTime: DateTime) {\\n  classes(where: {startTime: $startTime, endTime: $endTime, memberId: $memberId}, orderBy: {property: \\\"startTime\\\", sort: ASC}) {\\n    ...ClassFields\\n    __typename\\n  }\\n}\\n\"}`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

function toTitleCase(str:string) {
  return str.replace(/\w\S*/g, function(txt:string) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
