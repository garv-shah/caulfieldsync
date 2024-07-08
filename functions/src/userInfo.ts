import * as functions from "firebase-functions";
import fetch from "cross-fetch";
import {db} from "./index";

export const userInfo = functions
    .region("australia-southeast1")
    .https.onRequest(async (req, res) => {
      let token = req.query.token;
      if (token === undefined) {
        res.status(401).json({
          error: "You need to provide a token!",
        });
      } else {
        token = token.toString();
      }
      let username = req.query.username;
      if (username === undefined) {
        res.status(401).json({
          error: "You need to provide a token!",
        });
      } else {
        username = username.toString();
      }

      const response = await getResponse(token!);
      const jsonResponse = await response.json();

      if (jsonResponse["data"]["me"] != null) {
        const userInfo = jsonResponse["data"]["me"];
        if (typeof username === "string") {
          db.collection("users").doc(username).update({
            token: token,
            avatar: userInfo["avatar"],
            name: userInfo["preferredName"] + " " + userInfo["lastName"],
            userType: userInfo["roles"][0]["title"],
            userID: userInfo["id"],
          }).then(function() {
            res.status(200).json(jsonResponse);
          });
        }
      } else {
        // eslint-disable-next-line max-len
        res.status(403).json({error: "Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife"});
      }
    });

// eslint-disable-next-line require-jsdoc
function getResponse(token: string): Promise<Response> {
  return fetch("https://life-api.caulfieldlife.com.au/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-AU,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
      "authorization": "Bearer X-ae97a16a-3e28-4365:Y-53e74b38-8a53-4ef7",
      "content-type": "application/json",
      // eslint-disable-next-line max-len
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-community-token": token,
      "Referer": "https://caulfieldlife.com.au/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    // eslint-disable-next-line max-len
    "body": "{\"operationName\":\"Me\",\"variables\":{},\"query\":\"fragment UserProfileMemberFields on Member {\\n  id\\n  address\\n  telephone {\\n    number\\n    type\\n  }\\n}\\n\\nfragment MeFields on Member {\\n  firstName\\n  lastName\\n  preferredName\\n  avatar\\n  email\\n  birthDate\\n  currentYear\\n  schoolHouse\\n  roles {\\n    id\\n    title\\n    slug\\n    capabilities\\n    __typename\\n  }\\n  relatives {\\n    id\\n    firstName\\n    lastName\\n    preferredName\\n    avatar\\n    email\\n    birthDate\\n    address\\n    medicalInfo {\\n      medicalAuthority {\\n        authorized\\n        isDone\\n        __typename\\n      }\\n      __typename\\n    }\\n    memberConsents {\\n      id\\n      status\\n      generalConsentPolicy {\\n        type\\n        __typename\\n      }\\n      __typename\\n    }\\n    telephone {\\n      id\\n      number\\n      type\\n      __typename\\n    }\\n    currentYear\\n    schoolHouse\\n    roles {\\n      id\\n      title\\n      slug\\n      capabilities\\n      __typename\\n    }\\n    audiences {\\n      id\\n      campus\\n      role {\\n        id\\n        title\\n        slug\\n        capabilities\\n        __typename\\n      }\\n      createdAt\\n      updatedAt\\n      __typename\\n    }\\n    rollClass\\n    __typename\\n  }\\n  audiences {\\n    id\\n    campus\\n    role {\\n      id\\n      title\\n      slug\\n      capabilities\\n      __typename\\n    }\\n    createdAt\\n    updatedAt\\n    __typename\\n  }\\n  createdAt\\n  updatedAt\\n  __typename\\n}\\n\\nquery Me {\\n  me {\\n    ...UserProfileMemberFields\\n    ...MeFields\\n    __typename\\n  }\\n}\\n\"}",
    "method": "POST",
  });
}
