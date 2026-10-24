"use client";

import { use } from "react";
import { UserForm } from "@/components/staff/UserForm";
import { RecordFallback } from "@/components/staff/common";
import { useStaffRecord } from "@/components/staff/useStaffRecord";

export default function EditUserPage({ params }) {
  const { id } = use(params);
  const { record, loading } = useStaffRecord("/staff-account/list", id);

  return (
    <RecordFallback loading={loading} found={Boolean(record)}>
      {record ? <UserForm record={record} /> : null}
    </RecordFallback>
  );
}
