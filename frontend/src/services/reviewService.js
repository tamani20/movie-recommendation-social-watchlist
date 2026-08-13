import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    doc
} from "firebase/firestore";

import { db } from "./firebase";


// ==========================================
// REVIEWS COLLECTION
// ==========================================

const reviewsCollection =
    collection(
        db,
        "reviews"
    );


// ==========================================
// ADD REVIEW
// ==========================================

export async function addReview(
    userId,
    movieId,
    movieTitle,
    rating,
    reviewText
) {
    if (!userId) {
        throw new Error(
            "User must be logged in."
        );
    }

    if (!movieId) {
        throw new Error(
            "Movie ID is required."
        );
    }

    if (
        rating < 1 ||
        rating > 5
    ) {
        throw new Error(
            "Rating must be between 1 and 5."
        );
    }

    if (
        !reviewText ||
        !reviewText.trim()
    ) {
        throw new Error(
            "Review cannot be empty."
        );
    }

    // Check whether this user has
    // already reviewed this movie.
    const existingReview =
        await getUserMovieReview(
            userId,
            movieId
        );

    if (existingReview) {
        throw new Error(
            "You have already reviewed this movie."
        );
    }

    await addDoc(
        reviewsCollection,
        {
            userId,
            movieId: String(movieId),
            movieTitle,
            rating: Number(rating),
            review:
                reviewText.trim(),
            createdAt:
                serverTimestamp()
        }
    );
}


// ==========================================
// GET REVIEWS FOR MOVIE
// ==========================================

export async function getMovieReviews(
    movieId
) {
    const reviewsQuery =
        query(
            reviewsCollection,
            where(
                "movieId",
                "==",
                movieId
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );

    const snapshot =
        await getDocs(
            reviewsQuery
        );

    return snapshot.docs.map(
        (document) => ({
            id: document.id,
            ...document.data()
        })
    );
}


// ==========================================
// GET USER'S REVIEW FOR A MOVIE
// ==========================================

export async function getUserMovieReview(
    userId,
    movieId
) {
    const reviewQuery = query(
        reviewsCollection,
        where(
            "userId",
            "==",
            userId
        ),
        where(
            "movieId",
            "==",
            String(movieId)
        )
    );

    const snapshot =
        await getDocs(
            reviewQuery
        );

    if (snapshot.empty) {
        return null;
    }

    const document =
        snapshot.docs[0];

    return {
        id: document.id,
        ...document.data()
    };
}


// ==========================================
// GET ALL REVIEWS BY USER
// ==========================================

export async function getUserReviews(
    userId
) {
    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }

    const reviewsQuery =
        query(
            reviewsCollection,
            where(
                "userId",
                "==",
                userId
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );

    const snapshot =
        await getDocs(
            reviewsQuery
        );

    return snapshot.docs.map(
        (document) => ({
            id: document.id,
            ...document.data()
        })
    );
}


// ==========================================
// UPDATE REVIEW
// ==========================================

export async function updateReview(
    reviewId,
    rating,
    reviewText
) {
    if (!reviewId) {
        throw new Error(
            "Review ID is required."
        );
    }

    if (
        rating < 1 ||
        rating > 5
    ) {
        throw new Error(
            "Rating must be between 1 and 5."
        );
    }

    if (
        !reviewText ||
        !reviewText.trim()
    ) {
        throw new Error(
            "Review cannot be empty."
        );
    }

    const reviewReference =
        doc(
            reviewsCollection,
            reviewId
        );

    await updateDoc(
        reviewReference,
        {
            rating: Number(rating),
            review:
                reviewText.trim(),
            updatedAt:
                serverTimestamp()
        }
    );
}


// ==========================================
// DELETE REVIEW
// ==========================================

export async function deleteReview(
    reviewId
) {
    if (!reviewId) {
        throw new Error(
            "Review ID is required."
        );
    }

    const reviewReference =
        doc(
            reviewsCollection,
            reviewId
        );

    await deleteDoc(
        reviewReference
    );
}