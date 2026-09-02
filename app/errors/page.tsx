import type { Metadata } from "next";
import { Table } from "@/components/Table";
import { REASONS, STATUS_BEHAVIOUR } from "@/content/spec";

export const metadata: Metadata = {
  title: "Error codes",
  description:
    "Return 200 with a reason when the driver is not eligible. Use 401 only for a bad key or signature.",
};

export default function ErrorsPage() {
  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-tight">Error codes</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        If the driver is unknown, still return <strong>200</strong> with{" "}
        <code className="font-mono text-accent">verified: false</code> and a reason. Use{" "}
        <strong>401</strong> only if the key or signature is wrong.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Response codes</h2>
      <Table
        columns={["code", "reason", "When to use"]}
        rows={REASONS.map((r) => [String(r.code), r.reason, r.when])}
      />

      <h2 className="mt-10 text-lg font-semibold">What Allo does with your response</h2>
      <Table
        columns={["Your response", "What Allo does"]}
        rows={STATUS_BEHAVIOUR.map((s) => [s.status, s.behaviour])}
      />
    </article>
  );
}
