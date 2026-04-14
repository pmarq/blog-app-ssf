import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withBasePath } from "@/lib/withBasePath";

export const GET = async (request: NextRequest) => {
  const path = request.nextUrl.searchParams.get("redirect");

  if (!path) {
    return NextResponse.redirect(new URL(withBasePath("/"), request.url));
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("firebaseAuthRefreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL(withBasePath("/"), request.url));
  }

  try {
    const apiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_WEB_API_KEY;

    if (!apiKey) {
      console.error("[refresh-token] Missing Firebase Web API key env.");
      return NextResponse.redirect(new URL(withBasePath("/"), request.url));
    }

    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    );

    const json = await response.json();
    const newToken = json.id_token;
    cookieStore.set("firebaseAuthToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.redirect(new URL(path, request.url));
  } catch (e) {
    console.log("Failed to refresh token: ", e);
    return NextResponse.redirect(new URL(withBasePath("/"), request.url));
  }
};
