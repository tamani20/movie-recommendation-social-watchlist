import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../services/firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();

        setError("");

        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(error);

            setError(
                "Invalid email or password."
            );
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <h1>Welcome Back</h1>

                    <p>
                        Log in to your Movie Recommendations
                        & Social Watchlist account.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >
                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    <button
                        className="auth-button"
                        type="submit"
                    >
                        Login
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create one
                        </Link>
                    </p>
                </div>

            </div>
        </main>
    );
}

export default Login;