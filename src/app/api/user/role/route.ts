import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { getUserRole } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole();

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Failed to get user role:", error);
    return NextResponse.json(
      { error: "Failed to get user role" },
      { status: 500 }
    );
  }
}
