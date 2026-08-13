import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getViewingHistory,
    markAsPlanned,
    removeFromWatchlist
} from "../services/watchlistService";

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


function ViewingHistory() {

    const { currentUser } = useAuth();

    const [movies, setMovies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==========================================
    // LOAD VIEWING HISTORY
    // ==========================================

    async function loadHistory() {

        if (!currentUser) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            const data =
                await getViewingHistory(
                    currentUser.uid
                );

            setMovies(
                data || []
            );

        } catch (error) {

            console.error(
                "Unable to load viewing history:",
                error
            );

            setError(
                "Unable to load your viewing history."
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        if (currentUser) {
            loadHistory();
        }

    }, [currentUser]);


    // ==========================================
    // MARK AS PLANNED
    // ==========================================

    async function handleMarkAsPlanned(
        movieId
    ) {

        try {

            setError("");

            await markAsPlanned(
                currentUser.uid,
                movieId
            );


            // Remove from history immediately
            // because it is no longer watched.
            setMovies(
                (currentMovies) =>
                    currentMovies.filter(
                        (movie) =>
                            movie.id !==
                            String(movieId)
                    )
            );

        } catch (error) {

            console.error(
                "Unable to mark movie as planned:",
                error
            );

            setError(
                "Unable to update movie status."
            );

        }

    }


    // ==========================================
    // REMOVE MOVIE
    // ==========================================

    async function handleRemove(
        movieId
    ) {

        const confirmed =
            window.confirm(
                "Remove this movie from your history and watchlist?"
            );

        if (!confirmed) {
            return;
        }


        try {

            setError("");

            await removeFromWatchlist(
                currentUser.uid,
                movieId
            );


            setMovies(
                (currentMovies) =>
                    currentMovies.filter(
                        (movie) =>
                            movie.id !==
                            String(movieId)
                    )
            );

        } catch (error) {

            console.error(
                "Unable to remove movie:",
                error
            );

            setError(
                "Unable to remove movie."
            );

        }

    }


    // ==========================================
    // FORMAT WATCHED DATE
    // ==========================================

    function formatWatchedDate(
        watchedAt
    ) {

        if (
            !watchedAt ||
            !watchedAt.toDate
        ) {
            return "Watch date unavailable";
        }


        return watchedAt
            .toDate()
            .toLocaleDateString(
                undefined,
                {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <main className="history-page">

                <div className="page-message">

                    <p>
                        Loading viewing history...
                    </p>

                </div>

            </main>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main className="history-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <section className="history-header">

                <p className="history-eyebrow">
                    YOUR HISTORY
                </p>

                <h1>
                    Viewing History
                </h1>

                <p>
                    Movies you've marked as
                    watched, ordered from most
                    recent to oldest.
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
                movies.length === 0 && (

                    <section className="history-empty">

                        <div className="history-empty-icon">
                            🎞️
                        </div>

                        <h2>
                            No watched movies yet
                        </h2>

                        <p>
                            Mark movies in your
                            watchlist as watched and
                            they'll appear here.
                        </p>

                        <Link to="/watchlist">
                            Go to My Watchlist →
                        </Link>

                    </section>

                )}


            {/* ==========================================
                HISTORY
            ========================================== */}

            {movies.length > 0 && (

                <section>

                    <div className="history-section-heading">

                        <h2>
                            Watched Movies
                        </h2>

                        <span>
                            {movies.length}{" "}
                            {movies.length === 1
                                ? "movie"
                                : "movies"}
                        </span>

                    </div>


                    <div className="history-grid">

                        {movies.map(
                            (movie) => (

                                <article
                                    key={movie.id}
                                    className="history-card"
                                >

                                    {/* POSTER */}

                                    {movie.posterPath ? (

                                        <img
                                            src={`${IMAGE_BASE_URL}${movie.posterPath}`}
                                            alt={`${movie.title} poster`}
                                        />

                                    ) : (

                                        <div className="history-placeholder">

                                            No poster available

                                        </div>

                                    )}


                                    {/* CONTENT */}

                                    <div className="history-card-content">

                                        <h3>
                                            {movie.title}
                                        </h3>


                                        {movie.releaseDate && (

                                            <p className="history-release-date">

                                                Released:{" "}
                                                {movie.releaseDate}

                                            </p>

                                        )}


                                        <p className="history-watched-date">

                                            Watched:{" "}
                                            {formatWatchedDate(
                                                movie.watchedAt
                                            )}

                                        </p>


                                        <Link
                                            to={`/movies/${movie.movieId}`}
                                            className="history-movie-link"
                                        >
                                            View Movie →
                                        </Link>


                                        <button
                                            className="history-planned-button"
                                            onClick={() =>
                                                handleMarkAsPlanned(
                                                    movie.id
                                                )
                                            }
                                        >
                                            Mark as Planned
                                        </button>


                                        <button
                                            className="history-remove-button"
                                            onClick={() =>
                                                handleRemove(
                                                    movie.id
                                                )
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </section>

            )}

        </main>

    );

}


export default ViewingHistory;