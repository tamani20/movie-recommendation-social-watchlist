import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import {
    getWatchlist,
    removeFromWatchlist
} from "../services/watchlistService";

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

function Watchlist() {
    const { currentUser } = useAuth();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadWatchlist() {
        try {
            const data =
                await getWatchlist(
                    currentUser.uid
                );

            setMovies(data);
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
            <main>
                <p>Loading watchlist...</p>
            </main>
        );
    }

    return (
        <main>
            <h1>My Watchlist</h1>

            {error && (
                <p>{error}</p>
            )}

            {movies.length === 0 ? (
                <p>
                    Your watchlist is empty.
                </p>
            ) : (
                <section>
                    {movies.map((movie) => (
                        <article key={movie.id}>
                            {movie.posterPath && (
                                <img
                                    src={`${IMAGE_BASE_URL}${movie.posterPath}`}
                                    alt={`${movie.title} poster`}
                                    width="200"
                                />
                            )}

                            <h2>
                                {movie.title}
                            </h2>

                            <p>
                                {movie.releaseDate}
                            </p>

                            <button
                                onClick={() =>
                                    handleRemove(
                                        movie.id
                                    )
                                }
                            >
                                Remove
                            </button>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default Watchlist;