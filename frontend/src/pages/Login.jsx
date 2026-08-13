import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { createUserProfile } from "../services/userService";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setError("Invalid email or password.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleGoogleLogin() {
        setError("");
        setIsSubmitting(true);

        try {
            const userCredential = await signInWithPopup(
                auth,
                googleProvider
            );

            const user = userCredential.user;

            // Ensures a profile doc exists even if this Google
            // account never went through the Register page.
            await createUserProfile(
                user.uid,
                user.email,
                user.displayName || ""
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setError("Unable to sign in with Google. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
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
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    Login
                </button>
            </form>

            <p>or</p>

            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
            >
                Sign in with Google
            </button>

            {error && (
                <p>{error}</p>
            )}
        </main>
    );
}

export default Login;
