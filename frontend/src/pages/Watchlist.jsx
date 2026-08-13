import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getWatchlist,
    removeFromWatchlist,
    markAsWatched,
} from "../services/watchlistService";

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

function Watchlist() {
    const {currentUser} = useAuth();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadWatchlist() {
        try {
            setLoading(true);
            setError("");

            const data =
                await getWatchlist(
                    currentUser.uid
                );

            const plannedMovies =
                data.filter(
                    (movie) =>
                        movie.status !== "watched"
                );

            setMovies(
                plannedMovies
            );

        } catch (error) {
            console.error(error);

            setError(
                "Unable to load your watchlist."
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser) {
            loadWatchlist();
        }
    }, [currentUser]);

    async function handleRemove(movieId) {

        const confirmed =
            window.confirm(
                "Remove this movie from your watchlist?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await removeFromWatchlist(
                currentUser.uid,
                movieId
            );

            setMovies((currentMovies) =>
                currentMovies.filter(
                    (movie) =>
                        movie.id !==
                        String(movieId)
                )
            );

        } catch (error) {
            console.error(error);

            setError(
                "Unable to remove movie."
            );
        }
    }

    if (loading) {
        return (
            <main className="watchlist-page">

                <div className="page-message">
                    <p>
                        Loading your watchlist...
                    </p>
                </div>

            </main>
        );
    }

    return (
        <main className="watchlist-page">

            {/* =========================
                HEADER
            ========================== */}

            <section className="watchlist-header">

                <p className="watchlist-eyebrow">
                    YOUR LIBRARY
                </p>

                <h1>My Watchlist</h1>

                <p>
                    Keep track of the movies
                    you want to watch.
                </p>

            </section>


            {/* =========================
                ERROR
            ========================== */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* =========================
                EMPTY STATE
            ========================== */}

            {!error &&
                movies.length === 0 && (

                    <section className="watchlist-empty">

                        <div className="watchlist-empty-icon">
                            🎬
                        </div>

                        <h2>
                            Your watchlist is empty
                        </h2>

                        <p>
                            Browse movies and add
                            something you want to
                            watch later.
                        </p>

                    </section>
                )}


            {/* =========================
                MOVIES
            ========================== */}

            {movies.length > 0 && (

                <section>

                    <div className="watchlist-section-heading">

                        <h2>
                            Saved Movies
                        </h2>

                        <span>
                            {movies.length}{" "}
                            {movies.length === 1
                                ? "movie"
                                : "movies"}
                        </span>

                    </div>


                    <div className="watchlist-grid">

                        {movies.map((movie) => (

                            <article
                                className="watchlist-card"
                                key={movie.id}
                            >

                                {movie.posterPath ? (

                                    <img
                                        src={`${IMAGE_BASE_URL}${movie.posterPath}`}
                                        alt={`${movie.title} poster`}
                                    />

                                ) : (

                                    <div className="watchlist-placeholder">
                                        No poster available
                                    </div>

                                )}


                                <div className="watchlist-card-content">

                                    <h3>
                                        {movie.title}
                                    </h3>


                                    {movie.releaseDate && (

                                        <p className="watchlist-release-date">

                                            {movie.releaseDate}

                                        </p>

                                    )}

                                    <Link
                                        to={`/movies/${movie.movieId}`}
                                        className="watchlist-movie-link"
                                    >
                                        View Movie →
                                    </Link>


                                    {/* =========================
                                        STATUS
                                        ========================== */}

                                    <div className="watchlist-status-row">

                                        <span className="watchlist-status planned">
                                            Plan to Watch
                                        </span>

                                    </div>


                                    {/* =========================
                                        STATUS ACTION
                                        ========================== */}

                                    <button
                                        className="watchlist-status-button watched-button"
                                        onClick={() =>
                                            handleMarkAsWatched(
                                                movie.id
                                            )
                                        }
                                    >
                                        ✓ Mark as Watched
                                    </button>


                                    {/* =========================
                                        REMOVE
                                        ========================== */}

                                    <button
                                        className="watchlist-remove"
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

                        ))}

                    </div>

                </section>
            )}

        </main>
    );

    async function handleMarkAsWatched(
        movieId
    ) {

        try {

            setError("");

            await markAsWatched(
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
                "Unable to mark movie as watched:",
                error
            );

            setError(
                "Unable to mark movie as watched."
            );

        }

    }
}

export default Watchlist;