import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { ProposalPackage } from "./schema.js";
import { formatMoney } from "./calc.js";

const BRAND = "#0F172A";
const DEFAULT_ACCENT = "#6366F1";
const MUTED = "#64748B";
const LINE = "#E2E8F0";

function makeStyles(accent: string) {
  return StyleSheet.create({
    page: { paddingHorizontal: 44, paddingVertical: 40, fontSize: 10, color: BRAND, fontFamily: "Helvetica" },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
    logo: { width: 90, height: 40, objectFit: "contain" },
    companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: BRAND },
    eyebrow: { color: accent, fontSize: 8, textTransform: "uppercase", letterSpacing: 2, fontFamily: "Helvetica-Bold" },
    title: { fontSize: 26, fontFamily: "Helvetica-Bold", color: BRAND, marginTop: 4, maxWidth: 320 },
    small: { color: MUTED, fontSize: 9, lineHeight: 1.5 },
    metaLabel: { color: MUTED, fontSize: 8, textTransform: "uppercase", letterSpacing: 1 },
    metaValue: { fontSize: 10, marginBottom: 6 },
    sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
    parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    party: { width: "48%" },
    partyName: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 2 },
    summaryText: { fontSize: 10, lineHeight: 1.6, color: "#334155" },
    block: { marginTop: 24 },
    tHead: { flexDirection: "row", backgroundColor: BRAND, color: "#FFFFFF", paddingVertical: 7, paddingHorizontal: 8, borderRadius: 4 },
    tRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: LINE },
    cName: { width: "46%" },
    cQty: { width: "12%", textAlign: "right" },
    cRate: { width: "21%", textAlign: "right" },
    cAmt: { width: "21%", textAlign: "right" },
    itemName: { fontFamily: "Helvetica-Bold", fontSize: 10 },
    itemDesc: { color: MUTED, fontSize: 8, marginTop: 2 },
    th: { color: "#FFFFFF", fontSize: 9, fontFamily: "Helvetica-Bold" },
    totals: { marginTop: 14, alignSelf: "flex-end", width: "45%" },
    totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
    grand: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 8, marginTop: 4, backgroundColor: "#EEF2FF", borderRadius: 4 },
    grandText: { fontFamily: "Helvetica-Bold", fontSize: 12, color: accent },
    terms: { fontSize: 9, lineHeight: 1.6, color: "#334155" },
    footer: { position: "absolute", bottom: 28, left: 44, right: 44, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8, textAlign: "center" },
  });
}

export function ProposalDocument({ pkg }: { pkg: ProposalPackage }) {
  const cur = pkg.proposal.currency;
  const money = (n: number) => formatMoney(n, cur);
  const accent = pkg.branding?.accentColor || DEFAULT_ACCENT;
  const s = makeStyles(accent);
  const footerText = pkg.branding?.invoiceFooter || "Thank you for the opportunity";

  return (
    <Document title={`Proposal ${pkg.proposal.number}`} author={pkg.company.name}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ maxWidth: 340 }}>
            <Text style={s.eyebrow}>Proposal</Text>
            <Text style={s.title}>{pkg.proposal.title}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            {pkg.company.logoUrl ? (
              <Image src={pkg.company.logoUrl} style={s.logo} />
            ) : (
              <Text style={s.companyName}>{pkg.company.name}</Text>
            )}
            <View style={{ marginTop: 10, alignItems: "flex-end" }}>
              <Meta label="Proposal #" value={pkg.proposal.number} />
              <Meta label="Date" value={pkg.proposal.date} />
              <Meta label="Valid Until" value={pkg.proposal.validUntil} />
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.sectionTitle}>Prepared For</Text>
            <Text style={s.partyName}>{pkg.client.name}</Text>
            {pkg.client.company ? <Text style={s.small}>{pkg.client.company}</Text> : null}
            {pkg.client.address ? <Text style={s.small}>{pkg.client.address}</Text> : null}
            <Text style={s.small}>{pkg.client.email}</Text>
          </View>
          <View style={s.party}>
            <Text style={s.sectionTitle}>Prepared By</Text>
            <Text style={s.partyName}>{pkg.proposal.preparedBy || pkg.company.name}</Text>
            <Text style={s.small}>{pkg.company.address}</Text>
            {pkg.company.email ? <Text style={s.small}>{pkg.company.email}</Text> : null}
          </View>
        </View>

        {/* Executive summary */}
        <View>
          <Text style={s.sectionTitle}>Executive Summary</Text>
          <Text style={s.summaryText}>{pkg.executiveSummary}</Text>
        </View>

        {/* Investment */}
        <View style={s.block}>
          <Text style={s.sectionTitle}>Investment</Text>
          <View style={s.tHead}>
            <Text style={[s.th, s.cName]}>Item</Text>
            <Text style={[s.th, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cRate]}>Unit</Text>
            <Text style={[s.th, s.cAmt]}>Amount</Text>
          </View>
          {pkg.items.map((it, i) => (
            <View key={i} style={s.tRow}>
              <View style={s.cName}>
                <Text style={s.itemName}>{it.name}</Text>
                {it.description ? <Text style={s.itemDesc}>{it.description}</Text> : null}
              </View>
              <Text style={s.cQty}>{it.quantity}</Text>
              <Text style={s.cRate}>{money(it.unitPrice)}</Text>
              <Text style={s.cAmt}>{money(it.lineTotal)}</Text>
            </View>
          ))}
          <View style={s.totals}>
            <TotalRow label="Subtotal" value={money(pkg.summary.subtotal)} />
            {pkg.summary.discount > 0 ? <TotalRow label="Discount" value={`- ${money(pkg.summary.discount)}`} /> : null}
            {pkg.summary.tax > 0 ? <TotalRow label="Tax" value={money(pkg.summary.tax)} /> : null}
            <View style={s.grand}>
              <Text style={s.grandText}>Total Investment</Text>
              <Text style={s.grandText}>{money(pkg.summary.total)}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        {pkg.terms ? (
          <View style={s.block}>
            <Text style={s.sectionTitle}>Terms</Text>
            <Text style={s.terms}>{pkg.terms}</Text>
          </View>
        ) : null}

        {/* Notes */}
        {pkg.notes ? (
          <View style={s.block}>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text style={s.small}>{pkg.notes}</Text>
          </View>
        ) : null}

        <View style={s.footer} fixed>
          <Text style={s.small}>
            {pkg.company.name} · {pkg.company.email ?? ""} · {footerText}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={{ color: MUTED, fontSize: 8, textTransform: "uppercase", letterSpacing: 1 }}>{label}</Text>
      <Text style={{ fontSize: 10, marginBottom: 6 }}>{value}</Text>
    </View>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={{ color: MUTED }}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}
