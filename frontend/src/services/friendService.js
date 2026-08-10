import {
    collection,
    doc,
    getDoc,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    limit
} from "firebase/firestore";

import { db } from "./firebase";

const friendRequestsCollection = collection(
    db,
    "friendRequests"
);


// ==========================================
// SEARCH USERS
// ==========================================

export async function searchUsers(
    currentUserId,
    searchTerm
) {
    const usersCollection = collection(
        db,
        "users"
    );

    const usersQuery = query(
        usersCollection,
        limit(50)
    );

    const snapshot =
        await getDocs(usersQuery);

    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();

    return snapshot.docs
        .map((document) => ({
            id: document.id,
            ...document.data()
        }))
        .filter((user) => {
            if (user.id === currentUserId) {
                return false;
            }

            const displayName =
                user.displayName
                    ?.toLowerCase() || "";

            return displayName.includes(
                normalizedSearch
            );
        });
}


// ==========================================
// CHECK IF USERS ARE ALREADY FRIENDS
// ==========================================

export async function areFriends(
    userId,
    otherUserId
) {
    const friendshipsCollection =
        collection(
            db,
            "friendships"
        );

    const firstQuery = query(
        friendshipsCollection,
        where(
            "user1Id",
            "==",
            userId
        ),
        where(
            "user2Id",
            "==",
            otherUserId
        )
    );

    const secondQuery = query(
        friendshipsCollection,
        where(
            "user1Id",
            "==",
            otherUserId
        ),
        where(
            "user2Id",
            "==",
            userId
        )
    );

    const [
        firstSnapshot,
        secondSnapshot
    ] = await Promise.all([
        getDocs(firstQuery),
        getDocs(secondQuery)
    ]);

    return (
        !firstSnapshot.empty ||
        !secondSnapshot.empty
    );
}


// ==========================================
// SEND FRIEND REQUEST
// ==========================================

export async function sendFriendRequest(
    senderId,
    receiverId
) {
    if (senderId === receiverId) {
        throw new Error(
            "You cannot send a friend request to yourself."
        );
    }

    // Check whether they are already friends.
    const alreadyFriends =
        await areFriends(
            senderId,
            receiverId
        );

    if (alreadyFriends) {
        throw new Error(
            "You are already friends with this user."
        );
    }

    // Check whether the sender already
    // has a pending request to the receiver.
    const existingSentQuery = query(
        friendRequestsCollection,
        where(
            "senderId",
            "==",
            senderId
        ),
        where(
            "receiverId",
            "==",
            receiverId
        ),
        where(
            "status",
            "==",
            "pending"
        )
    );

    const existingSentSnapshot =
        await getDocs(
            existingSentQuery
        );

    if (!existingSentSnapshot.empty) {
        throw new Error(
            "A friend request has already been sent."
        );
    }

    // Check whether the receiver has
    // already sent a pending request
    // to the sender.
    const existingReverseQuery = query(
        friendRequestsCollection,
        where(
            "senderId",
            "==",
            receiverId
        ),
        where(
            "receiverId",
            "==",
            senderId
        ),
        where(
            "status",
            "==",
            "pending"
        )
    );

    const existingReverseSnapshot =
        await getDocs(
            existingReverseQuery
        );

    if (!existingReverseSnapshot.empty) {
        throw new Error(
            "This user has already sent you a friend request."
        );
    }

    await addDoc(
        friendRequestsCollection,
        {
            senderId,
            receiverId,
            status: "pending",
            createdAt: serverTimestamp()
        }
    );
}


// ==========================================
// GET RECEIVED FRIEND REQUESTS
// ==========================================

export async function getReceivedFriendRequests(
    userId
) {
    const requestsQuery = query(
        friendRequestsCollection,
        where(
            "receiverId",
            "==",
            userId
        ),
        where(
            "status",
            "==",
            "pending"
        )
    );

    const snapshot =
        await getDocs(requestsQuery);

    return snapshot.docs.map(
        (document) => ({
            id: document.id,
            ...document.data()
        })
    );
}


// ==========================================
// GET SENT FRIEND REQUESTS
// ==========================================

export async function getSentFriendRequests(
    userId
) {
    const requestsQuery = query(
        friendRequestsCollection,
        where(
            "senderId",
            "==",
            userId
        ),
        where(
            "status",
            "==",
            "pending"
        )
    );

    const snapshot =
        await getDocs(requestsQuery);

    return snapshot.docs.map(
        (document) => ({
            id: document.id,
            ...document.data()
        })
    );
}


// ==========================================
// ACCEPT FRIEND REQUEST
// ==========================================

export async function acceptFriendRequest(
    requestId,
    senderId,
    receiverId
) {
    const requestRef = doc(
        db,
        "friendRequests",
        requestId
    );

    const friendshipsCollection =
        collection(
            db,
            "friendships"
        );

    // Create ONE friendship document.
    await addDoc(
        friendshipsCollection,
        {
            user1Id: senderId,
            user2Id: receiverId,
            createdAt: serverTimestamp()
        }
    );

    // Mark the request as accepted.
    await updateDoc(
        requestRef,
        {
            status: "accepted"
        }
    );
}


// ==========================================
// REJECT FRIEND REQUEST
// ==========================================

export async function rejectFriendRequest(
    requestId
) {
    const requestRef = doc(
        db,
        "friendRequests",
        requestId
    );

    await updateDoc(
        requestRef,
        {
            status: "rejected"
        }
    );
}


// ==========================================
// GET FRIENDS
// ==========================================

export async function getFriends(
    userId
) {
    const friendshipsCollection =
        collection(
            db,
            "friendships"
        );

    // Find friendships where the current
    // user is user1.
    const firstQuery = query(
        friendshipsCollection,
        where(
            "user1Id",
            "==",
            userId
        )
    );

    // Find friendships where the current
    // user is user2.
    const secondQuery = query(
        friendshipsCollection,
        where(
            "user2Id",
            "==",
            userId
        )
    );

    const [
        firstSnapshot,
        secondSnapshot
    ] = await Promise.all([
        getDocs(firstQuery),
        getDocs(secondQuery)
    ]);

    const friendships = [];

    firstSnapshot.forEach(
        (document) => {
            const data =
                document.data();

            friendships.push({
                id: document.id,
                friendId: data.user2Id,
                createdAt:
                data.createdAt
            });
        }
    );

    secondSnapshot.forEach(
        (document) => {
            const data =
                document.data();

            friendships.push({
                id: document.id,
                friendId: data.user1Id,
                createdAt:
                data.createdAt
            });
        }
    );

    return friendships;
}

// ==========================================
// GET USER PROFILE
// ==========================================

export async function getUserProfile(userId) {
    console.log(
        "getUserProfile looking for:",
        userId
    );

    const userRef = doc(
        db,
        "users",
        userId
    );

    const snapshot =
        await getDoc(userRef);

    console.log(
        "Profile exists:",
        snapshot.exists()
    );

    if (!snapshot.exists()) {
        console.log(
            "No profile found for:",
            userId
        );

        return null;
    }

    const profile = {
        id: snapshot.id,
        ...snapshot.data()
    };

    console.log(
        "Profile found:",
        profile
    );

    return profile;
}

// ==========================================
// REMOVE FRIEND
// ==========================================

export async function removeFriend(
    friendshipId
) {
    const friendshipRef = doc(
        db,
        "friendships",
        friendshipId
    );

    await deleteDoc(
        friendshipRef
    );
}