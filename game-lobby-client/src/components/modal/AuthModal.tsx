"use client";

import { useEffect, useState } from "react";
import RegisterPage from "../auth/RegisterPage";
import LoginPage from "../auth/LoginPage";

const AuthModal = ({
  closeModal,
  path,
}: {
  closeModal: () => void;
  path: string;
}) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (path === "/login") {
      setIsLogin(true);
    } else if (path === "/register") {
      setIsLogin(false);
    }
  }, [path]);

  const handleSwitch = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsTransitioning(false);
    }, 300); // Duration of the transition (300ms)
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-500">
      <div className="bg-white p-8 rounded-lg relative w-full max-w-md">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-xl text-gray-500"
        >
          &times;
        </button>

        {/* The transition container */}
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {isLogin ? (
            <LoginPage onClose={closeModal} />
          ) : (
            <RegisterPage onClose={closeModal} />
          )}
        </div>

        {/* Switch link */}
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={handleSwitch}
                  className="text-purple-600 hover:underline"
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={handleSwitch}
                  className="text-pink-600 hover:underline"
                >
                  Login here
                </button>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
