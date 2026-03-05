import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const cookieStore = await cookies();
  console.log(data);
  console.log(`hellowww ${data.data.session.access_token}`);
  cookieStore.set("accessToken", data.data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 15 * 60, // 15 menit
    path: "/",
  });
  cookieStore.set("refreshToken", data.data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 hari
    path: "/",
  });

  return NextResponse.json(data);
}
