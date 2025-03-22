import { useState } from "react";

export default function Home() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-8 tracking-tight">
          Model Context Protocol
        </h1>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold 
                   hover:bg-blue-700 transition-colors duration-200 mb-6"
        >
          Know More
        </button>

        {showInfo && (
          <p className="text-gray-200 text-lg leading-relaxed animate-fade-in p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm">
            MCP is an open protocol that standardizes how applications provide
            context to LLMs. Think of MCP like a USB-C port for AI applications.
            Just as USB-C provides a standardized way to connect your devices to
            various peripherals and accessories, MCP provides a standardized way
            to connect AI models to different data sources and tools.
          </p>
        )}
      </div>
    </main>
  );
}
