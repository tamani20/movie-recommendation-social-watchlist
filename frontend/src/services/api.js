const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5001/api";

export async function checkBackendHealth() {
    const response = await fetch(
        `${API_BASE_URL}/health`
    );

    if (!response.ok) {
        throw new Error("Backend request failed");
    }

    return response.json();
}

export async function searchMovies(query) {
    const response = await fetch(
        `${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        throw new Error("Movie search failed");
    }

    return response.json();
}

export async function getPopularMovies() {
    const response = await fetch(
        `${API_BASE_URL}/movies/popular`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to retrieve popular movies"
        );
    }

    return response.json();
}

export async function getMovie(movieId) {
    const response = await fetch(
        `${API_BASE_URL}/movies/${movieId}`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to retrieve movie details"
        );
    }

    return response.json();
}

export async function getMovieGenres() {

    const response = await fetch(
        `${API_BASE_URL}/movies/genres`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to retrieve movie genres"
        );
    }

    return response.json();
}

export async function discoverMovies(
    genreId,
    year
) {

    const params =
        new URLSearchParams();


    if (genreId) {

        params.set(
            "genre",
            genreId
        );

    }


    if (year) {

        params.set(
            "year",
            year
        );

    }


    const response =
        await fetch(
            `${API_BASE_URL}/movies/discover?${params.toString()}`
        );


    if (!response.ok) {

        throw new Error(
            "Movie discovery failed"
        );

    }


    return response.json();
}

// ==========================================
// GET RELATED MOVIES
// ==========================================

export async function getMovieRecommendations(
    movieId
) {

    const response =
        await fetch(
            `${API_BASE_URL}/movies/${movieId}/recommendations`
        );


    if (!response.ok) {

        throw new Error(
            "Failed to retrieve related movies"
        );

    }


    return response.json();
}