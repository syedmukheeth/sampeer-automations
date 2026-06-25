import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { InvoicePackage } from "./schema.js";
import { formatMoney } from "./calc.js";

// Brand palette — Sampeer Studio
const BRAND = "#0F172A"; // slate-900
const ACCENT = "#6366F1"; // indigo-500
const MUTED = "#64748B"; // slate-500
const LINE = "#E2E8F0"; // slate-200

const s = StyleSheet.create({
  page: {
    paddingHorizontal: 44,
    paddingVertical: 40,
    fontSize: 10,
    color: BRAND,
    fontFamily: "Helvetica",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  logo: { width: 90, height: 40, objectFit: "contain" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: BRAND },
  invoiceTitle: { fontSize: 24, fontFamily: "Helvetica-Bold", color: ACCENT, textAlign: "right" },
  metaLabel: { color: MUTED, fontSize: 8, textTransform: "uppercase", letterSpacing: 1 },
  metaValue: { fontSize: 10, marginBottom: 6 },
  small: { color: MUTED, fontSize: 9, lineHeight: 1.5 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 26 },
  party: { width: "48%" },
  partyName: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 2 },
  tHead: {
    flexDirection: "row",
    backgroundColor: BRAND,
    color: "#FFFFFF",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  cDesc: { width: "52%" },
  cQty: { width: "12%", textAlign: "right" },
  cRate: { width: "18%", textAlign: "right" },
  cAmt: { width: "18%", textAlign: "right" },
  th: { color: "#FFFFFF", fontSize: 9, fontFamily: "Helvetica-Bold" },
  totals: { marginTop: 16, alignSelf: "flex-end", width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 4,
    backgroundColor: "#EEF2FF",
    borderRadius: 4,
  },
  grandText: { fontFamily: "Helvetica-Bold", fontSize: 12, color: ACCENT },
  block: { marginTop: 26 },
  payLine: { marginBottom: 2, fontSize: 9 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 8,
    textAlign: "center",
  },
});

function paymentLines(pkg: InvoicePackage): string[] {
  const d = pkg.payment.details;
  const out: string[] = [];
  if (!d) return out;
  if (d.bankTransfer) {
    const b = d.bankTransfer;
    out.push(
      `Bank Transfer — ${[b.bankName, b.accountName, b.accountNumber, b.ifscOrSwift]
        .filter(Boolean)
        .join(" / ")}`,
    );
  }
  if (d.upi) out.push(`UPI — ${d.upi.id}`);
  if (d.stripe) out.push(`Stripe — ${d.stripe.link}`);
  if (d.wise) out.push(`Wise — ${d.wise.link}`);
  if (d.paypal) out.push(`PayPal — ${d.paypal.email}`);
  return out;
}

export function InvoiceDocument({ pkg }: { pkg: InvoicePackage }) {
  const cur = pkg.invoice.currency;
  const money = (n: number) => formatMoney(n, cur);

  return (
    <Document
      title={`Invoice ${pkg.invoice.invoiceNumber}`}
      author={pkg.company.name}
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            {pkg.company.logoUrl ? (
              <Image src={pkg.company.logoUrl} style={s.logo} />
            ) : (
              <Text style={s.companyName}>{pkg.company.name}</Text>
            )}
            <Text style={[s.small, { marginTop: 6, maxWidth: 200 }]}>
              {pkg.company.address}
            </Text>
            {pkg.company.email ? <Text style={s.small}>{pkg.company.email}</Text> : null}
            {pkg.company.phone ? <Text style={s.small}>{pkg.company.phone}</Text> : null}
          </View>
          <View style={{ width: "45%" }}>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <View style={{ marginTop: 10, alignItems: "flex-end" }}>
              <Meta label="Invoice #" value={pkg.invoice.invoiceNumber} />
              <Meta label="Issue Date" value={pkg.invoice.issueDate} />
              <Meta label="Due Date" value={pkg.invoice.dueDate} />
              <Meta label="Status" value={pkg.invoice.status} />
              {pkg.invoice.referenceNumber ? (
                <Meta label="Reference" value={pkg.invoice.referenceNumber} />
              ) : null}
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.sectionTitle}>Billed To</Text>
            <Text style={s.partyName}>{pkg.client.name}</Text>
            {pkg.client.address ? <Text style={s.small}>{pkg.client.address}</Text> : null}
            <Text style={s.small}>{pkg.client.email}</Text>
            {pkg.client.phone ? <Text style={s.small}>{pkg.client.phone}</Text> : null}
          </View>
          <View style={s.party}>
            <Text style={s.sectionTitle}>Project</Text>
            <Text style={s.partyName}>{pkg.project.name}</Text>
            {pkg.invoice.projectId ? (
              <Text style={s.small}>ID: {pkg.invoice.projectId}</Text>
            ) : null}
            {pkg.project.description ? (
              <Text style={s.small}>{pkg.project.description}</Text>
            ) : null}
            {pkg.invoice.paymentTerms ? (
              <Text style={s.small}>Terms: {pkg.invoice.paymentTerms}</Text>
            ) : null}
          </View>
        </View>

        {/* Items table */}
        <View style={s.tHead}>
          <Text style={[s.th, s.cDesc]}>Description</Text>
          <Text style={[s.th, s.cQty]}>Qty</Text>
          <Text style={[s.th, s.cRate]}>Unit Price</Text>
          <Text style={[s.th, s.cAmt]}>Amount</Text>
        </View>
        {pkg.items.map((it, i) => (
          <View key={i} style={s.tRow}>
            <Text style={s.cDesc}>{it.description}</Text>
            <Text style={s.cQty}>{it.quantity}</Text>
            <Text style={s.cRate}>{money(it.unitPrice)}</Text>
            <Text style={s.cAmt}>{money(it.lineTotal)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totals}>
          <TotalRow label="Subtotal" value={money(pkg.summary.subtotal)} />
          {pkg.summary.discount > 0 ? (
            <TotalRow label="Discount" value={`- ${money(pkg.summary.discount)}`} />
          ) : null}
          {pkg.summary.tax > 0 ? (
            <TotalRow label="Tax" value={money(pkg.summary.tax)} />
          ) : null}
          <View style={s.grand}>
            <Text style={s.grandText}>Total Due</Text>
            <Text style={s.grandText}>{money(pkg.summary.total)}</Text>
          </View>
          {pkg.summary.paid > 0 ? (
            <>
              <TotalRow label="Amount Paid" value={`- ${money(pkg.summary.paid)}`} />
              <TotalRow label="Balance Due" value={money(pkg.summary.remaining)} bold />
            </>
          ) : null}
        </View>

        {/* Payment instructions */}
        {pkg.payment.methods.length ? (
          <View style={s.block}>
            <Text style={s.sectionTitle}>Payment Instructions</Text>
            <Text style={[s.small, { marginBottom: 4 }]}>{pkg.payment.instructions}</Text>
            {paymentLines(pkg).map((l, i) => (
              <Text key={i} style={s.payLine}>
                • {l}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Notes */}
        {pkg.notes ? (
          <View style={s.block}>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text style={s.small}>{pkg.notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.small}>
            {pkg.company.name} · {pkg.company.email ?? ""} · Thank you for your business
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

function TotalRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  const f = bold ? { fontFamily: "Helvetica-Bold" as const } : {};
  return (
    <View style={s.totalRow}>
      <Text style={[{ color: MUTED }, f]}>{label}</Text>
      <Text style={f}>{value}</Text>
    </View>
  );
}
