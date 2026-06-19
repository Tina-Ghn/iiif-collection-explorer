import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith("https://")) {
    return new Response("Missing or invalid image URL", { status: 400 });
  }

  const response = await fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
    cache: "force-cache",
  });

  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  if (!contentType.startsWith("image/")) {
    return new Response("Image could not be loaded", { status: response.status });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": contentType,
    },
  });
}
