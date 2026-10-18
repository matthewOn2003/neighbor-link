import { Breadcrumb } from "./Breadcrumb";
import { PageHeader } from "./PageHeader";

/**
 * Layout shell for create / edit pages.
 *
 * title        -> page title, also used as the breadcrumb's current label
 * subtitle     -> optional description under the title
 * backLabel    -> breadcrumb label of the previous page, e.g. "Tenants"
 * backHref     -> link of the previous page, e.g. "/tenants"
 * children     -> form body (layout is entirely up to the caller)
 * actions      -> bottom-right slot (buttons, layout is up to the caller)
 * onSubmit     -> optional; when provided, everything is wrapped in a <form>
 */
export function FormPage({
  title,
  subtitle,
  backLabel,
  backHref,
  children,
  actions,
  onSubmit,
  size,
}) {
  const body = (
    <>
      {children}
      {actions && (
        <div className="flex justify-end" style={{ marginTop: "var(--section-gap)" }}>
          {actions}
        </div>
      )}
    </>
  );

  return (
    <div className={`page-container ${size ? `page-container-${size}` : "page-container-lg"}`}>
      <Breadcrumb
        items={[
          { label: backLabel, href: backHref },
          { label: title },
        ]}
      />
      <PageHeader title={title} description={subtitle} />
      {onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}
    </div>
  );
}