import { useEffect, useState } from "react";
import {
    searchMovies,
    getPopularMovies
} from "../services/api";

function Movies() {
    const [movies, setMovies] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadPopularMovies() {
            try {
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

        if (!query.trim()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data =
                await searchMovies(query);

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

    return (
        <main>
            <h1>Movies</h1>

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={query}
                    onChange={(event) =>
                        setQuery(event.target.value)
                    }
                />

                <button type="submit">
                    Search
                </button>
            </form>

            {loading && (
                <p>Loading movies...</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            {!loading && !error && (
                <section>
                    {movies.map((movie) => (
                        <article key={movie.id}>
                            <h2>
                                {movie.title}
                            </h2>

                            <p>
                                {movie.release_date}
                            </p>

                            <p>
                                {movie.overview}
                            </p>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default Movies;