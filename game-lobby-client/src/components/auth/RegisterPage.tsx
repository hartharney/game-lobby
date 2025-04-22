"use client";

import { useState, FormEvent } from "react";
import { useRegister } from "../../api/mutation";
import toast from "react-hot-toast";
// import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import { useSessionSocket } from "../../hooks/useSessionSocket";

type RegisterPageProps = {
  onClose?: () => void;
};
export default function RegisterPage({ onClose }: RegisterPageProps) {
  const {} = useSessionSocket();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate, isPending } = useRegister();

  const resetFormAndClose = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (onClose) onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const data = {
      username: form.username,
      email: form.email,
      password: form.password,
    };
    mutate(data, {
      onSuccess: () => {
        toast.success("Registration successful!");
        resetFormAndClose();
      },
      onError: (error) => {
        console.error("Login error:", error);

        const message =
          (axios.isAxiosError(error) ? error.message : error.message) ||
          "Registration failed!";

        toast.error(message);
      },
    });
  };

  // const handleGoogleRegister = () => {
  //   toast("Redirecting to Google...");
  // };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-center text-gray-700">
        Create Account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-gray-600 text-sm font-medium">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-black"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-gray-600 text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-black"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-black"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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

        <div className="space-y-1">
          <label className="block text-gray-600 text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-black"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showConfirmPassword ? (
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
          className="bg-pink-500 text-white py-3 px-4 rounded-lg w-full transition-colors hover:bg-pink-700 cursor-pointer flex items-center justify-center"
        >
          {isPending ? (
            <FaSpinner className="animate-spin w-5 h-5" />
          ) : (
            "Register"
          )}
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
        onClick={handleGoogleRegister}
        className="flex items-center justify-center gap-3 border-2 border-gray-300 py-3 px-4 rounded-lg w-full hover:bg-gray-50 transition"
      >
        <FcGoogle className="text-xl" />
        <span className="text-gray-700 font-medium">Continue with Google</span>
      </button> */}
    </div>
  );
}
