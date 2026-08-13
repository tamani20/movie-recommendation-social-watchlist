import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getFriends,
    getUserProfile
} from "../services/friendService";

import {
    getFriendActivity
} from "../services/activityService";


function FriendActivity() {

    const { currentUser } = useAuth();


    // ==========================================
    // STATE
    // ==========================================

    const [activities, setActivities] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==========================================
    // FORMAT ACTIVITY TIME
    // ==========================================

    function formatActivityTime(timestamp) {

        if (
            !timestamp ||
            !timestamp.toDate
        ) {
            return "";
        }


        const activityDate =
            timestamp.toDate();

        const now =
            new Date();

        const difference =
            now.getTime() -
            activityDate.getTime();

        const seconds =
            Math.floor(
                difference / 1000
            );

        const minutes =
            Math.floor(
                seconds / 60
            );

        const hours =
            Math.floor(
                minutes / 60
            );

        const days =
            Math.floor(
                hours / 24
            );


        if (seconds < 60) {
            return "Just now";
        }

        if (minutes < 60) {

            return `${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }

        if (hours < 24) {

            return `${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }

        if (days === 1) {
            return "Yesterday";
        }

        if (days < 7) {

            return `${days} days ago`;

        }


        return activityDate.toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    }


    // ==========================================
    // LOAD FRIEND ACTIVITY
    // ==========================================

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


                // ==========================================
                // NO FRIENDS
                // ==========================================

                if (
                    !friends ||
                    friends.length === 0
                ) {

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
                // GET ALL FRIEND ACTIVITY
                // ==========================================

                const activity =
                    await getFriendActivity(
                        friendIds
                    );


                // ==========================================
                // LOAD FRIEND PROFILES
                // ==========================================

                const uniqueFriendIds =
                    [
                        ...new Set(
                            activity.map(
                                (item) =>
                                    item.userId
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


                // ==========================================
                // CREATE PROFILE MAP
                // ==========================================

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
                    activity.map(
                        (item) => ({

                            ...item,

                            profile:
                                profileMap[
                                    item.userId
                                    ]

                        })
                    );


                setActivities(
                    activityData
                );


            } catch (activityError) {

                console.error(
                    "Unable to load friend activity:",
                    activityError
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
    // WAIT FOR AUTHENTICATION
    // ==========================================

    if (!currentUser) {

        return (
            <main>

                <p>
                    Loading...
                </p>

            </main>
        );

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <main>

                <section>

                    <h1>
                        Friend Activity
                    </h1>

                    <p>
                        Loading friend activity...
                    </p>

                </section>

            </main>
        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main>

            {/* ==========================================
                HEADER
            ========================================== */}

            <section>

                <h1>
                    Friend Activity
                </h1>

                <p>
                    See what your friends are
                    watching, reviewing, and adding
                    to their watchlists.
                </p>

            </section>


            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* ==========================================
                EMPTY STATE
            ========================================== */}

            {!error &&
                activities.length === 0 && (

                    <section className="card">

                        <h2>
                            No activity yet
                        </h2>

                        <p>
                            Your friends haven't had
                            any recent movie activity
                            yet.
                        </p>

                        <p>
                            When they review a movie,
                            add one to their watchlist,
                            or mark one as watched,
                            you'll see it here.
                        </p>

                    </section>

                )}


            {/* ==========================================
                ACTIVITY LIST
            ========================================== */}

            {activities.length > 0 && (

                <section className="friend-activity-list">

                    {activities.map(
                        (activity) => {

                            const friendName =
                                activity.profile
                                    ?.displayName ||
                                "Friend";


                            const timestamp =
                                formatActivityTime(
                                    activity.createdAt
                                );


                            // ==================================
                            // REVIEW ACTIVITY
                            // ==================================

                            if (
                                activity.type ===
                                "review"
                            ) {

                                return (

                                    <article
                                        key={`${activity.type}-${activity.userId}-${activity.id}`}
                                        className="card friend-activity-card"
                                    >

                                        <div className="friend-activity-header">

                                            <span
                                                className="friend-activity-icon"
                                                aria-hidden="true"
                                            >
                                                ⭐
                                            </span>

                                            <div>

                                                <h3>
                                                    {friendName}
                                                    {" "}
                                                    reviewed{" "}
                                                    {activity.movieTitle}
                                                </h3>

                                                {timestamp && (

                                                    <p className="friend-activity-time">

                                                        {timestamp}

                                                    </p>

                                                )}

                                            </div>

                                        </div>


                                        <div className="friend-activity-content">

                                            <p className="friend-activity-rating">

                                                <strong>
                                                    ★{" "}
                                                    {activity.rating}
                                                    /5
                                                </strong>

                                            </p>


                                            {activity.review && (

                                                <p className="friend-activity-review">

                                                    {activity.review}

                                                </p>

                                            )}

                                        </div>


                                        <Link
                                            to={`/movies/${activity.movieId}`}
                                            className="friend-activity-link"
                                        >
                                            View Movie →
                                        </Link>

                                    </article>

                                );

                            }


                            // ==================================
                            // WATCHLIST ACTIVITY
                            // ==================================

                            if (
                                activity.type ===
                                "watchlist"
                            ) {

                                return (

                                    <article
                                        key={`${activity.type}-${activity.userId}-${activity.id}`}
                                        className="card friend-activity-card"
                                    >

                                        <div className="friend-activity-header">

                                            <span
                                                className="friend-activity-icon"
                                                aria-hidden="true"
                                            >
                                                🎬
                                            </span>

                                            <div>

                                                <h3>
                                                    {friendName}
                                                    {" "}
                                                    added{" "}
                                                    {activity.movieTitle}
                                                    {" "}
                                                    to their watchlist
                                                </h3>

                                                {timestamp && (

                                                    <p className="friend-activity-time">

                                                        {timestamp}

                                                    </p>

                                                )}

                                            </div>

                                        </div>


                                        <Link
                                            to={`/movies/${activity.movieId}`}
                                            className="friend-activity-link"
                                        >
                                            View Movie →
                                        </Link>

                                    </article>

                                );

                            }

                            // ==================================
// WATCHED ACTIVITY
// ==================================

                            if (
                                activity.type ===
                                "watched"
                            ) {

                                return (

                                    <article
                                        key={`${activity.type}-${activity.userId}-${activity.id}`}
                                        className="card friend-activity-card"
                                    >

                                        <div className="friend-activity-header">

                <span
                    className="friend-activity-icon"
                    aria-hidden="true"
                >
                    ✅
                </span>


                                            <div>

                                                <h3>
                                                    {friendName}
                                                    {" watched "}
                                                    {activity.movieTitle}
                                                </h3>


                                                {timestamp && (

                                                    <p className="friend-activity-time">

                                                        {timestamp}

                                                    </p>

                                                )}

                                            </div>

                                        </div>


                                        <Link
                                            to={`/movies/${activity.movieId}`}
                                            className="friend-activity-link"
                                        >
                                            View Movie →
                                        </Link>

                                    </article>

                                );

                            }


                            // ==================================
                            // UNKNOWN ACTIVITY TYPE
                            // ==================================

                            return null;

                        }
                    )}

                </section>

            )}

        </main>

    );

}


export default FriendActivity;