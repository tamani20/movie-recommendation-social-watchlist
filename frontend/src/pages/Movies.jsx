import { useEffect, useState } from "react";

import {
    searchMovies,
    getPopularMovies
} from "../services/api";

import MovieCard from "../components/MovieCard";

function Movies() {
    const [movies, setMovies] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadPopularMovies() {
            try {
                setLoading(true);
                setError("");

                const data =
                    await getPopularMovies();

                setMovies(data.results || []);
            } catch (error) {
                console.error(error);

                setError(
                    "Unable to load movies."
                );
            } finally {
                setLoading(false);
            }
        }

        loadPopularMovies();
    }, []);

    async function handleSearch(event) {
        event.preventDefault();

        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data =
                await searchMovies(trimmedQuery);

            setMovies(data.results || []);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to search for movies."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleShowPopular() {
        setQuery("");
        setLoading(true);
        setError("");

        try {
            const data =
                await getPopularMovies();

            setMovies(data.results || []);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load popular movies."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="movies-page">

            {/* =========================
                PAGE HEADER
            ========================== */}

            <section className="movies-header">

                <div>
                    <p className="movies-eyebrow">
                        DISCOVER
                    </p>

                    <h1>Find Your Next Movie</h1>

                    <p className="movies-description">
                        Search for movies or explore
                        what's popular right now.
                    </p>
                </div>

            </section>


            {/* =========================
                SEARCH
            ========================== */}

            <section className="movie-search">

                <form
                    className="movie-search-form"
                    onSubmit={handleSearch}
                >
                    <input
                        type="text"
                        placeholder="Search for a movie..."
                        value={query}
                        onChange={(event) =>
                            setQuery(
                                event.target.value
                            )
                        }
                    />

                    <button type="submit">
                        Search
                    </button>
                </form>

                <button
                    className="movie-popular-button"
                    type="button"
                    onClick={handleShowPopular}
                >
                    Show Popular
                </button>

            </section>


            {/* =========================
                STATUS
            ========================== */}

            {loading && (
                <div className="page-message">
                    <p>Loading movies...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* =========================
                MOVIES
            ========================== */}

            {!loading && !error && (
                <section>

                    <div className="movies-section-heading">

                        <h2>
                            {query.trim()
                                ? `Search Results for "${query}"`
                                : "Popular Movies"}
                        </h2>

                        <p>
                            {movies.length} movies
                        </p>

                    </div>


                    {movies.length === 0 ? (

                        <div className="page-message">
                            <p>
                                No movies found.
                            </p>
                        </div>

                    ) : (

                        <div className="movie-grid">

                            {movies.map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                />
                            ))}

                        </div>

                    )}

                </section>
            )}

        </main>
    );
}

export default Movies;