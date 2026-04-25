"use client";

/**
 * Admin: course registration policy + links to semester tuition configuration.
 * API: GET/POST /api/payments/registration_settings
 */

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Receipt } from "@mui/icons-material";
import { Link } from "react-router-dom";
import useAxios from "../../../AxiosInstance/UseAxios";

interface RegistrationSettingsDto {
  min_tuition_payment_percentage: number;
  registration_start_date: string | null;
  registration_end_date: string | null;
  require_admission_approval: boolean;
  require_enrollment: boolean;
  require_programme_enrollment: boolean;
  auto_enroll_on_admission?: boolean;
  skip_tuition_check: boolean;
  is_active: boolean;
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TuitionRegistrationSettingsPage() {
  const AxiosInstance = useAxios();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RegistrationSettingsDto>({
    min_tuition_payment_percentage: 50,
    registration_start_date: null,
    registration_end_date: null,
    require_admission_approval: true,
    require_enrollment: true,
    require_programme_enrollment: true,
    auto_enroll_on_admission: false,
    skip_tuition_check: false,
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await AxiosInstance.get<RegistrationSettingsDto>("/api/payments/registration_settings");
      setForm({
        min_tuition_payment_percentage: data.min_tuition_payment_percentage,
        registration_start_date: data.registration_start_date,
        registration_end_date: data.registration_end_date,
        require_admission_approval: data.require_admission_approval,
        require_enrollment: data.require_enrollment,
        require_programme_enrollment: data.require_programme_enrollment ?? true,
        auto_enroll_on_admission: data.auto_enroll_on_admission ?? false,
        skip_tuition_check: data.skip_tuition_check ?? false,
        is_active: data.is_active,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail || "Could not load registration settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        min_tuition_payment_percentage: form.min_tuition_payment_percentage,
        require_admission_approval: form.require_admission_approval,
        require_enrollment: form.require_enrollment,
        require_programme_enrollment: form.require_programme_enrollment,
        auto_enroll_on_admission: form.auto_enroll_on_admission ?? false,
        skip_tuition_check: form.skip_tuition_check,
        is_active: form.is_active,
      };
      const start = toDatetimeLocalValue(form.registration_start_date);
      const end = toDatetimeLocalValue(form.registration_end_date);
      payload.registration_start_date = start ? new Date(start).toISOString() : null;
      payload.registration_end_date = end ? new Date(end).toISOString() : null;

      await AxiosInstance.post("/api/payments/registration_settings/update", payload);
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; detail?: string } } };
      setError(err.response?.data?.error || err.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Receipt color="primary" />
        <Typography variant="h5" fontWeight={600}>
          Tuition &amp; course registration
        </Typography>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure <strong>amounts per program batch × semester</strong> under{" "}
        <Link to="/admin/fees-payments/batch-semester-tuition">Fees &amp; Payments → Semester tuition</Link> (same
        screen as your copy-from project). Create batches/semesters under{" "}
        <Link to="/admin/batch-management">Academic Setup → Batches, courses &amp; registration</Link> first. This page
        sets <strong>when</strong> students may register and the <strong>minimum % tuition</strong> required.
      </Alert>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Registration settings
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Minimum tuition payment (%) before course registration"
              type="number"
              fullWidth
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              value={form.min_tuition_payment_percentage}
              onChange={(e) =>
                setForm((f) => ({ ...f, min_tuition_payment_percentage: parseFloat(e.target.value) || 0 }))
              }
              helperText="Applies to each currency’s semester tuition total (see student eligibility API)."
            />

            <TextField
              label="Registration window start (optional)"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={toDatetimeLocalValue(form.registration_start_date)}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({
                  ...f,
                  registration_start_date: v ? new Date(v).toISOString() : null,
                }));
              }}
            />
            <TextField
              label="Registration window end (optional)"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={toDatetimeLocalValue(form.registration_end_date)}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({
                  ...f,
                  registration_end_date: v ? new Date(v).toISOString() : null,
                }));
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.require_admission_approval}
                  onChange={(e) => setForm((f) => ({ ...f, require_admission_approval: e.target.checked }))}
                />
              }
              label="Require student to be admitted"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.require_enrollment}
                  onChange={(e) => setForm((f) => ({ ...f, require_enrollment: e.target.checked }))}
                />
              }
              label="Require admission intake batch assigned (legacy)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.auto_enroll_on_admission}
                  onChange={(e) => setForm((f) => ({ ...f, auto_enroll_on_admission: e.target.checked }))}
                  color="success"
                />
              }
              label="Auto-enroll student on admission (skip commitment fee UGX 150,000)"
              sx={{ "& .MuiFormControlLabel-label": { fontWeight: 600 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.require_programme_enrollment}
                  onChange={(e) => setForm((f) => ({ ...f, require_programme_enrollment: e.target.checked }))}
                />
              }
              label="Require active academic programme enrollment (commitment fee confirmed)"
              sx={{ "& .MuiFormControlLabel-label": { fontWeight: 500 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.skip_tuition_check}
                  onChange={(e) => setForm((f) => ({ ...f, skip_tuition_check: e.target.checked }))}
                  color="warning"
                />
              }
              label="Skip tuition payment threshold (allow registration regardless of payment)"
              sx={{ "& .MuiFormControlLabel-label": { color: form.skip_tuition_check ? "#ed6c02" : "inherit" } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
              }
              label="Course registration enabled (master switch)"
            />

            <Button variant="contained" onClick={save} disabled={saving || loading}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Student APIs (for mobile / portal)
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                <code>GET /api/payments/student/tuition_structure</code> — semester fee lines
              </li>
              <li>
                <code>GET /api/payments/student/payment_status</code> — totals &amp; payment history
              </li>
              <li>
                <code>GET /api/payments/student/check_registration_eligibility</code> — eligibility
              </li>
              <li>
                <code>POST /api/payments/student/register_for_courses</code> — body:{" "}
                <code>course_unit_ids: number[]</code>
              </li>
            </ul>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
