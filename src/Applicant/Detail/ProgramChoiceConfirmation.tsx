"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import useAxios from "../../AxiosInstance/UseAxios";

type ProgramOption = { id: number; name: string; code?: string };

type ChoicePayload = {
  application_id: number;
  status: string;
  program_choices_confirmed_at: string | null;
  program_choices_suspect?: boolean;
  can_update_programs: boolean;
  can_confirm: boolean;
  is_confirmed: boolean;
  current_programs: ProgramOption[];
  available_programs: ProgramOption[];
};

interface ProgramChoiceConfirmationProps {
  applicationId: number;
  onConfirmed?: () => void;
}

export default function ProgramChoiceConfirmation({
  applicationId,
  onConfirmed,
}: ProgramChoiceConfirmationProps) {
  const AxiosInstance = useAxios();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<ChoicePayload | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [verifiedIntended, setVerifiedIntended] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AxiosInstance.get<ChoicePayload>(
        `/api/admissions/applicant_program_choices/${applicationId}`
      );
      setData(res.data);
      setSelectedIds(res.data.current_programs.map((p) => p.id));
      setVerifiedIntended(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not load programme choices.");
    } finally {
      setLoading(false);
    }
  }, [AxiosInstance, applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  const availableById = useMemo(() => {
    const map = new Map<number, ProgramOption>();
    (data?.available_programs || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [data?.available_programs]);

  const selectedPrograms = useMemo(
    () => selectedIds.map((id) => availableById.get(id)).filter(Boolean) as ProgramOption[],
    [selectedIds, availableById]
  );

  if (loading) {
    return (
      <Card sx={{ boxShadow: 1 }}>
        <CardContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </CardContent>
      </Card>
    );
  }

  if (!data?.can_update_programs && !data?.is_confirmed) {
    return null;
  }

  const handleSave = async () => {
    if (selectedIds.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await AxiosInstance.patch(
        `/api/admissions/applicant_program_choices/${applicationId}`,
        { program_ids: selectedIds }
      );
      setData(res.data);
      setSelectedIds(res.data.current_programs.map((p: ProgramOption) => p.id));
      setSuccess("Programme choices saved. Confirm when they are correct.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save programme choices.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return;
    setConfirming(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await AxiosInstance.post(
        `/api/admissions/applicant_program_choices/${applicationId}`,
        { program_ids: selectedIds }
      );
      setData(res.data);
      setSuccess(res.data.detail || "Programme choices confirmed.");
      window.dispatchEvent(new CustomEvent("programChoicesConfirmed", { detail: { applicationId } }));
      onConfirmed?.();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to confirm programme choices.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Card
      sx={{
        boxShadow: 2,
        border: data.is_confirmed ? "2px solid #7B1FA2" : "2px solid #5ba3f5",
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Programme choices
          </Typography>
        }
        subheader="Review your programme(s) of choice carefully. If anything looks wrong, change them before confirming. No extra application fee is required."
        action={
          data.is_confirmed ? (
            <Chip
              icon={<CheckCircleIcon />}
              label="Confirmed"
              size="small"
              sx={{ bgcolor: "#7B1FA2", color: "#fff", fontWeight: 600, "& .MuiChip-icon": { color: "#fff" } }}
            />
          ) : (
            <Chip label="Action required" color="warning" size="small" />
          )
        }
      />
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {data.program_choices_suspect && (
          <Alert severity="warning">
            The programme(s) shown below may not match what you originally applied for because of a
            system data correction. Please check each name carefully, update if needed, and only
            confirm when they are your real choices.
          </Alert>
        )}

        {!data.program_choices_suspect && !data.is_confirmed && (
          <Alert severity="info">
            Confirm only if these programme(s) are exactly what you intended to apply for.
          </Alert>
        )}

        {data.can_update_programs && data.available_programs.length > 0 ? (
          <Autocomplete
            multiple
            options={data.available_programs}
            getOptionLabel={(o) => o.name}
            value={selectedPrograms}
            disabled={data.is_confirmed}
            onChange={(_, value) => {
              if (value.length <= 3) {
                setSelectedIds(value.map((p) => p.id));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Programme(s) of choice (1–3)"
                helperText="Update if needed, then confirm below."
              />
            )}
          />
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {data.current_programs.map((p, i) => (
              <Chip
                key={p.id}
                label={`${i + 1}. ${p.name}`}
                size="small"
                sx={{ bgcolor: "#0D0060", color: "#fff", fontWeight: 600 }}
              />
            ))}
          </Box>
        )}

        {!data.is_confirmed && data.can_confirm && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={verifiedIntended}
                  onChange={(e) => setVerifiedIntended(e.target.checked)}
                />
              }
              label="I have checked that these programme(s) are the ones I applied for."
            />
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {data.can_update_programs && (
                <Button
                  variant="outlined"
                  disabled={saving || confirming || selectedIds.length === 0}
                  onClick={handleSave}
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              )}
              <Button
                variant="contained"
                disabled={
                  saving || confirming || selectedIds.length === 0 || !verifiedIntended
                }
                onClick={handleConfirm}
                sx={{ bgcolor: "#7B1FA2", "&:hover": { bgcolor: "#6A1B9A" } }}
              >
                {confirming ? "Confirming…" : "Confirm programme choices"}
              </Button>
            </Box>
          </>
        )}

        {data.is_confirmed && data.program_choices_confirmed_at && (
          <Typography variant="body2" color="text.secondary">
            Confirmed on{" "}
            {new Date(data.program_choices_confirmed_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            . Contact admissions if you need further changes.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
