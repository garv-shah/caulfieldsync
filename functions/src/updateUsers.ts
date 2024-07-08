import * as functions from "firebase-functions";
import fetch from "cross-fetch";
import {db} from "./index";

export const updateUsers = functions
    .region("australia-southeast1")
    .pubsub.schedule("0 3 * * 1")
    .timeZone("Australia/Melbourne")
    .onRun(async () => {
      const usersCollection = await db.collection("users");

      const snapshot = await usersCollection.get();
      if (snapshot.empty) {
        console.log("No Users to Update Token For");
        return;
      }
      let index = 0;
      snapshot.forEach(async (doc) => {
        const {username, token} = doc.data();
        await fetch(`https://australia-southeast1-schoollife-21ac3.cloudfunctions.net/userInfo?token=${token}&username=${username}`);
        index += 1;
        if (index === snapshot.size) {
          console.log("All User Info Updated");
        }
      });
    });
