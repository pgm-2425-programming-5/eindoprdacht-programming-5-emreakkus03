"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/custom/logout-button";
import { Menu, X } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link href="/" className="text-2xl font-bold text-blue-600">
            MyRecipes
          </Link>

         
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link href="/posts" className="text-gray-700 hover:text-blue-600">
              Recipes
            </Link>
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Documentation
            </Link>
          </div>

          {/* Auth actions */}
          <div className="hidden md:flex space-x-4">
            {!user ? (
              <>
                <Link
                  href="/signin"
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                >
                  Register
                </Link>
              </>
            ) : (
                 <>
                <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded"
                >
                    Profile
                </Link>
                <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded"
                >
                    Dashboard
                </Link>
              <LogoutButton />
              </>
            )}
          </div>

          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="flex flex-col space-y-2 px-4 py-3">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link href="/posts" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-blue-600">Recipes</Link>
            <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-blue-600">Documentation</Link>

            <div className="flex space-x-2 pt-2 border-t">
              {!user ? (
                <>
                  <Link
                    href="/signin"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white text-center rounded hover:bg-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-3 py-1 border border-blue-500 text-blue-500 text-center rounded hover:bg-blue-50"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="flex-1">
                <>
                <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded"
                >
                    Profile
                </Link>
                <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded"
                >
                    Dashboard
                </Link>
                  <LogoutButton />
                </>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
