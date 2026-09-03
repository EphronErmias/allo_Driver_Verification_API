import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { H2, H3 } from "@/components/Heading";
import { Table } from "@/components/Table";
import { FrameworkTabs } from "@/components/FrameworkTabs";
import {
  API_KEY_EXAMPLE,
  CREDENTIALS,
  HEADERS,
  SECRETS,
  SIGNING_SECRET_EXAMPLE,
} from "@/content/spec";

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

      <H2>The two secrets</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        There are two, and they travel in opposite directions. You create the{" "}
        <strong>API key</strong> and give it to Allo. Allo creates the{" "}
        <strong>signing secret</strong> and gives it to you. They are different values — do not
        use one where the other is expected.
      </p>
      <Table
        columns={["Secret", "Created by", "Handed over", "Your env var"]}
        rows={CREDENTIALS.map((c) => [
          c.label,
          c.createdBy,
          c.direction,
          c.partnerEnv,
        ])}
      />

      <H3>API key (you → Allo)</H3>
      <p className="mt-2 text-[15px] leading-7 text-muted">
        Sent on every request. This is the one Allo puts in a header.
      </p>
      <CodeBlock code={API_KEY_EXAMPLE} label="api key" language="bash" />
      <p className="text-[15px] leading-7 text-muted">
        Reject a missing or wrong key with <strong>401</strong>.
      </p>

      <H3>Signing secret (Allo → you)</H3>
      <p className="mt-2 text-[15px] leading-7 text-muted">
        Never sent. Both sides hold a copy and use it to compute the same hash independently —
        that is what makes the signature proof of origin.
      </p>
      <CodeBlock code={SIGNING_SECRET_EXAMPLE} label="signing secret" language="bash" />

      <H2>Request signing (HMAC-SHA256)</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        If Allo gave you a signing secret, every driver-check request includes{" "}
        <code className="font-mono text-accent">X-Allo-Signature</code>. This is an HMAC-SHA256
        hash that proves the request came from Allo and has not been tampered with.
      </p>

      <H3>Signature format</H3>
      <CodeBlock code="t={unixSeconds},v1={hexHmacSha256}" label="header" />
      <p className="text-[15px] leading-7 text-muted">
        To verify: sign the string{" "}
        <code className="font-mono text-accent">{"{timestamp}.{rawBody}"}</code> with the shared
        secret. <strong>rawBody</strong> must be the exact JSON Allo posted — read it as raw text
        before parsing, do not rebuild it. Reject signatures older than 300 seconds. Use a
        timing-safe comparison function.
      </p>

      <H2>All headers</H2>
      <Table
        columns={["Header", "Required", "Meaning"]}
        rows={HEADERS.map((h) => [h.name, h.required, h.meaning])}
      />

      <H2>Copy into your backend</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Starting point only. Each snippet checks the API key, verifies the signature when a secret
        is set, looks up the driver with example failure paths, and includes a health endpoint.
      </p>
      <FrameworkTabs />
    </article>
  );
}
