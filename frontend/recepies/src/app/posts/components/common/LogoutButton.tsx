"use client";
import { signOut } from 'next-auth/react';
import React from 'react';


export default function LogoutButton() {

    function handleSignOut() {
        signOut();
    }
    return (
        <button
            onClick={handleSignOut}
            className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
            Logout
        </button>
    );
};
