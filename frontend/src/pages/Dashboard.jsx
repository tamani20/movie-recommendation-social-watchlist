import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";

import {
    getRecommendations
} from "../services/recommendationService";

import { Link } from "react-router-dom";


function Dashboard() {

    const {
        currentUser,
        logout
    } = useAuth();

    const [profile, setProfile] =
        useState(null);

    const [recommendations, setRecommendations] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [recommendationLoading, setRecommendationLoading] =
        useState(true);


    useEffect(() => {

        async function loadDashboard() {

            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {

                // ==================================
                // LOAD USER PROFILE
                // ==================================

                const userProfile =
                    await getUserProfile(
                        currentUser.uid
                    );

                setProfile(
                    userProfile
                );


                // ==================================
                // LOAD RECOMMENDATIONS
                // ==================================

                const userRecommendations =
                    await getRecommendations(
                        currentUser.uid
                    );

                console.log(
                    "Recommendations:",
                    userRecommendations
                );

                setRecommendations(
                    userRecommendations
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
        }

        loadDashboard();

    }, [currentUser]);


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

            {/* ==================================
                USER INFORMATION
            ================================== */}

            <h1>
                Dashboard
            </h1>


            {profile && (
                <>
                    <h2>
                        Welcome,{" "}
                        {profile.displayName}!
                    </h2>

                    <p>
                        Email:{" "}
                        {profile.email}
                    </p>

                    <p>
                        Account type:{" "}
                        {profile.role}
                    </p>
                </>
            )}


            {/* ==================================
                RECOMMENDATIONS
            ================================== */}

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


            {/* ==================================
                GENERAL NAVIGATION
            ================================== */}

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


            {/* ==================================
                LOGOUT
            ================================== */}

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