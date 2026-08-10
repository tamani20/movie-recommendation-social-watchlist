import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

function watchlistCollection(userId) {
    return collection(
        db,
        "users",
        userId,
        "watchlist"
    );
}

export async function addToWatchlist(
    userId,
    movie
) {
    const movieRef = doc(
        db,
        "users",
        userId,
        "watchlist",
        String(movie.id)
    );

    await setDoc(movieRef, {
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path || null,
        releaseDate:
            movie.release_date || null,
        addedAt: serverTimestamp(),
        status: "planned"
    });
}

export async function removeFromWatchlist(
    userId,
    movieId
) {
    const movieRef = doc(
        db,
        "users",
        userId,
        "watchlist",
        String(movieId)
    );

    await deleteDoc(movieRef);
}

export async function getWatchlist(userId) {
    const snapshot = await getDocs(
        watchlistCollection(userId)
    );

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
    }));
}