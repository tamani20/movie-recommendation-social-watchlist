import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getMovie } from "../services/api";

import { useAuth } from "../context/AuthContext";

import {
    addToWatchlist
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

    const [watchlistMessage, setWatchlistMessage] =
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


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <main>

            {/* =========================
                MOVIE INFORMATION
            ========================== */}

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
                {movie.release_date ||
                    "Unknown"}
            </p>

            <p>
                Rating:{" "}
                {movie.vote_average !==
                undefined
                    ? movie.vote_average.toFixed(
                        1
                    )
                    : "N/A"}
            </p>

            <p>
                Runtime:{" "}
                {movie.runtime
                    ? `${movie.runtime} minutes`
                    : "N/A"}
            </p>


            {/* =========================
                OVERVIEW
            ========================== */}

            <h2>Overview</h2>

            <p>
                {movie.overview ||
                    "No overview available."}
            </p>


            {/* =========================
                GENRES
            ========================== */}

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


            {/* =========================
                WATCHLIST
            ========================== */}

            <button
                onClick={
                    handleAddToWatchlist
                }
            >
                Add to Watchlist
            </button>

            {watchlistMessage && (
                <p>
                    {watchlistMessage}
                </p>
            )}


            {/* =========================
                REVIEWS
            ========================== */}

            <hr />

            <h2>
                {myReview
                    ? "Your Review"
                    : "Your Rating & Review"}
            </h2>

            {!currentUser ? (
                <p>
                    Please log in to rate and
                    review this movie.
                </p>
            ) : (
                <>
                    <label>
                        Rating:
                    </label>

                    <br />

                    <select
                        value={rating}
                        onChange={(event) =>
                            setRating(
                                Number(
                                    event.target
                                        .value
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


                    <br />
                    <br />

                    <label>
                        Your Review:
                    </label>

                    <br />

                    <textarea
                        value={reviewText}
                        onChange={(event) =>
                            setReviewText(
                                event.target.value
                            )
                        }
                        placeholder="What did you think about this movie?"
                        rows="5"
                        cols="50"
                    />

                    <br />
                    <br />

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
                        <>
                            <br />
                            <br />

                            <button
                                onClick={
                                    handleDeleteReview
                                }
                                disabled={
                                    reviewLoading
                                }
                            >
                                Delete Review
                            </button>
                        </>
                    )}

                    {reviewError && (
                        <p>
                            {reviewError}
                        </p>
                    )}

                    {reviewMessage && (
                        <p>
                            {reviewMessage}
                        </p>
                    )}
                </>
            )}


            {/* =========================
                COMMUNITY REVIEWS
            ========================== */}

            <hr />

            <h2>Community Reviews</h2>

            {reviews.length === 0 ? (
                <p>
                    No reviews yet. Be the
                    first to review this movie!
                </p>
            ) : (
                reviews.map((review) => (
                    <article
                        key={review.id}
                    >
                        <h3>
                            {review.profile?.displayName ||
                                "Unknown User"}
                        </h3>

                        <p>
                            Rating:{" "}
                            {review.rating}/5
                        </p>

                        <p>
                            {review.review}
                        </p>
                    </article>
                ))
            )}

        </main>
    );
}


export default MovieDetails;