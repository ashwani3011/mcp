import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const imageBlob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `attachment; filename="generated-image-${Date.now()}.png"`
    );

    return new NextResponse(imageBlob, {
      headers,
    });
  } catch (error) {
    console.error("Error downloading image:", error);
    return new NextResponse("Failed to download image", { status: 500 });
  }
}
