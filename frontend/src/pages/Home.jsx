import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    checkBackendHealth,
    getPopularMovies
} from "../services/api";

import { useAuth } from "../context/AuthContext";


const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


function Home() {

    const { currentUser } = useAuth();

    const [backendStatus, setBackendStatus] =
        useState("Checking...");

    const [error, setError] =
        useState("");

    const [popularMovies, setPopularMovies] =
        useState([]);

    const [moviesLoading, setMoviesLoading] =
        useState(true);


    // ==========================================
    // LOAD BACKEND + POPULAR MOVIES
    // ==========================================

    useEffect(() => {

        async function loadHomeData() {

            // ------------------------------
            // Backend health
            // ------------------------------

            try {

                const data =
                    await checkBackendHealth();

                setBackendStatus(
                    data.status
                );

            } catch (error) {

                console.error(
                    "Backend health check failed:",
                    error
                );

                setBackendStatus(
                    "Unavailable"
                );

                setError(
                    "Could not connect to the backend."
                );
            }


            // ------------------------------
            // Popular movies
            // ------------------------------

            try {

                setMoviesLoading(true);

                const data =
                    await getPopularMovies();

                setPopularMovies(
                    data.results || []
                );

            } catch (error) {

                console.error(
                    "Failed to load popular movies:",
                    error
                );

            } finally {

                setMoviesLoading(false);
            }
        }

        loadHomeData();

    }, []);


    return (

        <main>

            {/* ==================================
                HERO SECTION
            ================================== */}

            <section className="home-hero">

                <div className="home-hero-content">

                    <p className="home-eyebrow">
                        Movie Recommendations &
                        Social Watchlist
                    </p>

                    <h1>
                        Discover movies.
                        <br />
                        Build your watchlist.
                        <br />
                        Connect with friends.
                    </h1>

                    <p className="home-hero-description">
                        Search for movies, rate and
                        review your favorites, build
                        your personal watchlist, get
                        personalized recommendations,
                        and connect with other movie
                        fans.
                    </p>


                    <div className="home-hero-buttons">

                        <Link
                            to="/movies"
                            className="home-primary-button"
                        >
                            Explore Movies
                        </Link>


                        {currentUser ? (

                            <Link
                                to="/dashboard"
                                className="home-secondary-button"
                            >
                                Go to Dashboard
                            </Link>

                        ) : (

                            <Link
                                to="/register"
                                className="home-secondary-button"
                            >
                                Create Account
                            </Link>

                        )}

                    </div>

                </div>

            </section>


            {/* ==================================
                POPULAR MOVIES
            ================================== */}

            <section className="home-popular">

                <div className="home-section-heading">

                    <div>

                        <h2>
                            Popular Movies
                        </h2>

                        <p>
                            Discover what's popular
                            right now.
                        </p>

                    </div>


                    <Link to="/movies">
                        View All Movies →
                    </Link>

                </div>


                {moviesLoading ? (

                    <p>
                        Loading popular movies...
                    </p>

                ) : popularMovies.length === 0 ? (

                    <p>
                        Popular movies are currently
                        unavailable.
                    </p>

                ) : (

                    <div className="home-movie-grid">

                        {popularMovies
                            .slice(0, 6)
                            .map((movie) => {

                                const posterUrl =
                                    movie.poster_path
                                        ? `${IMAGE_BASE_URL}${movie.poster_path}`
                                        : null;

                                return (

                                    <Link
                                        key={movie.id}
                                        to={`/movies/${movie.id}`}
                                        className="home-movie-card"
                                    >

                                        {posterUrl ? (

                                            <img
                                                src={
                                                    posterUrl
                                                }
                                                alt={
                                                    `${movie.title} poster`
                                                }
                                            />

                                        ) : (

                                            <div className="home-movie-placeholder">
                                                No Poster
                                            </div>

                                        )}


                                        <div className="home-movie-card-content">

                                            <h3>
                                                {movie.title}
                                            </h3>

                                            <p>
                                                ⭐{" "}
                                                {typeof movie.vote_average ===
                                                "number"
                                                    ? movie.vote_average.toFixed(
                                                        1
                                                    )
                                                    : "N/A"}
                                            </p>

                                            <p>
                                                {movie.release_date ||
                                                    "Release date unavailable"}
                                            </p>

                                        </div>

                                    </Link>

                                );
                            })}

                    </div>

                )}

            </section>


            {/* ==================================
                HOW IT WORKS
            ================================== */}

            <section className="home-how-it-works">

                <div className="home-section-heading">

                    <div>

                        <h2>
                            How It Works
                        </h2>

                        <p>
                            Everything you need for
                            your personal movie
                            experience.
                        </p>

                    </div>

                </div>


                <div className="home-feature-grid">

                    <article className="home-feature-card">

                        <div className="home-feature-number">
                            1
                        </div>

                        <h3>
                            Discover
                        </h3>

                        <p>
                            Search for movies and
                            explore popular titles
                            using our movie database.
                        </p>

                    </article>


                    <article className="home-feature-card">

                        <div className="home-feature-number">
                            2
                        </div>

                        <h3>
                            Rate & Review
                        </h3>

                        <p>
                            Rate movies, write reviews,
                            and see what other members
                            think about the movies you
                            love.
                        </p>

                    </article>


                    <article className="home-feature-card">

                        <div className="home-feature-number">
                            3
                        </div>

                        <h3>
                            Build Your Watchlist
                        </h3>

                        <p>
                            Save movies you want to
                            watch and keep track of
                            your personal movie library.
                        </p>

                    </article>


                    <article className="home-feature-card">

                        <div className="home-feature-number">
                            4
                        </div>

                        <h3>
                            Connect
                        </h3>

                        <p>
                            Add friends, exchange
                            recommendations, and enjoy
                            movies together.
                        </p>

                    </article>

                </div>

            </section>


            {/* ==================================
                SYSTEM STATUS
            ================================== */}

            <section className="home-system-status">

                <h2>
                    System Status
                </h2>

                <div className="status-card">

                    <span>
                        Backend API
                    </span>

                    <span
                        className={
                            backendStatus === "OK"
                                ? "status-online"
                                : "status-offline"
                        }
                    >
                        ● {backendStatus}
                    </span>

                </div>


                {error && (

                    <p className="error-message">
                        {error}
                    </p>

                )}

            </section>

        </main>
    );
}


export default Home;