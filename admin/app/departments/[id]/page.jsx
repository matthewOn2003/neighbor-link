"use client";

import { use } from "react";
import { DepartmentForm } from "@/components/staff/DepartmentForm";
import { RecordFallback } from "@/components/staff/common";
import { useStaffRecord } from "@/components/staff/useStaffRecord";

export default function EditDepartmentPage({ params }) {
  const { id } = use(params);
  const { record, loading } = useStaffRecord("/staff-department/list", id);

  return (
    <RecordFallback loading={loading} found={Boolean(record)}>
      {record ? <DepartmentForm record={record} /> : null}
    </RecordFallback>
  );
}
