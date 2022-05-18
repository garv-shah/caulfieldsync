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
        "body": "{\"operationName\":\"Me\",\"variables\":{},\"query\":\"fragment UserProfileMemberFields on Member {\\n  id\\n  address\\n  postalAddress\\n  useHomeAddress\\n  telephone {\\n    id\\n    number\\n    type\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment MeFields on Member {\\n  hasUserLoggedIn\\n  firstName\\n  lastName\\n  preferredName\\n  avatar\\n  email\\n  birthDate\\n  currentYear\\n  schoolHouse\\n  externalId\\n  aggregateCapabilities\\n  notificationSettings {\\n    absenceConfirmation\\n    inbox\\n    consent\\n    __typename\\n  }\\n  roles {\\n    id\\n    title\\n    slug\\n    capabilities\\n    __typename\\n  }\\n  relatives {\\n    id\\n    firstName\\n    lastName\\n    preferredName\\n    avatar\\n    email\\n    birthDate\\n    address\\n    aggregateCapabilities\\n    medicalInfo {\\n      medicalAuthority {\\n        authorized\\n        isDone\\n        __typename\\n      }\\n      __typename\\n    }\\n    memberConsents {\\n      id\\n      status\\n      generalConsentPolicy {\\n        type\\n        __typename\\n      }\\n      __typename\\n    }\\n    telephone {\\n      id\\n      number\\n      type\\n      __typename\\n    }\\n    currentYear\\n    schoolHouse\\n    roles {\\n      id\\n      title\\n      slug\\n      capabilities\\n      __typename\\n    }\\n    audiences {\\n      id\\n      campus\\n      role {\\n        id\\n        title\\n        slug\\n        capabilities\\n        __typename\\n      }\\n      createdAt\\n      updatedAt\\n      __typename\\n    }\\n    rollClass\\n    __typename\\n  }\\n  audiences {\\n    id\\n    campus\\n    role {\\n      id\\n      title\\n      slug\\n      capabilities\\n      __typename\\n    }\\n    createdAt\\n    updatedAt\\n    __typename\\n  }\\n  createdAt\\n  updatedAt\\n  __typename\\n}\\n\\nquery Me {\\n  me {\\n    ...UserProfileMemberFields\\n    ...MeFields\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST"
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const token: string = req.query['token'].toString()
    const response = await getResponse(token);
    const jsonResponse = await response.json()
    console.log(jsonResponse);

    // @ts-ignore
    if (jsonResponse['data']['me'] != null) {
        // @ts-ignore
        res.status(response.status).json(jsonResponse['data']['me'])
    } else {
        res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
    }
}