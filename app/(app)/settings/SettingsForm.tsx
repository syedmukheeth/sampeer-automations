"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { Button } from "@shared/ui/Button";
import { SectionHeader } from "@shared/ui/SectionHeader";
import { PROMPT_VERSIONS, type Settings } from "@shared/services/settings-schema";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [save, setSave] = useState<SaveState>("idle");
  const [msg, setMsg] = useState("");

  const setBrand = (k: keyof Settings["branding"]) => (v: string) =>
    setS((p) => ({ ...p, branding: { ...p.branding, [k]: v } as Settings["branding"] }));
  const setInv = (k: keyof Settings["invoice"], num = false) => (v: string) =>
    setS((p) => ({
      ...p,
      invoice: { ...p.invoice, [k]: num ? Number(v) || 0 : v } as Settings["invoice"],
    }));

  async function onSave() {
    setSave("saving");
    setMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setS(data.settings);
      setSave("saved");
      if (!data.persisted) setMsg("Saved in memory - this filesystem isn't writable (add a KV store for durable prod settings).");
      setTimeout(() => setSave("idle"), 2500);
    } catch (err) {
      setSave("error");
      setMsg((err as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Branding / white-label */}
      <section>
        <SectionHeader title="Branding (White-label)" />
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Company Name" v={s.branding.companyName} onChange={setBrand("companyName")} />
          <Field label="Email" v={s.branding.companyEmail} onChange={setBrand("companyEmail")} />
          <Field label="Address" wide v={s.branding.companyAddress} onChange={setBrand("companyAddress")} />
          <Field label="Phone" v={s.branding.companyPhone} onChange={setBrand("companyPhone")} />
          <Field label="Logo URL" v={s.branding.logoUrl} onChange={setBrand("logoUrl")} />
          <ColorField label="Accent Color" v={s.branding.accentColor} onChange={setBrand("accentColor")} />
          <Field label="Email Signature Name" v={s.branding.emailSignatureName} onChange={setBrand("emailSignatureName")} />
          <Field label="Invoice Footer" wide v={s.branding.invoiceFooter} onChange={setBrand("invoiceFooter")} />
        </Card>
      </section>

      {/* Invoice defaults */}
      <section>
        <SectionHeader title="Invoice Generator / Defaults" />
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Default Currency" v={s.invoice.defaultCurrency} onChange={setInv("defaultCurrency")} />
          <Field label="Invoice Prefix" v={s.invoice.invoicePrefix} onChange={setInv("invoicePrefix")} />
          <Field label="Tax Name" v={s.invoice.taxName} onChange={setInv("taxName")} />
          <Field label="Tax Rate %" type="number" v={String(s.invoice.taxRate)} onChange={setInv("taxRate", true)} />
          <Field label="Payment Terms" v={s.invoice.paymentTermsDefault} onChange={setInv("paymentTermsDefault")} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-muted">Prompt Version</span>
            <select
              value={s.invoice.promptVersion}
              onChange={(e) => setInv("promptVersion")(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {PROMPT_VERSIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        </Card>
      </section>

      {/* Save bar */}
      <div className="flex items-center gap-4">
        <Button onClick={onSave} disabled={save === "saving"}>
          {save === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {save === "saving" ? "Saving..." : save === "saved" ? "Saved" : "Save changes"}
        </Button>
        {msg && (
          <span className={`text-sm ${save === "error" ? "text-rose-600" : "text-amber-600"}`}>{msg}</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  v,
  onChange,
  type = "text",
  wide,
}: {
  label: string;
  v: string;
  onChange: (v: string) => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-medium text-muted">{label}</span>
      <input
        type={type}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-panel px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}

function ColorField({ label, v, onChange }: { label: string; v: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-panel"
        />
        <input
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
    </label>
  );
}
