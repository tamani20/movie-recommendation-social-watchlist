import {
    getDocs,
    collection,
    query,
    where
} from "firebase/firestore";

import { db } from "./firebase";

import {
    getPopularMovies,
    getMovie,
    getMovieGenres
} from "./api";

const movieGenreCache =
    new Map();

// ==========================================
// GET USER REVIEWS
// ==========================================

async function getUserReviews(userId) {

    if (!userId) {
        return [];
    }

    const reviewsQuery = query(
        collection(db, "reviews"),
        where("userId", "==", userId)
    );

    const snapshot =
        await getDocs(reviewsQuery);

    return snapshot.docs.map(
        (document) => ({
            id: document.id,
            ...document.data()
        })
    );
}


// ==========================================
// GET USER WATCHLIST
// ==========================================

async function getUserWatchlist(userId) {

    if (!userId) {
        return [];
    }

    const watchlistReference =
        collection(
            db,
            "users",
            userId,
            "watchlist"
        );

    const snapshot =
        await getDocs(
            watchlistReference
        );

    return snapshot.docs.map(
        (document) => ({
            id: document.id,
            ...document.data()
        })
    );
}


// ==========================================
// GET GENRES FOR A MOVIE
// ==========================================

async function getMovieGenresForMovie(
    movieId
) {

    const cacheKey =
        String(movieId);


    if (
        movieGenreCache.has(
            cacheKey
        )
    ) {

        return movieGenreCache.get(
            cacheKey
        );

    }


    try {

        const movie =
            await getMovie(
                movieId
            );


        if (
            !movie ||
            !movie.genres
        ) {

            movieGenreCache.set(
                cacheKey,
                []
            );

            return [];
        }


        const genres =
            movie.genres.map(
                (genre) => ({
                    id:
                    genre.id,

                    name:
                    genre.name
                })
            );


        movieGenreCache.set(
            cacheKey,
            genres
        );


        return genres;


    } catch (error) {

        console.error(
            `Unable to retrieve genres for movie ${movieId}:`,
            error
        );


        return [];

    }

}


// ==========================================
// BUILD GENRE PREFERENCES
// ==========================================

async function buildGenrePreferences(
    reviews,
    watchlist
) {

    const genreScores = {};


    // ==========================================
    // HELPER: ADD GENRE SCORE
    // ==========================================

    function addGenreScore(
        genreName,
        weight
    ) {

        if (!genreName) {
            return;
        }

        if (
            !genreScores[genreName]
        ) {
            genreScores[genreName] = 0;
        }

        genreScores[genreName] +=
            weight;
    }


    // ==========================================
    // REVIEW SIGNALS
    // ==========================================

    for (const review of reviews) {

        const rating =
            Number(review.rating);

        const genres =
            await getMovieGenresForMovie(
                review.movieId
            );

        if (!genres.length) {
            continue;
        }


        let ratingWeight = 0;


        if (rating === 5) {

            ratingWeight = 6;

        } else if (rating === 4) {

            ratingWeight = 4;

        } else if (rating === 3) {

            ratingWeight = 1;

        } else if (rating === 2) {

            ratingWeight = -3;

        } else if (rating === 1) {

            ratingWeight = -5;

        }


        for (const genre of genres) {

            addGenreScore(
                genre.name,
                ratingWeight
            );

        }

    }


    // ==========================================
    // WATCHLIST / HISTORY SIGNALS
    // ==========================================

    for (const item of watchlist) {

        const genres =
            await getMovieGenresForMovie(
                item.movieId
            );


        if (!genres.length) {
            continue;
        }


        /*
         * Watched movies are a stronger
         * preference signal than planned
         * movies because the user actually
         * completed them.
         */

        const activityWeight =
            item.status === "watched"
                ? 2.5
                : 1;


        for (const genre of genres) {

            addGenreScore(
                genre.name,
                activityWeight
            );

        }

    }


    return genreScores;
}


// ==========================================
// SCORE A MOVIE
// ==========================================

