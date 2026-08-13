import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import Movies from "./pages/Movies";

import MovieDetails from "./pages/MovieDetails";

import Watchlist from "./pages/Watchlist";

import Friends from "./pages/Friends";

import Navbar from "./components/Navbar";

import FriendProfile from "./pages/FriendProfile";

import FriendActivity from "./pages/FriendActivity";

import ViewingHistory from "./pages/ViewingHistory";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/movies"
                    element={<Movies />}
                />

                <Route
                    path="/movies/:id"
                    element={<MovieDetails />}
                />

                <Route
                    path="/watchlist"
                    element={
                        <ProtectedRoute>
                            <Watchlist />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <ViewingHistory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/friends"
                    element={
                        <ProtectedRoute>
                            <Friends />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/friends/:id"
                    element={
                        <ProtectedRoute>
                            <FriendProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/activity"
                    element={
                        <ProtectedRoute>
                            <FriendActivity />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;