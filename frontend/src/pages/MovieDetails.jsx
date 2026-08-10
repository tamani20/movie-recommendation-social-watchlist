import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getMovie } from "../services/api";

import { useAuth } from "../context/AuthContext";
import {
    addToWatchlist
} from "../services/watchlistService";

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

function MovieDetails() {
    const { id } = useParams();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { currentUser } = useAuth();

    const [watchlistMessage, setWatchlistMessage] =
        useState("");

    useEffect(() => {
        async function loadMovie() {
            try {
                const data = await getMovie(id);

                setMovie(data);
            } catch (error) {
                console.error(error);

                setError(
                    "Unable to load movie details."
                );
            } finally {
                setLoading(false);
            }
        }

        loadMovie();
    }, [id]);

    if (loading) {
        return (
            <main>
                <p>Loading movie...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <p>{error}</p>
            </main>
        );
    }

    if (!movie) {
        return (
            <main>
                <p>Movie not found.</p>
            </main>
        );
    }

    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;

    return (
        <main>
            {posterUrl && (
                <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    width="300"
                />
            )}

            <h1>{movie.title}</h1>

            {movie.tagline && (
                <p>
                    <em>{movie.tagline}</em>
                </p>
            )}

            <p>
                Release date:{" "}
                {movie.release_date || "Unknown"}
            </p>

            <p>
                Rating:{" "}
                {movie.vote_average !== undefined
                    ? movie.vote_average.toFixed(1)
                    : "N/A"}
            </p>

            <p>
                Runtime:{" "}
                {movie.runtime
                    ? `${movie.runtime} minutes`
                    : "N/A"}
            </p>

            <h2>Overview</h2>

            <p>
                {movie.overview ||
                    "No overview available."}
            </p>

            {movie.genres &&
                movie.genres.length > 0 && (
                    <>
                        <h2>Genres</h2>

                        <p>
                            {movie.genres
                                .map(
                                    (genre) =>
                                        genre.name
                                )
                                .join(", ")}
                        </p>
                    </>
                )}

            <button onClick={handleAddToWatchlist}>
                Add to Watchlist
            </button>

            {watchlistMessage && (
                <p>{watchlistMessage}</p>
            )}

        </main>
    );

    async function handleAddToWatchlist() {
        if (!currentUser) {
            setWatchlistMessage(
                "Please log in to use your watchlist."
            );

            return;
        }

        try {
            await addToWatchlist(
                currentUser.uid,
                movie
            );

            setWatchlistMessage(
                "Movie added to your watchlist!"
            );
        } catch (error) {
            console.error(error);

            setWatchlistMessage(
                "Unable to add movie to watchlist."
            );
        }
    }
}

export default MovieDetails;