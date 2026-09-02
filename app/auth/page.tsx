import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
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

      {/* --- Section 1: the two secrets --- */}
      <h2 className="mt-10 text-lg font-semibold">The two secrets</h2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        There are two, and they travel in opposite directions. You create the{" "}
        <strong>API key</strong> and give it to Allo. Allo creates the{" "}
        <strong>signing secret</strong> and gives it to you. They are different values — do not
        use one where the other is expected.
      </p>
      <Table
        columns={["Secret", "Created by", "Handed over", "Allo stores it as", "You store it as"]}
        rows={CREDENTIALS.map((c) => [
          c.label,
          c.createdBy,
          c.direction,
          c.alloEnv,
          c.partnerEnv,
        ])}
      />
      <p className="text-[15px] leading-7 text-muted">
        <code className="font-mono text-accent">{"{PARTNER}"}</code> is your platform name. You do
        not need to know Allo&apos;s variable names — they are shown only so both sides can point
        at the same value when something needs checking.
      </p>

      <h3 className="mt-8 text-[15px] font-semibold">The difference, in one line each</h3>
      <p className="mt-2 text-[15px] leading-7 text-muted">
        <strong>The API key is like a keycard.</strong> You issue it, Allo swipes it every time it
        arrives, and you check it at the door. It travels on every request.
      </p>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        <strong>The signing secret is like a wax seal.</strong> It never travels. Both sides keep
        a copy and use it to work out the same fingerprint independently. If your fingerprint
        matches the one Allo sent, the request is genuine and nothing in it was changed on the
        way.
      </p>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Why both? A keycard can be stolen, and whoever holds it can walk in. The seal cannot be
        copied, because there is nothing on the wire to steal. The key gets you working; the seal
        makes it safe.
      </p>

      <h3 className="mt-8 text-[15px] font-semibold">Example 1 — API key (you → Allo)</h3>
      <p className="mt-2 text-[15px] leading-7 text-muted">
        Sent on every request. This is the one Allo puts in a header.
      </p>
      <CodeBlock code={API_KEY_EXAMPLE} label="api key" language="bash" />
      <p className="text-[15px] leading-7 text-muted">
        Reject a missing or wrong key with <strong>401</strong>.
      </p>

      <h3 className="mt-8 text-[15px] font-semibold">
        Example 2 — Signing secret (Allo → you)
      </h3>
      <p className="mt-2 text-[15px] leading-7 text-muted">
        Never sent. Both sides hold a copy and use it to compute the same hash independently —
        that is what makes the signature proof of origin.
      </p>
      <CodeBlock code={SIGNING_SECRET_EXAMPLE} label="signing secret" language="bash" />

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
