import * as firebase from "firebase-admin";

firebase.initializeApp();

import {newUser} from "./newUser";
import {token} from "./token";
import {userInfo} from "./userInfo";
import {updateTokens} from "./updateTokens";
import {updateUsers} from "./updateUsers";
import {apiToken} from "./apiToken";
import {timetable} from "./timetable";
import {announcement} from "./announcement";
import {deleteAnnouncement} from "./deleteAnnouncement";

export const db = firebase.firestore();

exports.newUser = newUser;
exports.updateUsers = updateUsers;
exports.token = token;
exports.apiToken = apiToken;
exports.userInfo = userInfo;
exports.updateTokens = updateTokens;
exports.timetable = timetable;
exports.announcement = announcement;
exports.deleteAnnouncement = deleteAnnouncement;
