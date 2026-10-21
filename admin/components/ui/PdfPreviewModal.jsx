"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { useLocale } from "@/i18n";

// 只在弹窗打开时挂载，因此每次打开都从干净的状态开始。
function PdfPreviewBody({ build, fileName, onClose, title }) {
  const { t } = useLocale();
  const [state, setState] = useState({ url: "", blob: null, error: "" });

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    Promise.resolve()
      .then(() => build())
      .then((result) => {
        if (cancelled) return;
        const nextBlob = result instanceof Blob ? result : result.output("blob");
        objectUrl = URL.createObjectURL(nextBlob);
        setState({ url: objectUrl, blob: nextBlob, error: "" });
      })
      .catch((err) => {
        if (!cancelled) setState({ url: "", blob: null, error: err?.message || t("pdf_generate_failed") });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // build 由调用方保证稳定；每次挂载只生成一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function download() {
    if (!state.blob) return;
    const link = document.createElement("a");
    const href = URL.createObjectURL(state.blob);
    link.href = href;
    link.download = `${fileName || "document"}.pdf`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-4">
      {state.error ? <p className="text-sm text-error">{state.error}</p> : null}
      {!state.url && !state.error ? (
        <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" label={t("loading")} /></div>
      ) : null}
      {state.url ? <iframe title={title} src={state.url} className="h-[70vh] w-full rounded-lg border border-line/40" /> : null}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-outline" onClick={onClose}>{t("close")}</button>
        <button type="button" className="btn btn-primary" onClick={download} disabled={!state.blob}>{t("download_pdf")}</button>
      </div>
    </div>
  );
}

/**
 * 大弹窗内嵌预览 PDF。build() 返回 jsPDF 文档（或 Blob），弹窗打开时生成，关闭时释放。
 * fileName 用于下载按钮。
 */
export function PdfPreviewModal({ open, onClose, title, fileName, build }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="xl">
      {open ? <PdfPreviewBody build={build} fileName={fileName} onClose={onClose} title={title} /> : null}
    </Modal>
  );
}
