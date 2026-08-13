import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getFriends,
    getUserProfile
} from "../services/friendService";

function FriendProfile() {

    const { id } = useParams();

    const { currentUser } = useAuth();

    const [profile, setProfile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadFriendProfile() {

            if (!currentUser || !id) {
                return;
            }

            try {

                setLoading(true);
                setError("");

                /*
                 * Verify that the requested user
                 * is actually one of the current
                 * user's friends.
                 */

                const friends =
                    await getFriends(
                        currentUser.uid
                    );

                const isFriend =
                    friends.some(
                        (friend) =>
                            friend.friendId === id
                    );

                if (!isFriend) {

                    setError(
                        "You can only view profiles of your friends."
                    );

                    return;
                }


                const friendProfile =
                    await getUserProfile(id);

                setProfile(
                    friendProfile
                );

            } catch (error) {

                console.error(
                    "Unable to load friend profile:",
                    error
                );

                setError(
                    "Unable to load friend profile."
                );

            } finally {

                setLoading(false);

            }

        }

        loadFriendProfile();

    }, [currentUser, id]);


    if (loading) {

        return (
            <main>
                <p>
                    Loading friend profile...
                </p>
            </main>
        );

    }


    if (error) {

        return (
            <main>

                <div className="error-message">
                    {error}
                </div>

            </main>
        );

    }


    if (!profile) {

        return (
            <main>

                <div className="empty-state">
                    Friend profile not found.
                </div>

            </main>
        );

    }


    return (

        <main>

            <section className="card">

                <h1>
                    {profile.displayName}
                </h1>

                <p>
                    {profile.email}
                </p>

                <p>
                    Friend profile
                </p>

            </section>

        </main>

    );

}

export default FriendProfile;