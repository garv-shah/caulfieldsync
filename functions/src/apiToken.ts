import * as functions from "firebase-functions";
import * as puppeteer from "puppeteer";
import {RuntimeOptions} from "firebase-functions";
import {db} from "./index";

const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: "1GB",
};

export const apiToken = functions
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

              try {
                if (typeof username === "string") {
                  db.collection("calendar").doc(username).set({
                    username: username,
                  }).then(function() {
                    res.status(200).json({
                      token: auth,
                    });
                  });
                }
              } catch (err) {
                res.status(401).json({
                  error: err,
                });
              }
            }
          });

          // login process
          await page.goto("https://life-api.caulfieldlife.com.au/MsGraph/login");
            const navigationPromise = page.waitForNavigation()

            if (username != null) {
                await page.waitForSelector('[name="loginfmt"]')
                await page.type('[name="loginfmt"]', `${username}@caulfieldgs.vic.edu.au`)
                await page.click('[type="submit"]')
            }
            if (password != null) {
                await navigationPromise
                await page.waitForSelector('input[type="password"]', { visible: true })
                await page.type('input[type="password"]', password)
                await new Promise(r => setTimeout(r, 500));
                await page.keyboard.press('Enter')

                await navigationPromise
            }

          try {
            // if the selector doesn't pop up after 5 seconds, it probably means
            // it said that the password was incorrect and didn't go to the
            // Microsoft login page
              await page.keyboard.press('Enter')
            await page.waitForSelector('[type="submit"]', {timeout: 5000});
            await page.click('[type="submit"]');
          } catch (error) {
            await browser.close();
            res.status(401).json({
              // eslint-disable-next-line max-len
              error: "Authorisation failed. Make sure you have typed in your username and password correctly!",
            });
          }
        })();
      }
    });
