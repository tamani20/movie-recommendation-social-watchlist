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
                            id:
                            document.id,

                            type:
                                "review",

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
    // LOAD WATCHLIST / WATCHED ACTIVITY
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


                const activityItems = [];


                snapshot.docs.forEach(
                    (document) => {

                        const data =
                            document.data();


                        // ==================================
                        // ADDED TO WATCHLIST EVENT
                        // ==================================

                        if (data.addedAt) {

                            activityItems.push({

                                id:
                                    `${document.id}-added`,

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

                            });

                        }


                        // ==================================
                        // WATCHED EVENT
                        // ==================================

                        if (
                            data.status ===
                            "watched" &&
                            data.watchedAt
                        ) {

                            activityItems.push({

                                id:
                                    `${document.id}-watched`,

                                type:
                                    "watched",

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
                                data.watchedAt

                            });

                        }

                    }
                );


                return activityItems;

            }
        );


    // ==========================================
    // WAIT FOR ALL ACTIVITY
    // ==========================================

    const [
        reviewResults,
        watchlistResults
    ] =
        await Promise.all([

            Promise.all(
                reviewPromises
            ),

            Promise.all(
                watchlistPromises
            )

        ]);


    // ==========================================
    // FLATTEN RESULTS
    // ==========================================

    const reviews =
        reviewResults.flat();


    const movieActivity =
        watchlistResults.flat();


    // ==========================================
    // COMBINE ACTIVITY
    // ==========================================

    const activity = [

        ...reviews,
        ...movieActivity

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


            return (
                dateB -
                dateA
            );

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
                    item.type !==
                    "review"
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