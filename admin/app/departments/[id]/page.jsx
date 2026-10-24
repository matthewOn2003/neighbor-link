"use client";

import { use } from "react";
import { DepartmentForm } from "@/components/staff/DepartmentForm";
import { RecordFallback } from "@/components/staff/common";
import { useStaffRecord } from "@/components/staff/useStaffRecord";
import { api } from "@/services/api";

export default function EditDepartmentPage({ params }) {
  const { id } = use(params);
  const { record, loading } = useStaffRecord(api.staffDepartment.list, id);

  return (
    <RecordFallback loading={loading} found={Boolean(record)}>
      {record ? <DepartmentForm record={record} /> : null}
    </RecordFallback>
  );
}
