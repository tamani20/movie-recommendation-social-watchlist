const express = require("express");
const cors = require("cors");
require("dotenv").config();

const movieRoutes = require("./routes/movieRoutes");

const app = express();

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message:
            "Movie Recommendation & Social Watchlist API"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Backend is running"
    });
});

app.use("/api/movies", movieRoutes);

app.listen(PORT, () => {
    console.log(
        `Backend server running on port ${PORT}`
    );
});