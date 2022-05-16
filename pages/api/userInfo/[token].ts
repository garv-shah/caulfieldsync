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
        "body": `{\"operationName\":\"GetSessionByJwt\",\"variables\":{\"jwtToken\":\"${token}\"},\"query\":\"query GetSessionByJwt($jwtToken: String!) {\\n  sessionByJwt(jwtIdToken: $jwtToken) {\\n    id\\n    processedAt\\n    isImpersonating\\n    xhqToken\\n    member {\\n      id\\n      firstName\\n      lastName\\n      preferredName\\n      roles {\\n        title\\n        __typename\\n      }\\n      __typename\\n    }\\n    sessionSyncCheckpoints {\\n      success\\n      type\\n      error\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}`,
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

    // @ts-ignore
    if (jsonResponse['data']['sessionByJwt'] != null) {
        res.status(response.status).json({
            // @ts-ignore
            "member": jsonResponse['data']['sessionByJwt']['member'],
            // @ts-ignore
            "xhqToken": jsonResponse['data']['sessionByJwt']['xhqToken']
        })
    } else {
        res.status(403).json({ error: 'Invalid Token Provided. Please make sure you have the correct user token from CaulfieldLife' })
    }
}