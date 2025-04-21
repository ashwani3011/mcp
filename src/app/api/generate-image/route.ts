import { NextResponse } from "next/server";
import OpenAI from "openai";

// Increase the response size limit and timeout
export const maxDuration = 60; // Set maximum duration to 60 seconds
export const dynamic = "force-dynamic"; // Disable static optimization
export const fetchCache = "force-no-store"; // Disable cache

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout for API calls
});

export async function POST(request: Request) {
  try {
    const { prompt, password } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Verify password
    if (password !== process.env.APP_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = await openai.images.generate({
      model: process.env.MODEL || "dall-e-2",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard", // Changed from 'hd' to 'standard' for faster response
      style: "vivid",
    });

    if (!response.data?.[0]?.url) {
      throw new Error("No image URL received from OpenAI");
    }

    return NextResponse.json({
      imageUrl: response.data[0].url,
      success: true,
    });
  } catch (error: any) {
    console.error("Error generating image:", error);

    // Handle different types of errors
    if (error.name === "AbortError" || error.code === "ETIMEDOUT") {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Handle OpenAI API specific errors
    if (error.response?.data?.error) {
      return NextResponse.json(
        { error: error.response.data.error.message },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    );
  }
}
