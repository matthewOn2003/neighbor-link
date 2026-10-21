import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";

export type BreadcrumbItem = {
  label: string;
  href?: string; // omit on the last (current) item
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useLocale();
  return (
    <nav aria-label={t("breadcrumb")} style={{ marginBottom: "1rem" }}>
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} style={{ color: "var(--subtle)" }} className="hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" style={{ color: "var(--subtle)" }}>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
