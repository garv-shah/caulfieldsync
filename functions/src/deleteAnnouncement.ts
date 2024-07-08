import * as functions from "firebase-functions";
import {db} from "./index";

export const deleteAnnouncement = functions.region("australia-southeast1")
    .firestore.document("announcements/{docId}")
    .onDelete(async (snap, context) => {
      const announcementData = snap.data();

      await db.collection("users").get().then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          await db.collection("users").doc(doc.id).collection("announcements").doc(`${context.params.docId}`).delete();
        });
      });

      console.log(`Announcement: ${announcementData.docID} - Deleted Successfully`);
    });
