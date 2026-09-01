import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { Table } from "@/components/Table";
import { FrameworkTabs } from "@/components/FrameworkTabs";
import { HEADERS, SECRETS } from "@/content/spec";

export const metadata: Metadata = {
  title: "Authentication",
  description:
    "API key and optional HMAC-SHA256 request signing for the Allo Partner API.",
};

export default function AuthPage() {
  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-tight">Authentication</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        Two headers authenticate every call Allo makes to you. The API key is required. The
        signature is optional but recommended.
      </p>
      <Table
        columns={["Header", "Who owns it"]}
        rows={SECRETS.map((s) => [s.name, s.who])}
      />

      {/* --- Section 1: API key --- */}
      <h2 className="mt-10 text-lg font-semibold">API key</h2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        You create the API key and give it to Allo during onboarding. Allo sends it on every
        request as <code className="font-mono text-accent">X-Allo-Key</code>. Reject a missing or
        wrong key with <strong>401</strong>.
      </p>

      {/* --- Section 2: HMAC signing --- */}
      <h2 className="mt-10 text-lg font-semibold">Request signing (HMAC-SHA256)</h2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        If Allo gave you a signing secret, every driver-check request includes{" "}
        <code className="font-mono text-accent">X-Allo-Signature</code>. This is an HMAC-SHA256
        hash that proves the request came from Allo and has not been tampered with.
      </p>

      <h3 className="mt-6 text-[15px] font-semibold">Signature format</h3>
      <CodeBlock code="t={unixSeconds},v1={hexHmacSha256}" label="header" />
      <p className="text-[15px] leading-7 text-muted">
        To verify: sign the string{" "}
        <code className="font-mono text-accent">{"{timestamp}.{rawBody}"}</code> with the shared
        secret. <strong>rawBody</strong> must be the exact JSON Allo posted — read it as raw text
        before parsing, do not rebuild it. Reject signatures older than 300 seconds. Use a
        timing-safe comparison function.
      </p>

      {/* --- Section 3: All headers --- */}
      <h2 className="mt-10 text-lg font-semibold">All headers</h2>
      <Table
        columns={["Header", "Required", "Meaning"]}
        rows={HEADERS.map((h) => [h.name, h.required, h.meaning])}
      />

      {/* --- Section 4: Code examples --- */}
      <h2 className="mt-10 text-lg font-semibold">Copy into your backend</h2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Starting point only. Each snippet checks the API key, verifies the signature when a secret
        is set, looks up the driver with example failure paths, and includes a health endpoint.
      </p>
      <FrameworkTabs />
    </article>
  );
}
