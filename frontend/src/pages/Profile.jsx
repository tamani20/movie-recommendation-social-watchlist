import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

import {
    getUserProfile,
    updateUserProfile
} from "../services/userService";

import {
    getUserReviews
} from "../services/reviewService";

import {
    getWatchlist
} from "../services/watchlistService";


const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


const AVATAR_OPTIONS = [
    "🎬",
    "🍿",
    "🎥",
    "⭐",
    "🎞️",
    "📽️",
    "👽",
    "🦸"
];


function Profile() {

    const {
        currentUser
    } = useAuth();


    // ==========================================
    // PROFILE STATE
    // ==========================================

    const [profile, setProfile] =
        useState(null);

    const [displayName, setDisplayName] =
        useState("");

    const [bio, setBio] =
        useState("");

    const [avatar, setAvatar] =
        useState("🎬");


    // ==========================================
    // ACTIVITY STATE
    // ==========================================

    const [reviews, setReviews] =
        useState([]);

    const [watchlist, setWatchlist] =
        useState([]);


    // ==========================================
    // UI STATE
    // ==========================================

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [editing, setEditing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {

        async function loadProfile() {

            if (!currentUser) {
                return;
            }


            try {

                setLoading(true);

                setError("");


                const [
                    profileData,
                    reviewsData,
                    watchlistData
                ] =
                    await Promise.all([

                        getUserProfile(
                            currentUser.uid
                        ),

                        getUserReviews(
                            currentUser.uid
                        ),

                        getWatchlist(
                            currentUser.uid
                        )

                    ]);


                if (!profileData) {

                    setError(
                        "Unable to find your profile."
                    );

                    return;

                }


                setProfile(
                    profileData
                );


                setDisplayName(
                    profileData.displayName ||
                    ""
                );


                setBio(
                    profileData.bio ||
                    ""
                );


                setAvatar(
                    profileData.avatar ||
                    "🎬"
                );


                setReviews(
                    reviewsData || []
                );


                setWatchlist(
                    watchlistData || []
                );


            } catch (error) {

                console.error(
                    "Unable to load profile:",
                    error
                );


                setError(
                    "Unable to load your profile."
                );


            } finally {

                setLoading(false);

            }

        }


        loadProfile();

    }, [currentUser]);


    // ==========================================
    // DERIVED MOVIE DATA
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
                        a.watchedAt?.toMillis
                            ? a.watchedAt.toMillis()
                            : 0;


                    const dateB =
                        b.watchedAt?.toMillis
                            ? b.watchedAt.toMillis()
                            : 0;


                    return (
                        dateB -
                        dateA
                    );

                }
            );


    const sortedReviews =
        [...reviews]
            .sort(
                (a, b) => {

                    const dateA =
                        a.updatedAt?.toMillis
                            ? a.updatedAt.toMillis()
                            : a.createdAt?.toMillis
                                ? a.createdAt.toMillis()
                                : 0;


                    const dateB =
                        b.updatedAt?.toMillis
                            ? b.updatedAt.toMillis()
                            : b.createdAt?.toMillis
                                ? b.createdAt.toMillis()
                                : 0;


                    return (
                        dateB -
                        dateA
                    );

                }
            );


    // ==========================================
    // SAVE PROFILE
    // ==========================================

    async function handleSaveProfile(
        event
    ) {

        event.preventDefault();


        if (!currentUser) {
            return;
        }


        setError("");

        setMessage("");


        try {

            setSaving(true);


            await updateUserProfile(
                currentUser.uid,
                {
                    displayName,
                    bio,
                    avatar
                }
            );


            const updatedProfile =
                await getUserProfile(
                    currentUser.uid
                );


            setProfile(
                updatedProfile
            );


            setDisplayName(
                updatedProfile.displayName ||
                ""
            );


            setBio(
                updatedProfile.bio ||
                ""
            );


            setAvatar(
                updatedProfile.avatar ||
                "🎬"
            );


            setEditing(false);


            setMessage(
                "Profile updated successfully!"
            );


        } catch (error) {

            console.error(
                "Unable to update profile:",
                error
            );


            setError(
                error.message ||
                "Unable to update your profile."
            );


        } finally {

            setSaving(false);

        }

    }


    // ==========================================
    // CANCEL EDITING
    // ==========================================

    function handleCancelEdit() {

        if (!profile) {
            return;
        }


        setDisplayName(
            profile.displayName ||
            ""
        );


        setBio(
            profile.bio ||
            ""
        );


        setAvatar(
            profile.avatar ||
            "🎬"
        );


        setEditing(false);

        setError("");

        setMessage("");

    }


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
            return "";
        }


        return watchedAt
            .toDate()
            .toLocaleDateString(
                undefined,
                {
                    month:
                        "short",

                    day:
                        "numeric",

                    year:
                        "numeric"
                }
            );

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <main className="profile-page">

                <div className="page-message">

                    <p>
                        Loading profile...
                    </p>

                </div>

            </main>

        );

    }


    // ==========================================
    // ERROR WITHOUT PROFILE
    // ==========================================

    if (
        error &&
        !profile
    ) {

        return (

            <main className="profile-page">

                <div className="error-message">
                    {error}
                </div>

            </main>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main className="profile-page">


            {/* ==========================================
                PROFILE HERO
            ========================================== */}

            <section className="profile-hero">

                <div className="profile-avatar">

                    {profile?.avatar ||
                        "🎬"}

                </div>


                <div className="profile-hero-info">

                    <p className="profile-eyebrow">
                        MY PROFILE
                    </p>


                    <h1>

                        {profile?.displayName ||
                            "User"}

                    </h1>


                    <p className="profile-bio">

                        {profile?.bio ||
                            "Tell your friends a little about yourself and the movies you enjoy."}

                    </p>


                    <div className="profile-role">

                            {profile?.role ||
                                "user"}

                        </div>

                    <span className="profile-meta">

                        <span>
                            {profile?.email}
                        </span>


                    </span>

                </div>


                <button
                    className="profile-edit-button"
                    onClick={() =>
                        setEditing(
                            !editing
                        )
                    }
                >

                    {editing
                        ? "Close Editor"
                        : "Edit Profile"}

                </button>

            </section>


            {/* ==========================================
                SUCCESS / ERROR
            ========================================== */}

            {message && (

                <div className="success-message">
                    {message}
                </div>

            )}


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            {/* ==========================================
                EDIT PROFILE
            ========================================== */}

            {editing && (

                <section className="profile-edit-section card">

                    <div className="profile-section-heading">

                        <h2>
                            Edit Profile
                        </h2>

                        <p>
                            Customize how your profile
                            appears to your friends.
                        </p>

                    </div>


                    <form
                        className="profile-edit-form"
                        onSubmit={
                            handleSaveProfile
                        }
                    >


                        {/* DISPLAY NAME */}

                        <div className="form-group">

                            <label htmlFor="profile-name">
                                Display Name
                            </label>


                            <input
                                id="profile-name"
                                type="text"
                                value={
                                    displayName
                                }
                                onChange={(event) =>
                                    setDisplayName(
                                        event.target.value
                                    )
                                }
                                maxLength="50"
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label htmlFor="profile-email">
                                Email
                            </label>


                            <input
                                id="profile-email"
                                type="email"
                                value={
                                    profile?.email ||
                                    ""
                                }
                                disabled
                            />


                            <span className="form-help">

                                Email is managed by
                                your account and cannot
                                be changed here.

                            </span>

                        </div>


                        {/* BIO */}

                        <div className="form-group">

                            <label htmlFor="profile-bio">
                                Bio
                            </label>


                            <textarea
                                id="profile-bio"
                                value={bio}
                                onChange={(event) =>
                                    setBio(
                                        event.target.value
                                    )
                                }
                                placeholder="Tell your friends about your favorite movies, genres, or what you like to watch..."
                                rows="5"
                                maxLength="300"
                            />


                            <span className="profile-character-count">

                                {bio.length}/300

                            </span>

                        </div>


                        {/* AVATAR */}

                        <div className="form-group">

                            <label>
                                Avatar
                            </label>


                            <div className="profile-avatar-options">

                                {AVATAR_OPTIONS.map(
                                    (option) => (

                                        <button
                                            key={
                                                option
                                            }
                                            type="button"
                                            className={
                                                avatar ===
                                                option
                                                    ? "profile-avatar-option selected"
                                                    : "profile-avatar-option"
                                            }
                                            onClick={() =>
                                                setAvatar(
                                                    option
                                                )
                                            }
                                        >

                                            {option}

                                        </button>

                                    )
                                )}

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="profile-edit-actions">

                            <button
                                type="submit"
                                disabled={
                                    saving
                                }
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Profile"}

                            </button>


                            <button
                                type="button"
                                className="profile-cancel-button"
                                onClick={
                                    handleCancelEdit
                                }
                                disabled={
                                    saving
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </section>

            )}


            {/* ==========================================
                PROFILE STATS
            ========================================== */}

            <section className="profile-stats">

                <div className="profile-stat-card">

                    <span className="profile-stat-number">
                        {reviews.length}
                    </span>

                    <span>
                        Reviews
                    </span>

                </div>


                <div className="profile-stat-card">

                    <span className="profile-stat-number">
                        {plannedMovies.length}
                    </span>

                    <span>
                        Plan to Watch
                    </span>

                </div>


                <div className="profile-stat-card">

                    <span className="profile-stat-number">
                        {watchedMovies.length}
                    </span>

                    <span>
                        Watched
                    </span>

                </div>

            </section>


            {/* ==========================================
                RECENT RATINGS & REVIEWS
            ========================================== */}

            <section className="profile-section">

                <div className="profile-section-heading">

                    <div>

                        <h2>
                            Recent Ratings & Reviews
                        </h2>

                        <p>
                            Your recent movie opinions.
                        </p>

                    </div>

                </div>


                {sortedReviews.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            You haven't reviewed
                            any movies yet.
                        </p>

                        <Link to="/movies">
                            Find Movies →
                        </Link>

                    </div>

                ) : (

                    <div className="profile-review-list">

                        {sortedReviews
                            .slice(0, 3)
                            .map(
                                (review) => (

                                    <article
                                        key={
                                            review.id
                                        }
                                        className="review-card"
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


            {/* ==========================================
                PLAN TO WATCH
            ========================================== */}

            <section className="profile-section">

                <div className="profile-section-heading">

                    <div>

                        <h2>
                            Plan to Watch
                        </h2>

                        <p>
                            Movies currently saved
                            for later.
                        </p>

                    </div>


                    <Link
                        to="/watchlist"
                        className="dashboard-view-all"
                    >
                        View Watchlist →
                    </Link>

                </div>


                {plannedMovies.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            Your watchlist is empty.
                        </p>

                        <Link to="/movies">
                            Find Movies →
                        </Link>

                    </div>

                ) : (

                    <div className="profile-movie-grid">

                        {plannedMovies
                            .slice(0, 4)
                            .map(
                                (movie) => (

                                    <article
                                        key={
                                            movie.id
                                        }
                                        className="profile-movie-card"
                                    >

                                        {movie.posterPath ? (

                                            <img
                                                src={`${IMAGE_BASE_URL}${movie.posterPath}`}
                                                alt={`${movie.title} poster`}
                                            />

                                        ) : (

                                            <div className="profile-movie-placeholder">
                                                No poster
                                            </div>

                                        )}


                                        <div className="profile-movie-content">

                                            <h3>
                                                {movie.title}
                                            </h3>


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
                RECENTLY WATCHED
            ========================================== */}

            <section className="profile-section">

                <div className="profile-section-heading">

                    <div>

                        <h2>
                            Recently Watched
                        </h2>

                        <p>
                            Your recent viewing
                            history.
                        </p>

                    </div>


                    <Link
                        to="/history"
                        className="dashboard-view-all"
                    >
                        View History →
                    </Link>

                </div>


                {watchedMovies.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            You haven't marked any
                            movies as watched yet.
                        </p>

                    </div>

                ) : (

                    <div className="profile-movie-grid">

                        {watchedMovies
                            .slice(0, 4)
                            .map(
                                (movie) => (

                                    <article
                                        key={
                                            movie.id
                                        }
                                        className="profile-movie-card"
                                    >

                                        {movie.posterPath ? (

                                            <img
                                                src={`${IMAGE_BASE_URL}${movie.posterPath}`}
                                                alt={`${movie.title} poster`}
                                            />

                                        ) : (

                                            <div className="profile-movie-placeholder">
                                                No poster
                                            </div>

                                        )}


                                        <div className="profile-movie-content">

                                            <h3>
                                                {movie.title}
                                            </h3>


                                            {movie.watchedAt && (

                                                <p className="profile-watched-date">

                                                    ✓ Watched{" "}

                                                    {formatWatchedDate(
                                                        movie.watchedAt
                                                    )}

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

        </main>

    );

}


export default Profile;