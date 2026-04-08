// ISS-036: Property 다국어 번역 (lazy populate)
// OpenAI API 키가 있으면 번역, 없으면 원문 반환 (dev fallback)
import { prisma } from "./prisma";
import { openai, CHAT_MODEL } from "./graph-rag/openai-client";

export type SupportedLang = "ko" | "en" | "ja" | "zh";
export const SUPPORTED_LANGS: SupportedLang[] = ["ko", "en", "ja", "zh"];

export const LANG_LABELS: Record<SupportedLang, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

interface TranslatedFields {
  title: string;
  description: string;
  hostIntro: string;
  uniqueExperience: string;
}

type TranslationsMap = Partial<Record<SupportedLang, Partial<TranslatedFields>>>;

export function parseTranslations(raw: string): TranslationsMap {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}
  return {};
}

const LANG_PROMPT: Record<Exclude<SupportedLang, "ko">, string> = {
  en: "Translate the following Korean rural-stay listing into natural, warm English. Keep the friendly tone of a curated travel platform.",
  ja: "次の韓国の田舎宿泊リストを、丁寧で温かみのある自然な日本語に翻訳してください。",
  zh: "将以下韩国乡村住宿信息翻译成自然、温暖的简体中文,保持精选旅游平台的友好语气。",
};

/**
 * 특정 언어로 Property 번역.
 * 캐시(translations 컬럼)에 있으면 그대로 반환, 없으면 LLM 호출 후 저장.
 * OPENAI_API_KEY 미설정 시 원문 그대로 반환 (개발 fallback).
 */
export async function getTranslatedProperty(
  propertyId: string,
  lang: SupportedLang
): Promise<TranslatedFields> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      title: true,
      description: true,
      hostIntro: true,
      uniqueExperience: true,
      translations: true,
    },
  });
  if (!property) {
    return { title: "", description: "", hostIntro: "", uniqueExperience: "" };
  }

  const original: TranslatedFields = {
    title: property.title,
    description: property.description ?? "",
    hostIntro: property.hostIntro ?? "",
    uniqueExperience: property.uniqueExperience ?? "",
  };

  if (lang === "ko") return original;

  const cache = parseTranslations(property.translations);
  const cached = cache[lang];
  if (
    cached &&
    cached.title &&
    cached.description !== undefined &&
    cached.hostIntro !== undefined &&
    cached.uniqueExperience !== undefined
  ) {
    return {
      title: cached.title,
      description: cached.description ?? "",
      hostIntro: cached.hostIntro ?? "",
      uniqueExperience: cached.uniqueExperience ?? "",
    };
  }

  // LLM 호출 가능한지 확인
  if (!process.env.OPENAI_API_KEY) {
    return original; // dev fallback
  }

  try {
    const sysPrompt = LANG_PROMPT[lang as Exclude<SupportedLang, "ko">];
    const userContent = JSON.stringify({
      title: original.title,
      description: original.description,
      hostIntro: original.hostIntro,
      uniqueExperience: original.uniqueExperience,
    });
    const res = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${sysPrompt}\nReturn JSON with the same keys: title, description, hostIntro, uniqueExperience. Do not add commentary.`,
        },
        { role: "user", content: userContent },
      ],
    });
    const content = res.choices[0]?.message?.content;
    if (!content) return original;

    const parsed = JSON.parse(content) as Partial<TranslatedFields>;
    const translated: TranslatedFields = {
      title: parsed.title || original.title,
      description: parsed.description ?? original.description,
      hostIntro: parsed.hostIntro ?? original.hostIntro,
      uniqueExperience: parsed.uniqueExperience ?? original.uniqueExperience,
    };

    // 캐시 저장 (fire-and-forget)
    const updatedCache = { ...cache, [lang]: translated };
    prisma.property
      .update({
        where: { id: propertyId },
        data: { translations: JSON.stringify(updatedCache) },
      })
      .catch((err) => console.error("[translation] cache save failed:", err));

    return translated;
  } catch (err) {
    console.error("[translation] LLM 실패:", err);
    return original;
  }
}