function calculateMovieScore(
    movie,
    genreScores,
    genreMap
) {

    let score = 0;


    // --------------------------------------
    // Genre preference
    // --------------------------------------

    if (
        Array.isArray(movie.genre_ids)
    ) {

        for (
            const genreId
            of movie.genre_ids
            ) {

            const genreName =
                genreMap[genreId];

            if (
                genreName &&
                genreScores[genreName]
            ) {

                score +=
                    genreScores[genreName] * 1.25;
            }
        }
    }


    // --------------------------------------
    // TMDB rating
    // --------------------------------------

    if (
        typeof movie.vote_average ===
        "number"
    ) {

        score +=
            movie.vote_average / 2;
    }


    // --------------------------------------
    // TMDB popularity
    // --------------------------------------

    if (
        typeof movie.popularity ===
        "number"
    ) {

        score += Math.min(
            movie.popularity / 20,
            5
        );
    }


    return score;
}


// ==========================================
// GET PERSONALIZED RECOMMENDATIONS
// ==========================================

export async function getRecommendations(
    userId
) {

    if (!userId) {
        return [];
    }

    try {

        // ----------------------------------
        // Load user's activity
        // ----------------------------------

        const reviews =
            await getUserReviews(
                userId
            );

        const watchlist =
            await getUserWatchlist(
                userId
            );


        // ----------------------------------
        // Get popular movies
        // ----------------------------------

        const popularResponse =
            await getPopularMovies();

        const popularMovies =
            popularResponse?.results ||
            [];


        // ----------------------------------
        // Get official TMDB genres
        // ----------------------------------

        const genreResponse =
            await getMovieGenres();

        const genreMap = {};

        if (
            Array.isArray(
                genreResponse?.genres
            )
        ) {

            genreResponse.genres.forEach(
                (genre) => {

                    genreMap[genre.id] =
                        genre.name;
                }
            );
        }


        // ----------------------------------
        // Build user preferences
        // ----------------------------------

        const genreScores =
            await buildGenrePreferences(
                reviews,
                watchlist
            );


        console.log(
            "User genre preferences:",
            genreScores
        );


        // ----------------------------------
        // Movies already reviewed
        // ----------------------------------

        const reviewedMovieIds =
            new Set(
                reviews.map(
                    (review) =>
                        String(
                            review.movieId
                        )
                )
            );


        // ----------------------------------
        // Movies already watchlisted
        // ----------------------------------

        const watchlistMovieIds =
            new Set(
                watchlist.map(
                    (movie) =>
                        String(
                            movie.movieId
                        )
                )
            );

        // ----------------------------------
        // Watched movie IDs
        // ----------------------------------

        const watchedMovieIds =
            new Set(
                watchlist
                    .filter(
                        (movie) =>
                            movie.status ===
                            "watched"
                    )
                    .map(
                        (movie) =>
                            String(
                                movie.movieId
                            )
                    )
            );


        // ----------------------------------
        // Planned movie IDs
        // ----------------------------------

        const plannedMovieIds =
            new Set(
                watchlist
                    .filter(
                        (movie) =>
                            movie.status !==
                            "watched"
                    )
                    .map(
                        (movie) =>
                            String(
                                movie.movieId
                            )
                    )
            );

        console.log(
            "Recommendation activity:",
            {
                reviews:
                reviews.length,

                watched:
                watchedMovieIds.size,

                planned:
                plannedMovieIds.size
            }
        );


        // ----------------------------------
        // Remove movies already seen
        // ----------------------------------

        const candidates =
            popularMovies.filter(
                (movie) => {

                    const movieId =
                        String(movie.id);

                    return (
                        !reviewedMovieIds.has(
                            movieId
                        ) &&
                        !watchlistMovieIds.has(
                            movieId
                        )
                    );
                }
            );


        // ----------------------------------
        // Score movies
        // ----------------------------------

        const scoredMovies =
            candidates.map(
                (movie) => {

                    const score =
                        calculateMovieScore(
                            movie,
                            genreScores,
                            genreMap
                        );

                    const matchingGenres =
                        Array.isArray(
                            movie.genre_ids
                        )
                            ? movie.genre_ids
                                .map(
                                    (genreId) =>
                                        genreMap[
                                            genreId
                                            ]
                                )
                                .filter(
                                    (genreName) =>
                                        genreName &&
                                        genreScores[
                                            genreName
                                            ] > 0
                                )
                            : [];


                    return {
                        ...movie,

                        recommendationScore:
                        score,

                        recommendationGenres:
                        matchingGenres
                    };
                }
            );


        // ----------------------------------
        // Highest score first
        // ----------------------------------

        scoredMovies.sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );


        // ----------------------------------
        // Return top 10
        // ----------------------------------

        return scoredMovies.slice(
            0,
            10
        );

    } catch (error) {

        console.error(
            "Error generating recommendations:",
            error
        );

        throw error;
    }
}