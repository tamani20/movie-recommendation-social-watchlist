import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getUserProfile
} from "../services/userService";

import {
    getRecommendations
} from "../services/recommendationService";

import {
    getFriends,
    getUserProfile as getFriendProfile
} from "../services/friendService";

import {
    getFriendActivity
} from "../services/activityService";


function Dashboard() {

    const {
        currentUser,
        logout
    } = useAuth();


    // ==========================================
    // STATE
    // ==========================================

    const [profile, setProfile] =
        useState(null);

    const [recommendations, setRecommendations] =
        useState([]);

    const [friendActivity, setFriendActivity] =
        useState([]);


    const [loading, setLoading] =
        useState(true);

    const [recommendationLoading, setRecommendationLoading] =
        useState(true);

    const [activityLoading, setActivityLoading] =
        useState(true);


    const [activityError, setActivityError] =
        useState("");


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {

        async function loadDashboard() {

            if (!currentUser) {

                setLoading(false);

                setRecommendationLoading(false);

                setActivityLoading(false);

                return;
            }


            // ==========================================
            // LOAD PROFILE + RECOMMENDATIONS
            // ==========================================

            try {

                const userProfile =
                    await getUserProfile(
                        currentUser.uid
                    );


                setProfile(
                    userProfile
                );


                const userRecommendations =
                    await getRecommendations(
                        currentUser.uid
                    );


                console.log(
                    "Recommendations:",
                    userRecommendations
                );


                setRecommendations(
                    userRecommendations || []
                );


            } catch (error) {

                console.error(
                    "Failed to load dashboard:",
                    error
                );


            } finally {

                setLoading(false);

                setRecommendationLoading(false);

            }


            // ==========================================
            // LOAD FRIEND ACTIVITY
            // ==========================================

            try {

                setActivityLoading(true);

                setActivityError("");


                // Get current user's friends.
                const friends =
                    await getFriends(
                        currentUser.uid
                    );


                const friendIds =
                    friends.map(
                        (friend) =>
                            friend.friendId
                    );


                // No friends means there cannot
                // be friend activity.
                if (
                    friendIds.length === 0
                ) {

                    setFriendActivity([]);

                    return;
                }


                // Get combined review +
                // watchlist activity.
                const activity =
                    await getFriendActivity(
                        friendIds
                    );


                // ==========================================
                // GET UNIQUE ACTIVITY USER IDS
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


                // ==========================================
                // LOAD EACH PROFILE ONLY ONCE
                // ==========================================

                const profiles =
                    await Promise.all(
                        uniqueFriendIds.map(
                            async (friendId) => {

                                const friendProfile =
                                    await getFriendProfile(
                                        friendId
                                    );


                                return {
                                    id: friendId,
                                    profile:
                                    friendProfile
                                };

                            }
                        )
                    );


                // ==========================================
                // CREATE PROFILE LOOKUP MAP
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
                // ATTACH FRIEND NAMES
                // ==========================================

                const activityWithProfiles =
                    activity.map(
                        (item) => ({

                            ...item,

                            friendName:
                                profileMap[
                                    item.userId
                                    ]?.displayName ||
                                "Friend"

                        })
                    );


                setFriendActivity(
                    activityWithProfiles
                );


            } catch (activityLoadError) {

                console.error(
                    "Failed to load friend activity:",
                    activityLoadError
                );


                setFriendActivity([]);


                setActivityError(
                    "Unable to load friend activity."
                );


            } finally {

                setActivityLoading(false);

            }

        }


        loadDashboard();

    }, [currentUser]);


    // ==========================================
    // FORMAT ACTIVITY TIME
    // ==========================================

    function formatActivityTime(
        timestamp
    ) {

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


        const minutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        const hours =
            Math.floor(
                minutes / 60
            );


        const days =
            Math.floor(
                hours / 24
            );


        if (minutes < 1) {

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
    // LOGOUT
    // ==========================================

    async function handleLogout() {

        try {

            await logout();

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        }

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <main>

                <p>
                    Loading dashboard...
                </p>

            </main>

        );

    }


    // ==========================================
    // DASHBOARD
    // ==========================================

    return (

        <main>

            {/* ==========================================
                DASHBOARD HERO
                ========================================== */}

            <section className="dashboard-hero">

                <div className="dashboard-hero-content">

                    <p className="dashboard-eyebrow">
                        YOUR DASHBOARD
                    </p>


                    <h1>

                        Welcome
                        {profile?.displayName
                            ? `, ${profile.displayName}`
                            : ""}
                        !

                    </h1>


                    <p className="dashboard-hero-description">

                        Discover personalized movies,
                        keep up with your friends, and
                        manage your movie experience.

                    </p>


                    {profile.role && (

                        <div className="dashboard-role">
                {profile.role}
            </div>

                    )}

                    {profile && (

                        <span className="dashboard-profile-meta">

                            {profile.email && (

                                <span>
                {profile.email}
            </span>

                            )}

                        </span>

                    )}

                </div>

            </section>


            {/* ==========================================
                RECOMMENDATIONS
            ========================================== */}

            <hr />


            <h2>
                Recommended For You
            </h2>


            <p>
                Movies selected based on
                your ratings and activity.
            </p>


            {recommendationLoading ? (

                <p>
                    Loading recommendations...
                </p>

            ) : recommendations.length === 0 ? (

                <p>

                    We don't have enough activity
                    to make recommendations yet.
                    Rate or review some movies to
                    get personalized recommendations.

                </p>

            ) : (

                <section>

                    {recommendations.map(
                        (movie) => {

                            const posterUrl =
                                movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                    : null;


                            return (

                                <article
                                    key={movie.id}
                                    style={{
                                        display:
                                            "inline-block",
                                        verticalAlign:
                                            "top",
                                        width:
                                            "200px",
                                        margin:
                                            "10px",
                                        padding:
                                            "10px",
                                        border:
                                            "1px solid #ccc",
                                        borderRadius:
                                            "8px"
                                    }}
                                >

                                    {posterUrl && (

                                        <img
                                            src={
                                                posterUrl
                                            }
                                            alt={
                                                `${movie.title} poster`
                                            }
                                            width="180"
                                            height="270"
                                            style={{
                                                objectFit:
                                                    "cover"
                                            }}
                                        />

                                    )}


                                    <h3>
                                        {movie.title}
                                    </h3>


                                    <p>

                                        Rating:{" "}

                                        {typeof movie.vote_average ===
                                        "number"
                                            ? movie.vote_average.toFixed(
                                                1
                                            )
                                            : "N/A"}

                                    </p>


                                    <p>

                                        Release:{" "}

                                        {movie.release_date ||
                                            "Unknown"}

                                    </p>


                                    <Link
                                        to={`/movies/${movie.id}`}
                                    >
                                        View Details
                                    </Link>

                                </article>

                            );

                        }
                    )}

                </section>

            )}


            {/* ==========================================
                FRIEND ACTIVITY
            ========================================== */}

            <hr />


            <section className="dashboard-activity">

                <div
                    className="dashboard-section-heading"
                >

                    <div>

                        <h2>
                            Recent Friend Activity
                        </h2>


                        <p>
                            See what your friends are
                            watching, reviewing, and
                            adding to their watchlists.
                        </p>

                    </div>


                    <Link
                        to="/activity"
                        className="dashboard-view-all"
                    >
                        View All Activity →
                    </Link>

                </div>


                {activityLoading ? (

                    <div className="page-message">

                        <p>
                            Loading friend activity...
                        </p>

                    </div>

                ) : activityError ? (

                    <div className="error-message">

                        {activityError}

                    </div>

                ) : friendActivity.length === 0 ? (

                    <div className="dashboard-empty-card">

                        <p>

                            Your friends haven't had
                            any recent movie activity
                            yet.

                        </p>


                        <Link to="/friends">
                            Find Friends →
                        </Link>

                    </div>

                ) : (

                    <div
                        className="dashboard-activity-list"
                    >

                        {friendActivity
                            .slice(0, 5)
                            .map(
                                (activity) => (

                                    <article
                                        key={`${activity.type}-${activity.userId}-${activity.id}`}
                                        className="dashboard-activity-card"
                                    >

                                        {/* ACTIVITY ICON */}

                                        <div className="dashboard-activity-icon">

                                            {activity.type === "review"
                                                ? "⭐"
                                                : activity.type === "watched"
                                                    ? "✅"
                                                    : "🎬"}

                                        </div>


                                        {/* ACTIVITY CONTENT */}

                                        <div
                                            className="dashboard-activity-content"
                                        >


                                            {activity.type === "review" ? (

                                                // ==========================================
                                                // REVIEW ACTIVITY
                                                // ==========================================

                                                <>

                                                    <h3>

                                                        {activity.friendName}
                                                        {" reviewed "}
                                                        {activity.movieTitle}

                                                    </h3>


                                                    <p className="dashboard-activity-time">

                                                        {formatActivityTime(
                                                            activity.createdAt
                                                        )}

                                                    </p>


                                                    <p className="dashboard-activity-rating">

                                                        ★{" "}
                                                        {activity.rating}
                                                        /5

                                                    </p>


                                                    {activity.review && (

                                                        <p className="dashboard-activity-review">

                                                            {activity.review}

                                                        </p>

                                                    )}

                                                </>


                                            ) : activity.type === "watched" ? (

                                                // ==========================================
                                                // WATCHED ACTIVITY
                                                // ==========================================

                                                <>

                                                    <h3>

                                                        {activity.friendName}
                                                        {" watched "}
                                                        {activity.movieTitle}

                                                    </h3>


                                                    <p className="dashboard-activity-time">

                                                        {formatActivityTime(
                                                            activity.createdAt
                                                        )}

                                                    </p>

                                                </>


                                            ) : (

                                                // ==========================================
                                                // WATCHLIST ACTIVITY
                                                // ==========================================

                                                <>

                                                    <h3>

                                                        {activity.friendName}
                                                        {" added "}
                                                        {activity.movieTitle}
                                                        {" to their watchlist"}

                                                    </h3>


                                                    <p className="dashboard-activity-time">

                                                        {formatActivityTime(
                                                            activity.createdAt
                                                        )}

                                                    </p>

                                                </>

                                            )}


                                            <Link
                                                to={`/movies/${activity.movieId}`}
                                            >
                                                View Movie →
                                            </Link>

                                        </div>

                                    </article>

                                )
                            )}

                    </div>

                )}

            </section>


            {/* ==========================================
                GENERAL NAVIGATION
            ========================================== */}

            <hr />


            <h2>
                Movie Recommendation &
                Social Watchlist
            </h2>


            <p>

                Explore movies, manage your
                watchlist, read reviews, and
                connect with friends.

            </p>


            <p>

                <Link to="/movies">
                    Browse Movies
                </Link>

            </p>


            <p>

                <Link to="/watchlist">
                    My Watchlist
                </Link>

            </p>


            <p>

                <Link to="/friends">
                    My Friends
                </Link>

            </p>


            {/* ==========================================
                LOGOUT
            ========================================== */}

            <button
                onClick={
                    handleLogout
                }
            >
                Logout
            </button>

        </main>

    );

}


export default Dashboard;