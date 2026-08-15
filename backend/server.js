const express = require("express");
const cors = require("cors");
require("dotenv").config();

const movieRoutes =
    require("./routes/movieRoutes");

const app = express();

const PORT =
    process.env.PORT || 5001;


// ==========================================
// MIDDLEWARE
// ==========================================

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
];


app.use(
    cors({
        origin:
            function (
                origin,
                callback
            ) {

                if (
                    !origin ||
                    allowedOrigins.includes(
                        origin
                    )
                ) {

                    callback(
                        null,
                        true
                    );

                } else {

                    callback(
                        new Error(
                            "Not allowed by CORS"
                        )
                    );

                }

            }
    })
);

app.use(
    express.json()
);


// ==========================================
// ROOT
// ==========================================

app.get(
    "/",
    (req, res) => {

        res.json({
            message:
                "Movie Recommendation & Social Watchlist API"
        });

    }
);


// ==========================================
// HEALTH
// ==========================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status:
                "OK",

            message:
                "Backend is running"
        });

    }
);


// ==========================================
// MOVIE ROUTES
// ==========================================

app.use(
    "/api/movies",
    movieRoutes
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Backend server running on port ${PORT}`
        );

    }
);