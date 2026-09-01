import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { EXAMPLE_HEALTH_URL } from "@/content/spec";

export const metadata: Metadata = {
  title: "Health check",
  description: "Allo GETs your HTTPS URL plus /health to see if the server is up.",
};

export default function HealthPage() {
  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-tight">Health check</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        Allo GETs <code className="font-mono text-accent">{"{yourUrl}/health"}</code> with{" "}
        <code className="font-mono text-accent">X-Allo-Key</code> and{" "}
        <code className="font-mono text-accent">X-Allo-API-Version</code>. No body. No signature.
      </p>
      <CodeBlock code={EXAMPLE_HEALTH_URL} label="example HTTPS health URL" />
      <p className="text-[15px] leading-7 text-muted">
        Respond <strong>200</strong> when the driver-check service is up. Anything else, or a wait
        longer than 5 seconds, is reported as down in Allo admin.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Example response</h2>
      <CodeBlock code={`"ok"`} label="body" />
      <p className="text-[15px] leading-7 text-muted">
        The body content does not matter — Allo only checks the status code. Returning{" "}
        <code className="font-mono text-accent">&quot;ok&quot;</code> or an empty 200 both work.
      </p>
    </article>
  );
}
