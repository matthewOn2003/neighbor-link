"use client";

import { use } from "react";
import { PositionForm } from "@/components/staff/PositionForm";
import { RecordFallback } from "@/components/staff/common";
import { useStaffRecord } from "@/components/staff/useStaffRecord";

export default function EditPositionPage({ params }) {
  const { id } = use(params);
  const { record, loading } = useStaffRecord("/staff-position/list", id);

  return (
    <RecordFallback loading={loading} found={Boolean(record)}>
      {record ? <PositionForm record={record} /> : null}
    </RecordFallback>
  );
}
