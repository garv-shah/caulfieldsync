import fetch, {Response} from "node-fetch";
import {NextApiRequest, NextApiResponse} from "next";


function getResponse(token: string): Promise<Response> {
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
        "body": "{\"operationName\":\"Me\",\"variables\":{},\"query\":\"fragment UserProfileMemberFields on Member {\\n  id\\n  address\\n  telephone {\\n    number\\n    type\\n  }\\n}\\n\\nfragment MeFields on Member {\\n  firstName\\n  lastName\\n  preferredName\\n  avatar\\n  email\\n  birthDate\\n  currentYear\\n  schoolHouse\\n  roles {\\n    id\\n    title\\n    slug\\n    capabilities\\n    __typename\\n  }\\n  relatives {\\n    id\\n    firstName\\n    lastName\\n    preferredName\\n    avatar\\n    email\\n    birthDate\\n    address\\n    medicalInfo {\\n      medicalAuthority {\\n        authorized\\n        isDone\\n        __typename\\n      }\\n      __typename\\n    }\\n    memberConsents {\\n      id\\n      status\\n      generalConsentPolicy {\\n        type\\n        __typename\\n      }\\n      __typename\\n    }\\n    telephone {\\n      id\\n      number\\n      type\\n      __typename\\n    }\\n    currentYear\\n    schoolHouse\\n    roles {\\n      id\\n      title\\n      slug\\n      capabilities\\n      __typename\\n    }\\n    audiences {\\n      id\\n      campus\\n      role {\\n        id\\n        title\\n        slug\\n        capabilities\\n        __typename\\n      }\\n      createdAt\\n      updatedAt\\n      __typename\\n    }\\n    rollClass\\n    __typename\\n  }\\n  audiences {\\n    id\\n    campus\\n    role {\\n      id\\n      title\\n      slug\\n      capabilities\\n      __typename\\n    }\\n    createdAt\\n    updatedAt\\n    __typename\\n  }\\n  createdAt\\n  updatedAt\\n  __typename\\n}\\n\\nquery Me {\\n  me {\\n    ...UserProfileMemberFields\\n    ...MeFields\\n    __typename\\n  }\\n}\\n\"}",
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
    const response = await getResponse(token);
    const session = await fetch("https://life-api.caulfieldlife.com.au/", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": "Bearer X-ae97a16a-3e28-4365:Y-53e74b38-8a53-4ef7",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-community-token": token,
            "Referer": "https://caulfieldlife.com.au/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{\"operationName\":\"GetSessionByJwt\",\"variables\":{\"jwtToken\":\"${token}\"},\"query\":\"query GetSessionByJwt($jwtToken: String!) {\\n  sessionByJwt(jwtIdToken: $jwtToken) {\\n    id\\n    processedAt\\n    isImpersonating\\n    xhqToken\\n    member {\\n      id\\n      firstName\\n      lastName\\n      preferredName\\n      roles {\\n        title\\n        __typename\\n      }\\n      __typename\\n    }\\n    sessionSyncCheckpoints {\\n      success\\n      type\\n      error\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}`,
        "method": "POST"
    });

    const sessionData = await session.json();

    // @ts-ignore
    const xhqToken = sessionData['data']['sessionByJwt']['xhqToken'];

    const xhqInfo = await fetch("https://prod.xhq-platform.com/graphql", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": xhqToken,
            "content-type": "application/json",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://caulfieldlife.com.au/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"operationName\":\"XHQ_Me\",\"variables\":{},\"query\":\"fragment XhqMeFields on Member {\\n  id\\n  firstName\\n  lastName\\n  avatar\\n  email\\n  channels(excludeArchived: true) {\\n    items {\\n      id\\n      name\\n      title\\n      type\\n      isArchived\\n      __typename\\n    }\\n    __typename\\n  }\\n  lastLoggedAt\\n  capabilities {\\n    items {\\n      id\\n      name\\n      __typename\\n    }\\n    __typename\\n  }\\n  roles {\\n    items {\\n      id\\n      name\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nquery XHQ_Me {\\n  me {\\n    ...XhqMeFields\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST"
    });

    const xhqData = await xhqInfo.json();

    // @ts-ignore
    const memberID = xhqData['data']['me']['id'];

    // const inbox = await fetch("https://prod.xhq-platform.com/graphql", {
    //     "headers": {
    //         "accept": "*/*",
    //         "accept-language": "en-US,en;q=0.9",
    //         "authorization": xhqToken,
    //         "content-type": "application/json",
    //         "sec-ch-ua": "\"Not)A;Brand\";v=\"24\", \"Chromium\";v=\"116\"",
    //         "sec-ch-ua-mobile": "?1",
    //         "sec-ch-ua-platform": "\"Android\"",
    //         "sec-fetch-dest": "empty",
    //         "sec-fetch-mode": "cors",
    //         "sec-fetch-site": "cross-site",
    //         "Referer": "https://caulfieldlife.com.au/",
    //         "Referrer-Policy": "strict-origin-when-cross-origin"
    //     },
    //     "body": `{\"operationName\":\"Notifications\",\"variables\":{\"memberId\":\"${memberID}\",\"status\":\"ANNOUNCEMENT\",\"limit\":10,\"pageToken\":null,\"where\":{}},\"query\":\"query Notifications($memberId: ID!, $status: String!, $limit: Int, $pageToken: String, $where: NotificationWhereInput) {\\n  notifications(memberId: $memberId, status: $status, limit: $limit, pageToken: $pageToken, where: $where) {\\n    items {\\n      id\\n      important\\n      status\\n      object {\\n        ... on Message {\\n          id\\n          title\\n          body\\n          excerpt\\n          parentId\\n          read\\n          createdBy {\\n            id\\n            firstName\\n            lastName\\n            avatar\\n            __typename\\n          }\\n          createdAt\\n          sentAt\\n          scheduledAt\\n          __typename\\n        }\\n        __typename\\n      }\\n      mergeFields {\\n        name\\n        value\\n        type\\n        __typename\\n      }\\n      __typename\\n    }\\n    nextPage\\n    __typename\\n  }\\n}\\n\"}`,
    //     "method": "POST"
    // });
    // // @ts-ignore
    // console.log((await inbox.json())['data']['notifications']['items'][0]);
    const jsonResponse = await response.json()

    // @ts-ignore
    if (jsonResponse['data']['me'] != null) {
        // @ts-ignore
        res.status(response.status).json(jsonResponse['data']['me'])
    } else {
        res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
    }
}
