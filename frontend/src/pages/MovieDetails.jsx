import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getMovie } from "../services/api";

import { useAuth } from "../context/AuthContext";

import {
    addToWatchlist,
    getWatchlistMovie,
    markAsWatched,
    markAsPlanned,
    removeFromWatchlist
} from "../services/watchlistService";

import {
    addReview,
    getMovieReviews,
    getUserMovieReview,
    updateReview,
    deleteReview
} from "../services/reviewService";

import {
    getUserProfile
} from "../services/friendService";


const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


function MovieDetails() {
    const { id } = useParams();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { currentUser } = useAuth();

    // ==========================================
    // WATCHLIST STATE
    // ==========================================

    const [watchlistItem, setWatchlistItem] =
        useState(null);

    const [watchlistLoading, setWatchlistLoading] =
        useState(false);

    const [watchlistMessage, setWatchlistMessage] =
        useState("");

    const [watchlistError, setWatchlistError] =
        useState("");

    // ==========================================
    // REVIEW STATE
    // ==========================================

    const [reviews, setReviews] = useState([]);

    const [myReview, setMyReview] = useState(null);

    const [rating, setRating] = useState(5);

    const [reviewText, setReviewText] =
        useState("");

    const [reviewLoading, setReviewLoading] =
        useState(false);

    const [reviewError, setReviewError] =
        useState("");

    const [reviewMessage, setReviewMessage] =
        useState("");


    // ==========================================
    // LOAD MOVIE
    // ==========================================

    useEffect(() => {
        async function loadMovie() {
            try {
                setLoading(true);
                setError("");

                const data =
                    await getMovie(id);

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


    // ==========================================
    // LOAD REVIEWS
    // ==========================================

    useEffect(() => {
        async function loadReviews() {
            if (!id) {
                return;
            }

            try {
                const movieReviews =
                    await getMovieReviews(
                        String(id)
                    );

                const reviewsWithProfiles =
                    await Promise.all(
                        movieReviews.map(
                            async (review) => {

                                const profile =
                                    await getUserProfile(
                                        review.userId
                                    );

                                return {
                                    ...review,
                                    profile
                                };
                            }
                        )
                    );

                setReviews(
                    reviewsWithProfiles
                );

            } catch (error) {
                console.error(
                    "Error loading reviews:",
                    error
                );
            }
        }

        loadReviews();

    }, [id]);

    useEffect(() => {
        async function loadMyReview() {
            if (
                !currentUser ||
                !id
            ) {
                setMyReview(null);
                return;
            }

            try {
                const existingReview =
                    await getUserMovieReview(
                        currentUser.uid,
                        String(id)
                    );

                setMyReview(
                    existingReview
                );

                if (existingReview) {
                    setRating(
                        existingReview.rating
                    );

                    setReviewText(
                        existingReview.review
                    );
                }

            } catch (error) {
                console.error(
                    "Error loading user's review:",
                    error
                );
            }
        }

        loadMyReview();

    }, [currentUser, id]);

    // ==========================================
// LOAD WATCHLIST STATUS
// ==========================================

    useEffect(() => {

        async function loadWatchlistStatus() {

            if (
                !currentUser ||
                !id
            ) {

                setWatchlistItem(null);

                return;
            }


            try {

                setWatchlistError("");

                const existingItem =
                    await getWatchlistMovie(
                        currentUser.uid,
                        String(id)
                    );


                setWatchlistItem(
                    existingItem
                );


            } catch (error) {

                console.error(
                    "Unable to load watchlist status:",
                    error
                );


                setWatchlistError(
                    "Unable to load watchlist status."
                );

            }

        }


        loadWatchlistStatus();

    }, [currentUser, id]);


    // ==========================================
    // LOADING / ERROR STATES
    // ==========================================

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


    // ==========================================
    // MOVIE POSTER
    // ==========================================

    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;


    // ==========================================
    // ADD REVIEW
    // ==========================================

    async function handleSubmitReview() {
        setReviewError("");
        setReviewMessage("");

        if (!currentUser) {
            setReviewError(
                "Please log in to submit a review."
            );

            return;
        }

        if (!reviewText.trim()) {
            setReviewError(
                "Please enter a review."
            );

            return;
        }

        try {
            setReviewLoading(true);

            // ==========================================
            // UPDATE EXISTING REVIEW
            // ==========================================

            if (myReview) {
                await updateReview(
                    myReview.id,
                    Number(rating),
                    reviewText
                );

                setReviewMessage(
                    "Your review was updated successfully!"
                );

                // ==========================================
                // CREATE NEW REVIEW
                // ==========================================

            } else {
                await addReview(
                    currentUser.uid,
                    String(movie.id),
                    movie.title,
                    Number(rating),
                    reviewText
                );

                setReviewMessage(
                    "Your review was submitted successfully!"
                );
            }

            // ==========================================
            // RELOAD USER'S REVIEW
            // ==========================================

            const updatedMyReview =
                await getUserMovieReview(
                    currentUser.uid,
                    String(movie.id)
                );

            setMyReview(
                updatedMyReview
            );

            // ==========================================
            // RELOAD COMMUNITY REVIEWS
            // ==========================================

            const updatedReviews =
                await getMovieReviews(
                    String(movie.id)
                );

            const reviewsWithProfiles =
                await Promise.all(
                    updatedReviews.map(
                        async (review) => {

                            const profile =
                                await getUserProfile(
                                    review.userId
                                );

                            return {
                                ...review,
                                profile
                            };
                        }
                    )
                );

            setReviews(
                reviewsWithProfiles
            );

        } catch (error) {
            console.error(
                "Error saving review:",
                error
            );

            setReviewError(
                error.message ||
                "Unable to save review."
            );

        } finally {
            setReviewLoading(false);
        }
    }

    // ==========================================
// DELETE REVIEW
// ==========================================

    async function handleDeleteReview() {
        if (!currentUser) {
            return;
        }

        if (!myReview) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete your review?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setReviewLoading(true);

            setReviewError("");
            setReviewMessage("");

            await deleteReview(
                myReview.id
            );

            // Clear the user's review
            setMyReview(null);

            // Reset the form
            setRating(5);
            setReviewText("");

            setReviewMessage(
                "Your review was deleted successfully!"
            );

            // Reload community reviews
            const updatedReviews =
                await getMovieReviews(
                    String(movie.id)
                );

            const reviewsWithProfiles =
                await Promise.all(
                    updatedReviews.map(
                        async (review) => {

                            const profile =
                                await getUserProfile(
                                    review.userId
                                );

                            return {
                                ...review,
                                profile
                            };
                        }
                    )
                );

            setReviews(
                reviewsWithProfiles
            );

        } catch (error) {
            console.error(
                "Error deleting review:",
                error
            );

            setReviewError(
                error.message ||
                "Unable to delete review."
            );

        } finally {
            setReviewLoading(false);
        }
    }


// ==========================================
// ADD TO WATCHLIST
// ==========================================

    async function handleAddToWatchlist() {

        if (!currentUser) {

            setWatchlistError(
                "Please log in to use your watchlist."
            );

            return;

        }


        try {

            setWatchlistLoading(true);

            setWatchlistError("");

            setWatchlistMessage("");


            await addToWatchlist(
                currentUser.uid,
                movie
            );


            const updatedItem =
                await getWatchlistMovie(
                    currentUser.uid,
                    String(movie.id)
                );


            setWatchlistItem(
                updatedItem
            );


            setWatchlistMessage(
                "Movie added to your watchlist!"
            );


        } catch (error) {

            console.error(
                "Unable to add movie to watchlist:",
                error
            );


            setWatchlistError(
                "Unable to add movie to watchlist."
            );


        } finally {

            setWatchlistLoading(false);

        }

    }


// ==========================================
// MARK AS WATCHED
// ==========================================

    async function handleMarkAsWatched() {

        if (
            !currentUser ||
            !watchlistItem
        ) {
            return;
        }


        try {

            setWatchlistLoading(true);

            setWatchlistError("");

            setWatchlistMessage("");


            await markAsWatched(
                currentUser.uid,
                movie.id
            );


            const updatedItem =
                await getWatchlistMovie(
                    currentUser.uid,
                    String(movie.id)
                );


            setWatchlistItem(
                updatedItem
            );


            setWatchlistMessage(
                "Movie marked as watched!"
            );


        } catch (error) {

            console.error(
                "Unable to mark movie as watched:",
                error
            );


            setWatchlistError(
                "Unable to mark movie as watched."
            );


        } finally {

            setWatchlistLoading(false);

        }

    }


// ==========================================
// MARK AS PLANNED
// ==========================================

    async function handleMarkAsPlanned() {

        if (
            !currentUser ||
            !watchlistItem
        ) {
            return;
        }


        try {

            setWatchlistLoading(true);

            setWatchlistError("");

            setWatchlistMessage("");


            await markAsPlanned(
                currentUser.uid,
                movie.id
            );


            const updatedItem =
                await getWatchlistMovie(
                    currentUser.uid,
                    String(movie.id)
                );


            setWatchlistItem(
                updatedItem
            );


            setWatchlistMessage(
                "Movie moved back to Plan to Watch."
            );


        } catch (error) {

            console.error(
                "Unable to mark movie as planned:",
                error
            );


            setWatchlistError(
                "Unable to update movie status."
            );


        } finally {

            setWatchlistLoading(false);

        }

    }


// ==========================================
// REMOVE FROM WATCHLIST
// ==========================================

    async function handleRemoveFromWatchlist() {

        if (
            !currentUser ||
            !watchlistItem
        ) {
            return;
        }


        const confirmed =
            window.confirm(
                "Remove this movie from your watchlist?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setWatchlistLoading(true);

            setWatchlistError("");

            setWatchlistMessage("");


            await removeFromWatchlist(
                currentUser.uid,
                movie.id
            );


            setWatchlistItem(null);


            setWatchlistMessage(
                "Movie removed from your watchlist."
            );


        } catch (error) {

            console.error(
                "Unable to remove movie:",
                error
            );


            setWatchlistError(
                "Unable to remove movie from watchlist."
            );


        } finally {

            setWatchlistLoading(false);

        }

    }


// ==========================================
// PAGE
// ==========================================

    return (
        <main className="movie-details-page">

            {/* =========================
            MOVIE HERO
        ========================== */}

            <section className="movie-details-hero">

                <div className="movie-details-poster">

                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={`${movie.title} poster`}
                        />
                    ) : (
                        <div className="movie-details-poster-placeholder">
                            No poster available
                        </div>
                    )}

                </div>


                <div className="movie-details-info">

                    <h1>
                        {movie.title}
                    </h1>

                    {movie.tagline && (
                        <p className="movie-tagline">
                            {movie.tagline}
                        </p>
                    )}

                    <div className="movie-meta">

                    <span>
                        ★{" "}
                        {movie.vote_average !== undefined
                            ? movie.vote_average.toFixed(1)
                            : "N/A"}
                    </span>

                        <span>
                        {movie.release_date || "Unknown release date"}
                    </span>

                        <span>
                        {movie.runtime
                            ? `${movie.runtime} min`
                            : "Runtime unavailable"}
                    </span>

                    </div>


                    {/* GENRES */}

                    {movie.genres &&
                        movie.genres.length > 0 && (
                            <div className="movie-genres">

                                {movie.genres.map(
                                    (genre) => (
                                        <span
                                            key={genre.id}
                                            className="genre-tag"
                                        >
                                        {genre.name}
                                    </span>
                                    )
                                )}

                            </div>
                        )}


                    {/* ==========================================
    WATCHLIST STATUS & ACTIONS
========================================== */}

                    <div className="movie-watchlist-actions">


                        {/* NOT LOGGED IN */}

                        {!currentUser ? (

                            <>

                                <button
                                    className="movie-watchlist-button"
                                    onClick={handleAddToWatchlist}
                                >
                                    + Add to Watchlist
                                </button>

                            </>


                        ) : !watchlistItem ? (

                            /* ==========================================
                               NOT SAVED
                            ========================================== */

                            <button
                                className="movie-watchlist-button"
                                onClick={handleAddToWatchlist}
                                disabled={watchlistLoading}
                            >

                                {watchlistLoading
                                    ? "Adding..."
                                    : "+ Add to Watchlist"}

                            </button>


                        ) : watchlistItem.status === "watched" ? (

                            /* ==========================================
                               WATCHED
                            ========================================== */

                            <>

            <span className="movie-watchlist-status watched">

                ✓ Watched

            </span>


                                <div className="movie-watchlist-button-group">

                                    <button
                                        className="movie-status-secondary"
                                        onClick={handleMarkAsPlanned}
                                        disabled={watchlistLoading}
                                    >

                                        {watchlistLoading
                                            ? "Updating..."
                                            : "Mark as Planned"}

                                    </button>


                                    <button
                                        className="movie-watchlist-remove"
                                        onClick={handleRemoveFromWatchlist}
                                        disabled={watchlistLoading}
                                    >
                                        Remove
                                    </button>

                                </div>

                            </>


                        ) : (

                            /* ==========================================
                               PLANNED
                            ========================================== */

                            <>

            <span className="movie-watchlist-status planned">

                Plan to Watch

            </span>


                                <div className="movie-watchlist-button-group">

                                    <button
                                        className="movie-watchlist-button"
                                        onClick={handleMarkAsWatched}
                                        disabled={watchlistLoading}
                                    >

                                        {watchlistLoading
                                            ? "Updating..."
                                            : "✓ Mark as Watched"}

                                    </button>


                                    <button
                                        className="movie-watchlist-remove"
                                        onClick={handleRemoveFromWatchlist}
                                        disabled={watchlistLoading}
                                    >
                                        Remove
                                    </button>

                                </div>

                            </>

                        )}


                        {/* SUCCESS */}

                        {watchlistMessage && (

                            <p className="success-message">

                                {watchlistMessage}

                            </p>

                        )}


                        {/* ERROR */}

                        {watchlistError && (

                            <p className="error-message">

                                {watchlistError}

                            </p>

                        )}

                    </div>

                </div>

            </section>


            {/* =========================
            OVERVIEW
        ========================== */}

            <section className="movie-details-section">

                <h2>
                    Overview
                </h2>

                <p className="movie-overview">

                    {movie.overview ||
                        "No overview available."}

                </p>

            </section>


            {/* =========================
            REVIEW SECTION
        ========================== */}

            <section className="movie-details-section">

                <h2>
                    {myReview
                        ? "Your Review"
                        : "Your Rating & Review"}
                </h2>


                {!currentUser ? (

                    <div className="login-review-message">

                        <p>
                            Please log in to rate and
                            review this movie.
                        </p>

                    </div>

                ) : (

                    <div className="review-form card">

                        <div className="form-group">

                            <label htmlFor="rating">
                                Rating
                            </label>

                            <select
                                id="rating"
                                value={rating}
                                onChange={(event) =>
                                    setRating(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                            >

                                <option value={1}>
                                    1 - Poor
                                </option>

                                <option value={2}>
                                    2 - Below Average
                                </option>

                                <option value={3}>
                                    3 - Average
                                </option>

                                <option value={4}>
                                    4 - Good
                                </option>

                                <option value={5}>
                                    5 - Excellent
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label htmlFor="review">
                                Your Review
                            </label>

                            <textarea
                                id="review"
                                value={reviewText}
                                onChange={(event) =>
                                    setReviewText(
                                        event.target.value
                                    )
                                }
                                placeholder="What did you think about this movie?"
                                rows="6"
                            />

                        </div>


                        <div className="review-form-actions">

                            <button
                                onClick={
                                    handleSubmitReview
                                }
                                disabled={
                                    reviewLoading
                                }
                            >

                                {reviewLoading
                                    ? myReview
                                        ? "Updating..."
                                        : "Submitting..."
                                    : myReview
                                        ? "Update Review"
                                        : "Submit Review"}

                            </button>


                            {myReview && (

                                <button
                                    className="danger-button"
                                    onClick={
                                        handleDeleteReview
                                    }
                                    disabled={
                                        reviewLoading
                                    }
                                >
                                    Delete Review
                                </button>

                            )}

                        </div>


                        {reviewError && (
                            <p className="error-message">
                                {reviewError}
                            </p>
                        )}

                        {reviewMessage && (
                            <p className="success-message">
                                {reviewMessage}
                            </p>
                        )}

                    </div>

                )}

            </section>


            {/* =========================
            COMMUNITY REVIEWS
        ========================== */}

            <section className="movie-details-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Community Reviews
                        </h2>

                        <p>
                            See what other users think
                            about this movie.
                        </p>

                    </div>

                </div>


                {reviews.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            No reviews yet. Be the
                            first to review this movie!
                        </p>

                    </div>

                ) : (

                    <div className="reviews-list">

                        {reviews.map(
                            (review) => (

                                <article
                                    key={review.id}
                                    className="review-card"
                                >

                                    <div className="review-card-header">

                                        <div>

                                            <h3>
                                                {review.profile?.displayName ||
                                                    "Unknown User"}
                                            </h3>

                                            <p className="review-rating">

                                                {"★".repeat(
                                                    review.rating
                                                )}

                                                {"☆".repeat(
                                                    5 -
                                                    review.rating
                                                )}

                                            </p>

                                        </div>

                                    </div>


                                    <p className="review-text">
                                        {review.review}
                                    </p>

                                </article>

                            )
                        )}

                    </div>

                )}

            </section>

        </main>
    );
}


export default MovieDetails;