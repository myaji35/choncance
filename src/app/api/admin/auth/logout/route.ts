import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function POST() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010"));

  // Clear admin token cookie
  response.cookies.delete("admin_token");

  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010"));

  // Clear admin token cookie
  response.cookies.delete("admin_token");

  return response;
}
