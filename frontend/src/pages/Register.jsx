import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "../services/firebase";
import { createUserProfile } from "../services/userService";

function Register() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleRegister(event) {
        event.preventDefault();

        setError("");

        try {
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            await createUserProfile(
                user.uid,
                user.email,
                displayName
            );

            navigate("/dashboard");

        } catch (error) {
            console.error(error);

            setError(
                "Unable to create account. Please check your information and try again."
            );
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <h1>Create an Account</h1>

                    <p>
                        Join Movie Recommendations
                        & Social Watchlist.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >
                    <div className="form-group">
                        <label htmlFor="displayName">
                            Display Name
                        </label>

                        <input
                            id="displayName"
                            type="text"
                            placeholder="Enter your display name"
                            value={displayName}
                            onChange={(event) =>
                                setDisplayName(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

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
                                setEmail(
                                    event.target.value
                                )
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
                            placeholder="Create a password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            required
                            minLength="6"
                        />

                        <small className="form-help">
                            Password must be at least
                            6 characters.
                        </small>
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
                        Create Account
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">
                            Login
                        </Link>
                    </p>
                </div>

            </div>
        </main>
    );
}

export default Register;