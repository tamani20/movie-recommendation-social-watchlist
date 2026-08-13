import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

import { db } from "./firebase";


// ==========================================
// WATCHLIST COLLECTION
// ==========================================

function watchlistCollection(
    userId
) {

    return collection(
        db,
        "users",
        userId,
        "watchlist"
    );

}


// ==========================================
// ADD TO WATCHLIST
// ==========================================

export async function addToWatchlist(
    userId,
    movie
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (!movie?.id) {

        throw new Error(
            "Movie information is required."
        );

    }


    const movieRef =
        doc(
            db,
            "users",
            userId,
            "watchlist",
            String(movie.id)
        );


    await setDoc(
        movieRef,
        {

            movieId:
            movie.id,

            title:
            movie.title,

            posterPath:
                movie.poster_path ||
                null,

            releaseDate:
                movie.release_date ||
                null,

            addedAt:
                serverTimestamp(),

            status:
                "planned",

            watchedAt:
                null
        },
        {
            merge: false
        }
    );
}


// ==========================================
// REMOVE FROM WATCHLIST
// ==========================================

export async function removeFromWatchlist(
    userId,
    movieId
) {

    if (!userId || !movieId) {

        throw new Error(
            "User ID and movie ID are required."
        );

    }


    const movieRef =
        doc(
            db,
            "users",
            userId,
            "watchlist",
            String(movieId)
        );


    await deleteDoc(
        movieRef
    );

}


// ==========================================
// GET ENTIRE WATCHLIST
// ==========================================

export async function getWatchlist(
    userId
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    const snapshot =
        await getDocs(
            watchlistCollection(
                userId
            )
        );


    return snapshot.docs.map(
        (document) => ({

            id:
            document.id,

            ...document.data()

        })
    );

}

// ==========================================
// GET WATCHLIST MOVIE
// ==========================================

export async function getWatchlistMovie(
    userId,
    movieId
) {

    if (!userId || !movieId) {
        return null;
    }

    const movieRef =
        doc(
            db,
            "users",
            userId,
            "watchlist",
            String(movieId)
        );

    const snapshot =
        await getDoc(
            movieRef
        );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}

// ==========================================
// MARK MOVIE AS WATCHED
// ==========================================

export async function markAsWatched(
    userId,
    movieId
) {

    if (!userId || !movieId) {

        throw new Error(
            "User ID and movie ID are required."
        );

    }


    const movieRef =
        doc(
            db,
            "users",
            userId,
            "watchlist",
            String(movieId)
        );


    await updateDoc(
        movieRef,
        {

            status:
                "watched",

            watchedAt:
                serverTimestamp()

        }
    );

}


// ==========================================
// MARK MOVIE AS PLANNED
// ==========================================

export async function markAsPlanned(
    userId,
    movieId
) {

    if (!userId || !movieId) {

        throw new Error(
            "User ID and movie ID are required."
        );

    }


    const movieRef =
        doc(
            db,
            "users",
            userId,
            "watchlist",
            String(movieId)
        );


    await updateDoc(
        movieRef,
        {

            status:
                "planned",

            watchedAt:
                null

        }
    );

}


// ==========================================
// GET WATCHED MOVIES / HISTORY
// ==========================================

export async function getViewingHistory(
    userId
) {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    const movies =
        await getWatchlist(
            userId
        );


    const watchedMovies =
        movies.filter(
            (movie) =>
                movie.status ===
                "watched"
        );


    // Newest watched movie first.
    watchedMovies.sort(
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


    return watchedMovies;

}