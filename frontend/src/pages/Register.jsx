import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

                <button type="submit">
                    Create Account
                </button>

            </form>

            {error && (
                <p>{error}</p>
            )}
        </main>
    );
}

export default Register;