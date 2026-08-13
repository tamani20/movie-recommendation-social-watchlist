import {
    useEffect,
    useState
} from "react";

import {
    searchMovies,
    getPopularMovies,
    getMovieGenres,
    discoverMovies
} from "../services/api";

import MovieCard from "../components/MovieCard";


function Movies() {

    // ==========================================
    // STATE
    // ==========================================

    const [movies, setMovies] =
        useState([]);

    const [query, setQuery] =
        useState("");

    const [genres, setGenres] =
        useState([]);

    const [selectedGenre, setSelectedGenre] =
        useState("");

    const [releaseYear, setReleaseYear] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [resultTitle, setResultTitle] =
        useState("Popular Movies");


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        async function loadPage() {

            try {

                setLoading(true);
                setError("");


                const [
                    popularData,
                    genreData
                ] =
                    await Promise.all([
                        getPopularMovies(),
                        getMovieGenres()
                    ]);


                setMovies(
                    popularData.results ||
                    []
                );


                setGenres(
                    genreData.genres ||
                    []
                );


            } catch (error) {

                console.error(
                    error
                );


                setError(
                    "Unable to load movies."
                );


            } finally {

                setLoading(false);

            }

        }


        loadPage();

    }, []);


    // ==========================================
    // SEARCH / FILTER
    // ==========================================

    async function handleSearch(
        event
    ) {

        event.preventDefault();


        const trimmedQuery =
            query.trim();

        const trimmedYear =
            releaseYear.trim();


        // No search criteria:
        // simply return to popular.
        if (
            !trimmedQuery &&
            !selectedGenre &&
            !trimmedYear
        ) {

            await handleShowPopular();

            return;

        }


        // Validate year.
        if (trimmedYear) {

            const numericYear =
                Number(
                    trimmedYear
                );


            if (
                !Number.isInteger(
                    numericYear
                ) ||
                numericYear < 1870 ||
                numericYear > 2100
            ) {

                setError(
                    "Please enter a valid release year."
                );

                return;

            }

        }


        try {

            setLoading(true);
            setError("");


            let results = [];


            // ==========================================
            // TITLE SEARCH
            // ==========================================

            if (trimmedQuery) {

                const data =
                    await searchMovies(
                        trimmedQuery
                    );


                results =
                    data.results ||
                    [];


                // --------------------------------------
                // FILTER SEARCH RESULTS BY GENRE
                // --------------------------------------

                if (selectedGenre) {

                    const numericGenre =
                        Number(
                            selectedGenre
                        );


                    results =
                        results.filter(
                            (movie) =>
                                Array.isArray(
                                    movie.genre_ids
                                ) &&
                                movie.genre_ids.includes(
                                    numericGenre
                                )
                        );

                }


                // --------------------------------------
                // FILTER SEARCH RESULTS BY YEAR
                // --------------------------------------

                if (trimmedYear) {

                    results =
                        results.filter(
                            (movie) =>
                                movie.release_date
                                    ?.startsWith(
                                        trimmedYear
                                    )
                        );

                }


                setResultTitle(
                    `Search Results for "${trimmedQuery}"`
                );

            }

                // ==========================================
                // DISCOVER BY FILTERS
            // ==========================================

            else {

                const data =
                    await discoverMovies(
                        selectedGenre,
                        trimmedYear
                    );


                results =
                    data.results ||
                    [];


                const selectedGenreName =
                    genres.find(
                        (genre) =>
                            String(
                                genre.id
                            ) ===
                            selectedGenre
                    )?.name;


                if (
                    selectedGenreName &&
                    trimmedYear
                ) {

                    setResultTitle(
                        `${selectedGenreName} Movies from ${trimmedYear}`
                    );

                } else if (
                    selectedGenreName
                ) {

                    setResultTitle(
                        `${selectedGenreName} Movies`
                    );

                } else {

                    setResultTitle(
                        `Movies from ${trimmedYear}`
                    );

                }

            }


            setMovies(
                results
            );


        } catch (error) {

            console.error(
                error
            );


            setError(
                "Unable to search for movies."
            );


        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // SHOW POPULAR
    // ==========================================

    async function handleShowPopular() {

        setQuery("");
        setSelectedGenre("");
        setReleaseYear("");

        setLoading(true);
        setError("");


        try {

            const data =
                await getPopularMovies();


            setMovies(
                data.results ||
                []
            );


            setResultTitle(
                "Popular Movies"
            );


        } catch (error) {

            console.error(
                error
            );


            setError(
                "Unable to load popular movies."
            );


        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main className="movies-page">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <section className="movies-header">

                <div>

                    <p className="movies-eyebrow">
                        DISCOVER
                    </p>


                    <h1>
                        Find Your Next Movie
                    </h1>


                    <p className="movies-description">

                        Search by title, genre,
                        or release year and discover
                        something new.

                    </p>

                </div>

            </section>


            {/* ==========================================
                SEARCH & FILTERS
            ========================================== */}

            <section className="movie-search">

                <form
                    className="movie-filter-form"
                    onSubmit={
                        handleSearch
                    }
                >

                    {/* TITLE */}

                    <div className="movie-filter-field movie-filter-title">

                        <label htmlFor="movie-search">
                            Movie Title
                        </label>


                        <input
                            id="movie-search"
                            type="text"
                            placeholder="Search for a movie..."
                            value={query}
                            onChange={(event) =>
                                setQuery(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* GENRE */}

                    <div className="movie-filter-field">

                        <label htmlFor="movie-genre">
                            Genre
                        </label>


                        <select
                            id="movie-genre"
                            value={
                                selectedGenre
                            }
                            onChange={(event) =>
                                setSelectedGenre(
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                All Genres
                            </option>


                            {genres.map(
                                (genre) => (

                                    <option
                                        key={
                                            genre.id
                                        }
                                        value={
                                            genre.id
                                        }
                                    >
                                        {genre.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* YEAR */}

                    <div className="movie-filter-field movie-filter-year">

                        <label htmlFor="movie-year">
                            Release Year
                        </label>


                        <input
                            id="movie-year"
                            type="number"
                            placeholder="e.g. 2026"
                            min="1870"
                            max="2100"
                            value={
                                releaseYear
                            }
                            onChange={(event) =>
                                setReleaseYear(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* ACTIONS */}

                    <div className="movie-filter-actions">

                        <button
                            type="submit"
                        >
                            Search
                        </button>


                        <button
                            className="movie-popular-button"
                            type="button"
                            onClick={
                                handleShowPopular
                            }
                        >
                            Show Popular
                        </button>

                    </div>

                </form>

            </section>


            {/* ==========================================
                STATUS
            ========================================== */}

            {loading && (

                <div className="page-message">

                    <p>
                        Loading movies...
                    </p>

                </div>

            )}


            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* ==========================================
                MOVIES
            ========================================== */}

            {!loading &&
                !error && (

                    <section>

                        <div className="movies-section-heading">

                            <h2>
                                {resultTitle}
                            </h2>


                            <p>

                                {movies.length}{" "}

                                {movies.length === 1
                                    ? "movie"
                                    : "movies"}

                            </p>

                        </div>


                        {movies.length === 0 ? (

                            <div className="page-message">

                                <p>
                                    No movies matched
                                    your search and
                                    filters.
                                </p>

                            </div>

                        ) : (

                            <div className="movie-grid">

                                {movies.map(
                                    (movie) => (

                                        <MovieCard
                                            key={
                                                movie.id
                                            }
                                            movie={
                                                movie
                                            }
                                        />

                                    )
                                )}

                            </div>

                        )}

                    </section>

                )}

        </main>

    );

}


export default Movies;