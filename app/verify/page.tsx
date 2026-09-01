import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { Table } from "@/components/Table";
import {
  EXAMPLE_VERIFY_URL,
  FAILURE_JSON,
  SUCCESS_FIELDS,
  SUCCESS_JSON,
  TOO_NEW_JSON,
  VERIFY_REQUEST_CURL,
  VERIFY_REQUEST_HTTP,
} from "@/content/spec";

export const metadata: Metadata = {
  title: "Verify endpoint",
  description: "Allo POSTs a phone to your HTTPS URL. Return JSON for yes or no.",
};

export default function VerifyPage() {
  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-tight">Verify endpoint</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        Allo POSTs JSON to your HTTPS URL. Example:{" "}
        <code className="font-mono text-accent">{EXAMPLE_VERIFY_URL}</code>
      </p>

      <h2 className="mt-10 text-lg font-semibold">Request</h2>
      <CodeBlock code={VERIFY_REQUEST_CURL} label="curl (HTTPS)" language="bash" />
      <p className="text-[15px] leading-7 text-muted">Same call, raw:</p>
      <CodeBlock code={VERIFY_REQUEST_HTTP} label="raw HTTPS request" language="http" />
      <Table
        columns={["Field", "Type", "Notes"]}
        rows={[["phone", "string", "Phone with country code, like +2519XXXXXXXX"]]}
      />

      <h2 className="mt-10 text-lg font-semibold">Success response — driver is eligible</h2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Respond 200. If any of these four fields is missing, Allo treats the driver as not eligible.
      </p>
      <CodeBlock code={SUCCESS_JSON} label="json" language="json" />
      <Table
        columns={["Field", "Type", "Notes"]}
        rows={SUCCESS_FIELDS.map((f) => [f.name, f.type, f.notes])}
      />
      <p className="text-[15px] leading-7 text-muted">
        The account must be at least 6 months old. If it is newer, return{" "}
        <code className="font-mono text-accent">ACCOUNT_TOO_NEW</code>.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Failure response — driver is not eligible</h2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        If the driver is unknown, still return <strong>200</strong> with{" "}
        <code className="font-mono text-accent">NOT_FOUND</code>. Use <strong>401</strong> only if
        the key or signature is wrong.
      </p>
      <CodeBlock code={FAILURE_JSON} label="json" language="json" />
      <p className="mt-6 text-[15px] leading-7 text-muted">
        Optional on <code className="font-mono text-accent">ACCOUNT_TOO_NEW</code>:
      </p>
      <CodeBlock code={TOO_NEW_JSON} label="json" language="json" />
      <p className="text-[15px] leading-7 text-muted">
        <code className="font-mono text-accent">message</code> is optional. If you skip it, Allo
        uses its own sentence for that reason.
      </p>
    </article>
  );
}
