import { useEffect, useState } from "react";
import {
    Link,
    useParams
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getFriends,
    getUserProfile
} from "../services/friendService";

import {
    getUserReviews
} from "../services/reviewService";

import {
    getWatchlist
} from "../services/watchlistService";


function FriendProfile() {

    const { id } = useParams();

    const { currentUser } = useAuth();


    // ==========================================
    // STATE
    // ==========================================

    const [profile, setProfile] =
        useState(null);

    const [reviews, setReviews] =
        useState([]);

    const [watchlist, setWatchlist] =
        useState([]);


    const [loading, setLoading] =
        useState(true);

    const [reviewsLoading, setReviewsLoading] =
        useState(true);

    const [watchlistLoading, setWatchlistLoading] =
        useState(true);


    const [error, setError] =
        useState("");

    const [reviewsError, setReviewsError] =
        useState("");

    const [watchlistError, setWatchlistError] =
        useState("");


    // ==========================================
    // LOAD FRIEND PROFILE
    // ==========================================

    useEffect(() => {

        async function loadFriendProfile() {

            if (!currentUser || !id) {
                return;
            }


            try {

                setLoading(true);

                setReviewsLoading(true);

                setWatchlistLoading(true);

                setError("");

                setReviewsError("");

                setWatchlistError("");


                // ==========================================
                // VERIFY FRIENDSHIP
                // ==========================================

                const friends =
                    await getFriends(
                        currentUser.uid
                    );


                const isFriend =
                    friends.some(
                        (friend) =>
                            friend.friendId === id
                    );


                if (!isFriend) {

                    setError(
                        "You can only view profiles of your friends."
                    );

                    return;
                }


                // ==========================================
                // LOAD FRIEND PROFILE
                // ==========================================

                const friendProfile =
                    await getUserProfile(id);


                if (!friendProfile) {

                    setError(
                        "Friend profile not found."
                    );

                    return;
                }


                setProfile(
                    friendProfile
                );


                // Profile itself loaded successfully.
                setLoading(false);


                // ==========================================
                // LOAD FRIEND REVIEWS
                // ==========================================

                try {

                    const reviewsData =
                        await getUserReviews(id);


                    setReviews(
                        reviewsData || []
                    );

                } catch (reviewError) {

                    console.error(
                        "Unable to load friend reviews:",
                        reviewError
                    );


                    setReviews([]);

                    setReviewsError(
                        "Unable to load this friend's reviews."
                    );

                } finally {

                    setReviewsLoading(false);

                }


                // ==========================================
                // LOAD FRIEND WATCHLIST
                // ==========================================

                try {

                    const watchlistData =
                        await getWatchlist(id);


                    setWatchlist(
                        watchlistData || []
                    );

                } catch (watchlistError) {

                    console.error(
                        "Unable to load friend watchlist:",
                        watchlistError
                    );


                    setWatchlist([]);

                    setWatchlistError(
                        "Unable to load this friend's watchlist."
                    );

                } finally {

                    setWatchlistLoading(false);

                }


            } catch (error) {

                console.error(
                    "Unable to load friend profile:",
                    error
                );


                setError(
                    "Unable to load friend profile."
                );

            } finally {

                setLoading(false);

            }

        }


        // ==========================================
        // CALL THE FUNCTION
        // ==========================================

        loadFriendProfile();

    }, [currentUser, id]);

// ==========================================
// SPLIT WATCHLIST / WATCHED HISTORY
// ==========================================

    const plannedMovies =
        watchlist.filter(
            (movie) =>
                movie.status !==
                "watched"
        );


    const watchedMovies =
        watchlist
            .filter(
                (movie) =>
                    movie.status ===
                    "watched"
            )
            .sort(
                (a, b) => {

                    const dateA =
                        a.watchedAt
                            ?.toMillis
                            ? a.watchedAt.toMillis()
                            : 0;


                    const dateB =
                        b.watchedAt
                            ?.toMillis
                            ? b.watchedAt.toMillis()
                            : 0;


                    return (
                        dateB -
                        dateA
                    );

                }
            );

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
    // WAIT FOR AUTHENTICATION
    // ==========================================

    if (!currentUser) {

        return (
            <main>

                <p>
                    Loading...
                </p>

            </main>
        );

    }


    // ==========================================
    // LOADING PROFILE
    // ==========================================

    if (loading) {

        return (
            <main>

                <p>
                    Loading friend profile...
                </p>

            </main>
        );

    }


    // ==========================================
    // PROFILE ERROR
    // ==========================================

    if (error) {

        return (
            <main>

                <div className="error-message">

                    {error}

                </div>

            </main>
        );

    }


    // ==========================================
    // PROFILE NOT FOUND
    // ==========================================

    if (!profile) {

        return (
            <main>

                <div className="empty-state">

                    Friend profile not found.

                </div>

            </main>
        );

    }


    // ==========================================
    // PROFILE
    // ==========================================

    return (

        <main>

            {/* ==========================================
                PROFILE HEADER
            ========================================== */}

            <section
                className="card friend-profile-header"
            >

                <div className="friend-profile-avatar">

                    {profile.displayName
                        ?.charAt(0)
                        .toUpperCase()}

                </div>


                <div>

                    <h1>
                        {profile.displayName}
                    </h1>

                    <p>
                        Friend
                    </p>

                </div>

            </section>


            {/* ==========================================
                RATINGS & REVIEWS
            ========================================== */}

            <section
                className="friend-profile-section"
            >

                <div
                    className="friend-profile-section-heading"
                >

                    <h2>
                        Ratings & Reviews
                    </h2>

                    <p>

                        Movies{" "}
                        {profile.displayName} has
                        rated and reviewed.

                    </p>

                </div>


                {reviewsLoading ? (

                    <p>
                        Loading reviews...
                    </p>

                ) : reviewsError ? (

                    <div className="error-message">

                        {reviewsError}

                    </div>

                ) : reviews.length === 0 ? (

                    <div className="card">

                        <p>

                            {profile.displayName}
                            {" "}
                            hasn't reviewed any
                            movies yet.

                        </p>

                    </div>

                ) : (

                    <div
                        className="friend-review-list"
                    >

                        {reviews.map(
                            (review) => (

                                <article
                                    key={review.id}
                                    className="review-card friend-review-card"
                                >

                                    <h3>
                                        {review.movieTitle}
                                    </h3>


                                    <p
                                        className="friend-review-rating"
                                    >

                                        ★ {review.rating}/5

                                    </p>


                                    <p>
                                        {review.review}
                                    </p>


                                    <Link
                                        to={`/movies/${review.movieId}`}
                                    >
                                        View Movie →
                                    </Link>

                                </article>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* ==========================================
                WATCHLIST
            ========================================== */}

            <section
                className="friend-profile-section"
            >

                <div
                    className="friend-profile-section-heading"
                >

                    <h2>
                        Watchlist
                    </h2>


                    <p>

                        Movies{" "}
                        {profile.displayName} has
                        added to their watchlist.

                    </p>

                </div>


                {watchlistLoading ? (

                    <p>
                        Loading watchlist...
                    </p>

                ) : watchlistError ? (

                    <div className="error-message">

                        {watchlistError}

                    </div>

                ) : watchlist.length === 0 ? (

                    <div className="card">

                        <p>

                            {profile.displayName}
                            {" "}
                            hasn't added any movies to
                            their watchlist yet.

                        </p>

                    </div>

                ) : (

                    <div
                        className="friend-watchlist-grid"
                    >

                        {watchlist.map(
                            (movie) => (

                                <article
                                    key={movie.id}
                                    className="friend-watchlist-card"
                                >

                                    {/* POSTER */}

                                    {movie.posterPath ? (

                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                                            alt={`${movie.title} poster`}
                                        />

                                    ) : (

                                        <div
                                            className="friend-watchlist-placeholder"
                                        >
                                            No poster available
                                        </div>

                                    )}


                                    {/* MOVIE INFORMATION */}

                                    <div
                                        className="friend-watchlist-card-content"
                                    >

                                        <h3>
                                            {movie.title}
                                        </h3>


                                        {movie.releaseDate && (

                                            <p>

                                                Release date:{" "}
                                                {movie.releaseDate}

                                            </p>

                                        )}


                                        <Link
                                            to={`/movies/${movie.movieId}`}
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
    WATCHED MOVIES
========================================== */}

            <section
                className="friend-profile-section"
            >

                <div
                    className="friend-profile-section-heading"
                >

                    <h2>
                        Watched Movies
                    </h2>


                    <p>

                        Movies{" "}
                        {profile.displayName} has
                        finished watching.

                    </p>

                </div>


                {watchlistLoading ? (

                    <p>
                        Loading viewing history...
                    </p>

                ) : watchlistError ? (

                    <div className="error-message">

                        {watchlistError}

                    </div>

                ) : watchedMovies.length === 0 ? (

                    <div className="card">

                        <p>

                            {profile.displayName}
                            {" "}
                            hasn't marked any movies
                            as watched yet.

                        </p>

                    </div>

                ) : (

                    <div
                        className="friend-watchlist-grid"
                    >

                        {watchedMovies.map(
                            (movie) => (

                                <article
                                    key={movie.id}
                                    className="friend-watchlist-card"
                                >

                                    {/* POSTER */}

                                    {movie.posterPath ? (

                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                                            alt={`${movie.title} poster`}
                                        />

                                    ) : (

                                        <div
                                            className="friend-watchlist-placeholder"
                                        >
                                            No poster available
                                        </div>

                                    )}


                                    {/* MOVIE INFORMATION */}

                                    <div
                                        className="friend-watchlist-card-content"
                                    >

                                        <h3>
                                            {movie.title}
                                        </h3>


                                        {movie.releaseDate && (

                                            <p>

                                                Release date:{" "}
                                                {movie.releaseDate}

                                            </p>

                                        )}


                                        <p className="friend-watched-date">

                                            Watched:{" "}
                                            {formatWatchedDate(
                                                movie.watchedAt
                                            )}

                                        </p>


                                        <Link
                                            to={`/movies/${movie.movieId}`}
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

        </main>

    );

}


export default FriendProfile;