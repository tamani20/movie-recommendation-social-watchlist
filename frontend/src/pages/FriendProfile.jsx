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


function FriendProfile() {

    const { id } = useParams();

    const { currentUser } = useAuth();

    const [profile, setProfile] =
        useState(null);

    const [reviews, setReviews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [reviewsLoading, setReviewsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [reviewsError, setReviewsError] =
        useState("");


    useEffect(() => {

        async function loadFriendProfile() {

            if (!currentUser || !id) {
                return;
            }

            try {

                setLoading(true);
                setReviewsLoading(true);
                setError("");

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

                setProfile(
                    friendProfile
                );

                setLoading(false);


                // ==========================================
                // LOAD FRIEND REVIEWS
                // ==========================================

                try {

                    const reviewsData =
                        await getUserReviews(id);

                    setReviews(
                        reviewsData
                    );

                } catch (reviewError) {

                    console.error(
                        "Unable to load friend reviews:",
                        reviewError
                    );

                    setReviews([]);

                } finally {

                    setReviewsLoading(false);

                }

            } catch (error) {

                console.error(
                    "Unable to load friend profile:",
                    error
                );

                setError(
                    "Unable to load friend profile."
                );

                setReviewsError(
                    "Unable to load this friend's reviews."
                );

                setLoading(false);
                setReviewsLoading(false);
                setReviewsError("");

            }

        }

        loadFriendProfile();

    }, [currentUser, id]);

    // ==========================================
    // LOADING
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
    // ERROR
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

            <section className="friend-profile-section">

                <div className="friend-profile-section-heading">

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

                    <div className="friend-review-list">

                        {reviews.map(
                            (review) => (

                                <article
                                    key={review.id}
                                    className="review-card friend-review-card"
                                >

                                    <h3>
                                        {review.movieTitle}
                                    </h3>

                                    <p className="friend-review-rating">
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

        </main>

    );

}


export default FriendProfile;