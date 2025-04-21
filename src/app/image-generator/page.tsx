"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const generateImage = async () => {
    if (!prompt) {
      setError("Please enter a prompt");
      promptRef.current?.focus();
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setImageUrl(""); // Clear previous image when starting new generation

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (!data.imageUrl) {
        throw new Error("No image URL received");
      }

      setImageUrl(data.imageUrl);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again with a simpler prompt.");
      } else if (err.message.includes("429")) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError(err.message || "Failed to generate image. Please try again.");
      }
      console.error("Error generating image:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      setDownloading(true);
      setError("");

      const response = await fetch("/api/download-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download image. Please try again.");
      console.error("Error downloading image:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-2 text-center ">
          🦉{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Image Generator
          </span>
        </h1>

        <div className="space-y-6 backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="space-y-2">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-200"
            >
              Enter your prompt
            </label>
            <textarea
              ref={promptRef}
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
              rows={4}
              placeholder="Describe the image you want to generate..."
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateImage}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Image"
            )}
          </motion.button>

          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={imageUrl}
                  alt="Generated image"
                  className="w-full h-auto"
                  onError={() =>
                    setError(
                      "Failed to load the generated image. Please try regenerating."
                    )
                  }
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {downloading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                    <span>Downloading...</span>
                  </div>
                ) : (
                  "Download Image"
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
