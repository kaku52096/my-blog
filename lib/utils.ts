import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "yyyy年M月d日", { locale: zhCN });
  } catch {
    return dateString;
  }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
