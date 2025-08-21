"use client";
import React from 'react';


export default function LoginButton (){
    const handleClick = () => {
        window.location.href = "/signin";
    };

    return (
        <button
            onClick={handleClick}
            className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded"
        >
            Login
        </button>
    );
};