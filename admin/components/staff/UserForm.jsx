"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { useRequest } from "@/hooks/useRequest";
import { FormPage, FormSection, Input, Select, useToast } from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import { Spinner } from "@/components/ui/Spinner";
import { accountCreate, accountUpdate } from "@/services/staff/account";
import { saveErrorMessage, useStatusOptions } from "./common";

const EMPTY_FORM = {
  username: "",
  password: "",
  name: "",
  phone: "",
  email: "",
  employee_no: "",
  hire_date: "",
  position_id: "",
  status: "active",
};

export function UserForm({ record }) {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const statusOptions = useStatusOptions();
  const { data: positionData } = useRequest("/staff-position/list", { per_page: 100 });
  const positions = positionData?.list ?? [];

  const [form, setForm] = useState(() =>
    record ? { ...EMPTY_FORM, ...record, password: "", position_id: String(record.position_id) } : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(record);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = t("field_required");
    if (!isEdit && !form.password) nextErrors.password = t("field_required");
    if (!form.name.trim()) nextErrors.name = t("field_required");
    if (!form.position_id) nextErrors.position_id = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = {
      username: form.username.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      employee_no: form.employee_no.trim(),
      hire_date: form.hire_date,
      position_id: Number(form.position_id),
      status: form.status,
    };
    // 编辑时密码留空表示不修改
    if (form.password) body.password = form.password;

    setSaving(true);
    try {
      if (isEdit) {
        await accountUpdate(record.id, body);
      } else {
        await accountCreate(body);
      }
      toast.success(t("record_saved"));
      router.push("/users");
    } catch (err) {
      toast.error(saveErrorMessage(err, t, "save_failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormPage
      title={isEdit ? t("edit_user") : t("new_user")}
      subtitle={t("users_description")}
      backLabel={t("users")}
      backHref="/users"
      onSubmit={handleSubmit}
      size="md"
      actions={(
        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" onClick={() => router.push("/users")} disabled={saving}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("save_changes")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Input label={t("account")} name="username" value={form.username} onChange={(v) => updateField("username", v)} required error={errors.username} />
        <Input
          label={isEdit ? t("new_password_optional") : t("password")}
          name="password"
          type="password"
          value={form.password}
          onChange={(v) => updateField("password", v)}
          required={!isEdit}
          error={errors.password}
        />
        <Input label={t("name")} name="name" value={form.name} onChange={(v) => updateField("name", v)} required error={errors.name} />
        <Input label={t("phone")} name="phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
        <Input label={t("email")} name="email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
        <Input label={t("employee_no")} name="employee_no" value={form.employee_no} onChange={(v) => updateField("employee_no", v)} />
        <DatePicker label={t("hire_date")} name="hire_date" value={form.hire_date} onChange={(v) => updateField("hire_date", v)} />
        <Select
          label={t("position")}
          name="position_id"
          value={form.position_id}
          onChange={(v) => updateField("position_id", v)}
          options={positions.map((p) => ({ label: `${p.department_name} / ${p.name}`, value: String(p.id) }))}
          placeholder={t("select_position")}
          required
          error={errors.position_id}
        />
        <Select label={t("status")} name="status" value={form.status} onChange={(v) => updateField("status", v)} options={statusOptions} />
      </FormSection>
    </FormPage>
  );
}
