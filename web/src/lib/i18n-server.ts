import en from "@/i18n/messages/en.json";
import zh from "@/i18n/messages/zh.json";

type Messages = typeof en;

const messagesMap: Record<string, Messages> = { en, zh };

export function getTranslations(locale: string, namespace: string) {
  const messages = messagesMap[locale] || en;
  const ns = (messages as unknown as Record<string, Record<string, unknown>>)[namespace];
  const fallbackNs = (en as unknown as Record<string, Record<string, unknown>>)[namespace];
  return (key: string): string => {
    const v = ns?.[key] ?? fallbackNs?.[key];
    return typeof v === "string" ? v : key;
  };
}
