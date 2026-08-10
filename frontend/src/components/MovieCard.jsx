import { Link } from "react-router-dom";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie }) {
    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;

    return (
        <article>
            {posterUrl ? (
                <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    width="200"
                />
            ) : (
                <div>
                    No poster available
                </div>
            )}

            <h2>{movie.title}</h2>

            {movie.release_date && (
                <p>
                    Release date: {movie.release_date}
                </p>
            )}

            {movie.vote_average !== undefined && (
                <p>
                    Rating: {movie.vote_average.toFixed(1)}
                </p>
            )}

            <Link to={`/movies/${movie.id}`}>
                View Details
            </Link>
        </article>
    );
}

export default MovieCard;