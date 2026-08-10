import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export async function createUserProfile(
    userId,
    email,
    displayName
) {
    const userRef = doc(db, "users", userId);

    await setDoc(userRef, {
        email: email,
        displayName: displayName,
        role: "user",
        createdAt: serverTimestamp()
    });
}

export async function getUserProfile(userId) {
    const userRef = doc(db, "users", userId);

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        return null;
    }

    return {
        id: userSnapshot.id,
        ...userSnapshot.data()
    };
}