import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getFriends,
    getUserProfile
} from "../services/friendService";

import {
    getFriendsReviews
} from "../services/reviewService";


function FriendActivity() {

    const { currentUser } = useAuth();

    const [activities, setActivities] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadActivity() {

            if (!currentUser) {
                return;
            }

            try {

                setLoading(true);
                setError("");


                // ==========================================
                // GET FRIENDS
                // ==========================================

                const friends =
                    await getFriends(
                        currentUser.uid
                    );


                if (friends.length === 0) {

                    setActivities([]);

                    return;
                }


                // ==========================================
                // GET FRIEND IDS
                // ==========================================

                const friendIds =
                    friends.map(
                        (friend) =>
                            friend.friendId
                    );


                // ==========================================
                // GET FRIEND REVIEWS
                // ==========================================

                const reviews =
                    await getFriendsReviews(
                        friendIds
                    );


                // ==========================================
                // GET FRIEND PROFILES
                // ==========================================

                const uniqueFriendIds =
                    [
                        ...new Set(
                            reviews.map(
                                (review) =>
                                    review.userId
                            )
                        )
                    ];


                const profiles =
                    await Promise.all(
                        uniqueFriendIds.map(
                            async (friendId) => {

                                const profile =
                                    await getUserProfile(
                                        friendId
                                    );

                                return {
                                    id: friendId,
                                    profile
                                };

                            }
                        )
                    );


                const profileMap =
                    Object.fromEntries(
                        profiles.map(
                            (item) => [
                                item.id,
                                item.profile
                            ]
                        )
                    );


                // ==========================================
                // COMBINE ACTIVITY + PROFILE
                // ==========================================

                const activityData =
                    reviews.map(
                        (review) => ({

                            ...review,

                            profile:
                                profileMap[
                                    review.userId
                                    ]

                        })
                    );


                setActivities(
                    activityData
                );


            } catch (error) {

                console.error(
                    "Unable to load friend activity:",
                    error
                );

                setError(
                    "Unable to load friend activity."
                );

            } finally {

                setLoading(false);

            }

        }


        loadActivity();

    }, [currentUser]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <main>

                <p>
                    Loading friend activity...
                </p>

            </main>
        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main>

            <section>

                <h1>
                    Friend Activity
                </h1>

                <p>
                    See what your friends are
                    watching and reviewing.
                </p>

            </section>


            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {!error &&
                activities.length === 0 && (

                    <section className="card">

                        <h2>
                            No activity yet
                        </h2>

                        <p>
                            Your friends haven't
                            reviewed any movies yet.
                        </p>

                    </section>

                )}


            {activities.length > 0 && (

                <section>

                    {activities.map(
                        (activity) => (

                            <article
                                key={activity.id}
                                className="review-card"
                            >

                                <h3>

                                    {activity.profile
                                            ?.displayName ||
                                        "Unknown User"}

                                    {" reviewed "}

                                    {activity.movieTitle}

                                </h3>


                                <p>

                                    ★{" "}
                                    {activity.rating}
                                    /5

                                </p>


                                <p>

                                    {activity.review}

                                </p>


                                <Link
                                    to={`/movies/${activity.movieId}`}
                                >

                                    View Movie →

                                </Link>

                            </article>

                        )
                    )}

                </section>

            )}

        </main>

    );
}


export default FriendActivity;