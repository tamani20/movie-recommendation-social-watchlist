import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";


// ==========================================
// CREATE USER PROFILE
// ==========================================

export async function createUserProfile(
    userId,
    email,
    displayName
) {

    const userRef =
        doc(
            db,
            "users",
            userId
        );


    await setDoc(
        userRef,
        {
            email:
            email,

            displayName:
            displayName,

            role:
                "user",

            bio:
                "",

            avatar:
                "🎬",

            createdAt:
                serverTimestamp()
        }
    );

}


// ==========================================
// GET USER PROFILE
// ==========================================

export async function getUserProfile(
    userId
) {

    if (!userId) {
        return null;
    }


    const userRef =
        doc(
            db,
            "users",
            userId
        );


    const userSnapshot =
        await getDoc(
            userRef
        );


    if (
        !userSnapshot.exists()
    ) {
        return null;
    }


    return {
        id:
        userSnapshot.id,

        ...userSnapshot.data()
    };

}


// ==========================================
// UPDATE USER PROFILE
// ==========================================

export async function updateUserProfile(
    userId,
    profileData
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    const displayName =
        profileData.displayName
            ?.trim();

    const bio =
        profileData.bio
            ?.trim() || "";

    const avatar =
        profileData.avatar ||
        "🎬";


    if (!displayName) {

        throw new Error(
            "Display name is required."
        );

    }


    if (
        displayName.length > 50
    ) {

        throw new Error(
            "Display name must be 50 characters or fewer."
        );

    }


    if (
        bio.length > 300
    ) {

        throw new Error(
            "Bio must be 300 characters or fewer."
        );

    }


    const userRef =
        doc(
            db,
            "users",
            userId
        );


    await updateDoc(
        userRef,
        {
            displayName,
            bio,
            avatar,

            updatedAt:
                serverTimestamp()
        }
    );

}