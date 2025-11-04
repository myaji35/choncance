import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { qrLoginStore } from "@/lib/qr-login-store";
import { networkInterfaces } from "os";

export const dynamic = "force-dynamic";

// Get local IP address
function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netInfo = nets[name];
    if (!netInfo) continue;

    for (const net of netInfo) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// POST /api/admin/qr-login/generate - Generate QR code for admin login
export async function POST(request: NextRequest) {
  try {
    // Generate unique session ID
    const sessionId = uuidv4();

    // Create session in store
    qrLoginStore.createSession(sessionId);

    // Get the host from request headers or use local IP
    const host = request.headers.get("host") || `${getLocalIP()}:3010`;
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "http";

    // For mobile access, always use local IP
    const localIP = getLocalIP();
    const baseUrl = `${protocol}://${localIP}:3010`;

    const verifyUrl = `${baseUrl}/admin/qr-verify?sessionId=${sessionId}`;

    console.log(`[QR Login] Generated QR with URL: ${verifyUrl}`);

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({
      sessionId,
      qrDataUrl,
      expiresIn: 300, // 5 minutes
      baseUrl, // Return for debugging
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return NextResponse.json(
      { error: "QR 코드 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
