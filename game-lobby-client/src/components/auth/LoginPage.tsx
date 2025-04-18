"use client";

import { useState, FormEvent } from "react";
import { useLogin } from "@/api/mutation";
import { Loader, Eye, EyeOff } from "lucide-react";
// import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import axios from "axios";

type LoginPageProps = {
  onClose?: () => void;
};

export default function LoginPage({ onClose }: LoginPageProps) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLogin();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate(form, {
      onSuccess: () => {
        toast.success("Login successful!");
        resetFormAndClose();
      },
      onError: (error) => {
        console.error("Login error:", error);

        const message =
          (axios.isAxiosError(error) ? error.message : error.message) ||
          "Login failed!";

        toast.error(message);
      },
    });
  };

  const resetFormAndClose = () => {
    setForm({ username: "", password: "" });
    setShowPassword(false);
    if (onClose) onClose();
  };

  // const handleGoogleLogin = () => {
  //   toast("Redirecting to Google...");
  // };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-center text-gray-700">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-gray-600 text-sm font-medium">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border-2 text-black border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-gray-600 text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border-2 text-black border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-purple-600 text-white py-3 px-4 rounded-lg w-full flex items-center justify-center transition-colors hover:bg-purple-700 cursor-pointer"
        >
          {isPending ? <Loader className="animate-spin w-5 h-5" /> : "Login"}
        </button>
      </form>

      {/* Divider */}
      {/* <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-400 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div> */}

      {/* Google Button */}
      {/* <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-3 border-2 border-gray-300 py-3 px-4 rounded-lg w-full hover:bg-gray-50 transition"
      >
        <FcGoogle className="text-xl" />
        <span className="text-gray-700 font-medium">Continue with Google</span>
      </button> */}
    </div>
  );
}
