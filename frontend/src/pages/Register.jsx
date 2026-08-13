import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    signInWithPopup
} from "firebase/auth";

import { auth, googleProvider } from "../services/firebase";
import { createUserProfile } from "../services/userService";

function Register() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleRegister(event) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

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
            setError(getFriendlyErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleGoogleSignUp() {
        setError("");
        setIsSubmitting(true);

        try {
            const userCredential = await signInWithPopup(
                auth,
                googleProvider
            );

            const user = userCredential.user;

            await createUserProfile(
                user.uid,
                user.email,
                user.displayName || ""
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setError(getFriendlyErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main>
            <h1>Create an Account</h1>

            <form onSubmit={handleRegister}>

                <div>
                    <label htmlFor="displayName">
                        Display Name
                    </label>

                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(event) =>
                            setDisplayName(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                        minLength="6"
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    Create Account
                </button>

            </form>

            <p>or</p>

            <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
            >
                Sign up with Google
            </button>

            {error && (
                <p>{error}</p>
            )}
        </main>
    );
}

function getFriendlyErrorMessage(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "An account with this email already exists.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/weak-password":
            return "Password should be at least 6 characters.";
        case "auth/popup-closed-by-user":
            return "Google sign-up was cancelled.";
        case "permission-denied":
            return "Account created, but we couldn't save your profile. Check your Firestore security rules.";
        default:
            return `Unable to create account: ${error.message}`;
    }
}

export default Register;
