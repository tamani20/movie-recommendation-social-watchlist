const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
    headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: "application/json"
    }
});

async function searchMovies(query) {
    const response = await tmdbClient.get("/search/movie", {
        params: {
            query: query
        }
    });

    return response.data;
}

async function getMovieById(movieId) {
    const response = await tmdbClient.get(
        `/movie/${movieId}`
    );

    return response.data;
}

async function getPopularMovies() {
    const response = await tmdbClient.get(
        "/movie/popular"
    );

    return response.data;
}

async function getMovieGenres() {
    const response =
        await tmdbClient.get(
            "/genre/movie/list"
        );

    return response.data;
}

async function discoverMovies(
    genreId,
    year
) {

    const params = {
        sort_by:
            "popularity.desc"
    };


    if (genreId) {

        params.with_genres =
            genreId;

    }


    if (year) {

        params.primary_release_year =
            year;

    }


    const response =
        await tmdbClient.get(
            "/discover/movie",
            {
                params
            }
        );


    return response.data;
}

// ==========================================
// GET RELATED MOVIE RECOMMENDATIONS
// ==========================================

async function getMovieRecommendations(
    movieId
) {

    const response =
        await tmdbClient.get(
            `/movie/${movieId}/recommendations`
        );


    return response.data;
}

module.exports = {
    searchMovies,
    getMovieById,
    getPopularMovies,
    getMovieGenres,
    discoverMovies,
    getMovieRecommendations
};