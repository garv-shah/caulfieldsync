import * as functions from "firebase-functions";
import * as puppeteer from "puppeteer";
import fetch from "cross-fetch";
import {RuntimeOptions} from "firebase-functions";
import {db} from "./index";

const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: "1GB",
};

export const token = functions
    .runWith(runtimeOpts)
    .region("australia-southeast1")
    .https.onRequest(async (req, res) => {
      res.set("Access-Control-Allow-Origin", "*");

      if (req.method === "OPTIONS") {
        // makes CORS possible
        res.set("Access-Control-Allow-Methods", "GET");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Max-Age", "3600");
        res.status(204).send("");
      } else {
        // grabs username and password from query
        let username = req.query.username;
        if (username === undefined || username === "") {
          res.status(401).json({
            error: "You need to provide a username!",
          });
        } else {
          username = username.toString();
        }

        let password = req.query.password;
        if (password === undefined || password === "") {
          res.status(401).json({
            error: "You need to provide a password!",
          });
        } else {
          password = password.toString();
        }

        const isNew = (req.query["isNew"] ?? "null").toString();

        // creates puppeteer instance to grab token by logging in
        await (async () => {
          const browser = await puppeteer.launch({
            headless: true,
          });
          const page = await browser.newPage();
          // on requests, puppeteer will grab the headers and if the
          // "x-community-token" is bigger than 1000 characters, it is taken
          // as the token we need
          page.on("request", async (req) => {
            const auth = req.headers()["x-community-token"];
            if (auth != undefined && auth.length > 1000) {
              await browser.close();

              if (typeof username === "string") {
                if (isNew != "true") {
                  await db.collection("users").doc(username).update({
                    token: auth,
                    password: password,
                    invalidPassword: false,
                  }).then(function() {
                    // eslint-disable-next-line max-len
                    console.log(`Successfully Refreshed Token of User: ${username}`);
                    res.status(200).json({
                      token: auth,
                    });
                  });
                } else {
                  await db.collection("users").doc(username).set({
                    token: auth,
                    username: username,
                    password: password,
                  }).then(async function() {
                    await fetch(`https://australia-southeast1-schoollife-21ac3.cloudfunctions.net/userInfo?token=${auth}&username=${username}`)
                        .then(async function(userInfoResponse) {
                          if (userInfoResponse.status == 200) { // Successful Request
                            // eslint-disable-next-line max-len
                            console.log(`Successfully retrieved User Info for User: ${username}`);
                            res.status(200).json({
                              token: auth,
                            });
                          } else { // Unsuccessful Request
                            // eslint-disable-next-line max-len
                            console.log(`Failed to retrieve ${username}'s userInfo with error ${JSON.stringify(await userInfoResponse.json())}`);
                            res.status(401).json({
                              result: "User Creation Unsuccesful",
                            });
                          }
                          return await userInfoResponse.json();
                        });
                  });
                }
              }
            }
          });

          // login process
          try {
            await page.goto("https://life-api.caulfieldlife.com.au/MsGraph/login");
            await page.waitForSelector("#idSIButton9", {timeout: 5000});
            await page.keyboard.type(`${username}@caulfieldgs.vic.edu.au`);
            await page.click("#idSIButton9");
            await page.waitForSelector("#userNameInput", {timeout: 5000});
          } catch (error) {
            await browser.close();
            res.status(401).json({
              // eslint-disable-next-line max-len
              error: "Authorisation failed. Make sure you have typed in your username and password correctly!",
            });
            return;
          }

          if (password != null) {
            await page.keyboard.type(password);
          }
          await page.click("#submitButton");
          try {
            // if the selector doesn't pop up after 5 seconds, it probably means
            // it said that the password was incorrect and didn't go to the
            // Microsoft login page
            await page.waitForSelector("#idSIButton9", {timeout: 5000});
            await page.click("#idSIButton9");
          } catch (error) {
            await browser.close();
            if (typeof username === "string") {
              await db.collection("users").doc(username).update({
                invalidPassword: true,
              });
            }
            res.status(401).json({
              // eslint-disable-next-line max-len
              error: "Authorisation failed. Make sure you have typed in your username and password correctly!",
            });
            return;
          }
        })();
      }
    });
