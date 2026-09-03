import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { H2, H3 } from "@/components/Heading";
import { Table } from "@/components/Table";
import {
  EXAMPLE_VERIFY_URL,
  FAILURE_EXAMPLES,
  FAILURE_JSON,
  INCOMPLETE_SUCCESS_NOTE,
  SUCCESS_FIELDS,
  SUCCESS_JSON,
  TENURE_NOTE,
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

      <H2>Request</H2>
      <CodeBlock code={VERIFY_REQUEST_CURL} label="curl (HTTPS)" language="bash" />
      <p className="text-[15px] leading-7 text-muted">Same call, raw:</p>
      <CodeBlock code={VERIFY_REQUEST_HTTP} label="raw HTTPS request" language="http" />
      <Table
        columns={["Field", "Type", "Notes"]}
        rows={[["phone", "string", "Phone with country code, like +2519XXXXXXXX"]]}
      />

      <H2>Success response</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">{INCOMPLETE_SUCCESS_NOTE}</p>
      <CodeBlock code={SUCCESS_JSON} label="json" language="json" />
      <Table
        columns={["Field", "Type", "Notes"]}
        rows={SUCCESS_FIELDS.map((f) => [f.name, f.type, f.notes])}
      />
      <p className="mt-3 text-[15px] leading-7 text-muted">{TENURE_NOTE}</p>

      <H2>Failure response</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Always return HTTP <strong>200</strong> — the request succeeded, the answer is &quot;not
        eligible.&quot; Use <strong>401</strong> only if the key or signature is wrong. The{" "}
        <code className="font-mono text-accent">code</code> tells Allo which outcome it is.
      </p>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Every failure uses the same shape — only{" "}
        <code className="font-mono text-accent">code</code> and{" "}
        <code className="font-mono text-accent">reason</code> change:
      </p>
      <CodeBlock code={FAILURE_JSON} label="the shape" language="json" />
      <p className="text-[15px] leading-7 text-muted">
        <code className="font-mono text-accent">message</code> is optional everywhere. If you skip
        it, Allo shows its own sentence for that reason — already written and translated. Send one
        only if you need different wording.
      </p>

      <H3>All six failure responses</H3>
      <div className="mt-4 space-y-6">
        {FAILURE_EXAMPLES.map((f) => (
          <div key={f.code}>
            <p className="text-[15px] leading-7 text-muted">
              <code className="font-mono text-accent">{f.code}</code> · {f.when}
            </p>
            <CodeBlock code={f.json} label={f.reason} language="json" />
          </div>
        ))}
      </div>
    </article>
  );
}
