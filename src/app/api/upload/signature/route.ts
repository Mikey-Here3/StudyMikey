import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dummy-cloud-name",
  api_key: process.env.CLOUDINARY_API_KEY || "dummy-api-key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "dummy-api-secret",
});

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "studymikey_profiles",
      },
      process.env.CLOUDINARY_API_SECRET || "dummy-api-secret"
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY || "dummy-api-key",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "dummy-cloud-name",
      folder: "studymikey_profiles",
    });
  } catch (error: any) {
    console.error("Cloudinary Signature Error:", error);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
