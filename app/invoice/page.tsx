import Link from "next/link";
import InvoiceForm from "../components/InvoiceForm";

export default function InvoicePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-accent"
      >
        ← All automations
      </Link>
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          Sampeer Automations
        </p>
        <h1 className="mt-1 text-3xl font-bold text-brand">Invoice Generator</h1>
        <p className="mt-2 text-slate-500">
          Fill in the project details. We validate, price, design, and email a
          premium invoice automatically.
        </p>
      </header>
      <InvoiceForm />
    </main>
  );
}
