import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import {db} from "./index";

export const announcement = functions.region("australia-southeast1")
    .firestore.document("announcements/{docId}")
    .onCreate(async (snap, context) => {
      const announcementData = snap.data();

      await db.collection("users").get().then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          await db.collection("users")
          .doc(doc.id).collection("announcements")
          .doc(`${context.params.docId}`).set({
            title: announcementData["title"],
            body: announcementData["body"],
            sender: announcementData["sender"],
            senderPFP: announcementData["senderPFP"],
            timestamp: announcementData["timestamp"],
          });
        });
      });

      const message = {
        notification: {
          title: announcementData["title"],
          body: announcementData["body"],
        },
        topic: "allUsers",
      };

      // Send a message to devices subscribed to the provided topic.
      await firebase.messaging().send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });

      console.log(`Announcement: ${context.params.docId} - Created Success`);
    });
