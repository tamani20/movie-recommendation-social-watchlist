const API_BASE_URL = "http://localhost:5001/api";

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