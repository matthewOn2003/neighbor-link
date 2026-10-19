export default function FeatureCard({ icon, title, description, status, href }) {
  return (
    <a href={href} className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#526e61] focus-visible:ring-offset-2">
      <article className="flex min-h-48 flex-col rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b7cbc0] hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf4f0] text-xl text-[#315b4c]" aria-hidden="true">{icon}</span>
          <span className="rounded-full bg-[#f3f5f4] px-2.5 py-1 text-xs font-semibold text-[#71827c]">{status}</span>
        </div>
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#71827c]">{description}</p>
        <span className="mt-auto pt-4 text-xs font-semibold text-[#315b4c] group-hover:underline">{href === "/billing" ? "↗" : "→"}</span>
      </article>
    </a>
  );
}
