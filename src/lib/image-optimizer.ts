import sharp from "sharp";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ImageOptimizationResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export async function optimizeImageWithAI(
  imageBuffer: Buffer,
  originalFilename: string
): Promise<ImageOptimizationResult> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const { width = 0, height = 0, format } = metadata;

    console.log(`[Image Optimizer] Original: ${width}x${height}, format: ${format}`);

    let aiRecommendation = null;
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
      try {
        aiRecommendation = await analyzeImageWithGemini(imageBuffer);
        console.log(`[Image Optimizer] Gemini AI:`, aiRecommendation);
      } catch (error) {
        console.warn("[Image Optimizer] Gemini AI failed, using default", error);
      }
    }

    const targetWidth = determineTargetWidth(width, height, aiRecommendation);
    const targetHeight = determineTargetHeight(width, height, aiRecommendation);
    const targetFormat = determineTargetFormat(format);

    let pipeline = sharp(imageBuffer);

    if (width > targetWidth || height > targetHeight) {
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (targetFormat === "webp") {
      pipeline = pipeline.webp({ quality: 85, effort: 4 });
    } else if (targetFormat === "jpeg" || targetFormat === "jpg") {
      pipeline = pipeline.jpeg({ quality: 85, progressive: true });
    } else if (targetFormat === "png") {
      pipeline = pipeline.png({ compressionLevel: 8 });
    }

    pipeline = pipeline.rotate();

    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    const sizePercent = (optimizedBuffer.length / imageBuffer.length * 100).toFixed(0);
    console.log(
      `[Image Optimizer] Optimized: ${optimizedMetadata.width}x${optimizedMetadata.height}, ` +
      `format: ${optimizedMetadata.format}, size: ${optimizedBuffer.length} bytes (${sizePercent}%)`
    );

    return {
      buffer: optimizedBuffer,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
      format: optimizedMetadata.format || targetFormat,
      size: optimizedBuffer.length,
    };
  } catch (error) {
    console.error("[Image Optimizer] Failed:", error);
    throw new Error("Image optimization failed");
  }
}

async function analyzeImageWithGemini(imageBuffer: Buffer): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this image and provide information in JSON format:
{
  "imageType": "portrait/landscape/square",
  "mainSubject": "main subject",
  "suggestedAspectRatio": "16:9, 4:3, 1:1 etc",
  "quality": "high/medium/low",
  "brightness": "bright/normal/dark",
  "focus": "sharp/normal/blurry"
}`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: "image/jpeg",
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/{[sS]*}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn("[Gemini AI] JSON parse failed:", text);
  }

  return null;
}

function determineTargetWidth(width: number, height: number, aiRecommendation: any): number {
  const MAX_WIDTH = 1920;

  if (aiRecommendation?.imageType === "portrait") {
    return Math.min(width, 1080);
  }

  return Math.min(width, MAX_WIDTH);
}

function determineTargetHeight(width: number, height: number, aiRecommendation: any): number {
  const MAX_HEIGHT = 1080;

  if (aiRecommendation?.imageType === "landscape") {
    return Math.min(height, 1080);
  }

  return Math.min(height, MAX_HEIGHT);
}

function determineTargetFormat(originalFormat: string | undefined): string {
  if (originalFormat === "png") {
    return "webp";
  }
  
  return "webp";
}
