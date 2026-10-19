import { notFound } from "next/navigation";
import { menu } from "@/config/menu";
import { Icon } from "@/components/ui/Icon";

export default async function SectionPlaceholderPage({ params }) {
  const { section } = await params;
  const item = menu.find((entry) => entry.key === section);
  if (!item) notFound();

  return (
    <div className="p-4 md:p-8">
      <div className="bg-accent rounded-xl p-8 shadow flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-[#e5eeff] flex items-center justify-center text-primary-dark">
          <Icon name={item.icon} className="text-2xl" />
        </div>
        <h1 className="text-[22px] font-semibold text-scene-content">{item.label}</h1>
        <p className="text-sm font-normal text-subtle">This module is not part of the current prototype scope.</p>
      </div>
    </div>
  );
}
