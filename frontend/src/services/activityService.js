import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "firebase/firestore";

import { db } from "./firebase";


// ==========================================
// GET FRIEND ACTIVITY
// ==========================================

export async function getFriendActivity(
    friendIds
) {

    if (
        !friendIds ||
        friendIds.length === 0
    ) {
        return [];
    }


    // ==========================================
    // LOAD REVIEWS
    // ==========================================

    const reviewsCollection =
        collection(
            db,
            "reviews"
        );

    const reviewPromises =
        friendIds.map(
            async (friendId) => {

                const reviewsQuery =
                    query(
                        reviewsCollection,
                        where(
                            "userId",
                            "==",
                            friendId
                        ),
                        orderBy(
                            "createdAt",
                            "desc"
                        )
                    );

                const snapshot =
                    await getDocs(
                        reviewsQuery
                    );

                return snapshot.docs.map(
                    (document) => {

                        const data =
                            document.data();

                        return {
                            id: document.id,

                            type: "review",

                            userId:
                            friendId,

                            movieId:
                            data.movieId,

                            movieTitle:
                            data.movieTitle,

                            rating:
                            data.rating,

                            review:
                            data.review,

                            createdAt:
                            data.createdAt
                        };

                    }
                );
            }
        );


    // ==========================================
    // LOAD WATCHLISTS
    // ==========================================

    const watchlistPromises =
        friendIds.map(
            async (friendId) => {

                const watchlistCollection =
                    collection(
                        db,
                        "users",
                        friendId,
                        "watchlist"
                    );

                const snapshot =
                    await getDocs(
                        watchlistCollection
                    );

                return snapshot.docs.map(
                    (document) => {

                        const data =
                            document.data();

                        return {
                            id: document.id,

                            type:
                                "watchlist",

                            userId:
                            friendId,

                            movieId:
                            data.movieId,

                            movieTitle:
                            data.title,

                            posterPath:
                            data.posterPath,

                            releaseDate:
                            data.releaseDate,

                            createdAt:
                            data.addedAt
                        };

                    }
                );
            }
        );


    const [
        reviewResults,
        watchlistResults
    ] = await Promise.all([
        Promise.all(
            reviewPromises
        ),
        Promise.all(
            watchlistPromises
        )
    ]);


    // ==========================================
    // COMBINE ACTIVITY
    // ==========================================

    const reviews =
        reviewResults.flat();

    const watchlist =
        watchlistResults.flat();


    const activity = [
        ...reviews,
        ...watchlist
    ];

// ==========================================
// SORT NEWEST → OLDEST
// ==========================================

    activity.sort(
        (a, b) => {

            const dateA =
                a.createdAt?.toMillis
                    ? a.createdAt.toMillis()
                    : 0;

            const dateB =
                b.createdAt?.toMillis
                    ? b.createdAt.toMillis()
                    : 0;

            return dateB - dateA;
        }
    );


// ==========================================
// REMOVE LEGACY DUPLICATE REVIEWS
// ==========================================

    const seenReviews =
        new Set();

    const cleanedActivity =
        activity.filter(
            (item) => {

                if (
                    item.type !== "review"
                ) {
                    return true;
                }

                const reviewKey =
                    `${item.userId}-${item.movieId}`;

                if (
                    seenReviews.has(
                        reviewKey
                    )
                ) {
                    return false;
                }

                seenReviews.add(
                    reviewKey
                );

                return true;
            }
        );


    return cleanedActivity;
}