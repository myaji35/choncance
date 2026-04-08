// ISS-036: 언어 스위처
import Link from "next/link";
import { SUPPORTED_LANGS, LANG_LABELS, type SupportedLang } from "@/lib/translation";

interface Props {
  propertyId: string;
  current: SupportedLang;
}

export default function LangSwitcher({ propertyId, current }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500">언어:</span>
      <div className="flex gap-1">
        {SUPPORTED_LANGS.map((lang) => {
          const isActive = lang === current;
          const href =
            lang === "ko"
              ? `/property/${propertyId}`
              : `/property/${propertyId}?lang=${lang}`;
          return (
            <Link
              key={lang}
              href={href}
              className={`rounded-full px-2.5 py-1 font-semibold transition ${
                isActive
                  ? "bg-[#4A6741] text-white"
                  : "border border-[#4A6741]/30 text-[#4A6741] hover:bg-[#4A6741]/10"
              }`}
            >
              {LANG_LABELS[lang]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
