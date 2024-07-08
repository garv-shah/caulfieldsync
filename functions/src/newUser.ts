import * as functions from "firebase-functions";
import fetch from "cross-fetch";

export const newUser = functions
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

      let password = req.query.password;
      if (password === undefined) {
        res.status(401).json({
          error: "You need to provide a password!",
        });
      } else {
        password = password.toString();
      }

      console.log(`Received Request for New User with ID: ${username}`);
      // Checking Validity of Credentials
      try {
        fetch(`https://australia-southeast1-schoollife-21ac3.cloudfunctions.net/token?username=${username}&password=${password}&isNew=true`)
            .then(async function(response) {
              if (response.status === 200) { // Successful Request
                // eslint-disable-next-line max-len
                console.log(`Successfully verified ${username}'s credentials - User Document Created`);
                res.status(200).json({
                  result: "User Creation Successful",
                });
              } else { // Unsuccessful Request
                // eslint-disable-next-line max-len
                console.log(`Failed to verify ${username}'s credentials with error ${JSON.stringify(await response.json())}`);
                res.status(401).json({
                  result: "User Creation Unsuccessful",
                });
              }
            });
      } catch (err) {
        res.status(401).json({
          error: err,
        });
        console.log(err);
      }
    });
