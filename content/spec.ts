export const API_VERSION = "2026-08-01";

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/verify", label: "Verify endpoint" },
  { href: "/auth", label: "Authentication" },
  { href: "/health", label: "Health check" },
  { href: "/errors", label: "Error codes" },
] as const;

export const EXAMPLE_VERIFY_URL = "https://api.partner.example/allo/verify";
export const EXAMPLE_HEALTH_URL = "https://api.partner.example/allo/verify/health";

export const HEADERS = [
  {
    name: "Content-Type",
    required: "POST only",
    meaning: "application/json",
  },
  {
    name: "X-Allo-Key",
    required: "Yes",
    meaning: "API key you create and give to Allo",
  },
  {
    name: "X-Allo-API-Version",
    required: "Yes",
    meaning: API_VERSION,
  },
  {
    name: "X-Request-ID",
    required: "POST only",
    meaning: "Unique id for this call; Allo reuses it on retry",
  },
  {
    name: "X-Allo-Signature",
    required: "If signing secret is set",
    meaning: "HMAC-SHA256 proof the request came from Allo",
  },
] as const;

export const SUCCESS_FIELDS = [
  { name: "verified", type: "boolean", notes: "Must be exactly true" },
  { name: "code", type: "number", notes: "1000 for success" },
  { name: "fullName", type: "string", notes: "Driver display name" },
  { name: "driverId", type: "string", notes: "Stable id in your system" },
  {
    name: "registeredSince",
    type: "string",
    notes:
      "Account open date. Must be YYYY-MM-DD (ISO-8601 timestamps also parse). An unparseable value is treated as too new and the driver is rejected.",
  },
] as const;

/** Success body missing required fields is PARTNER_ERROR, not a permanent no. */
export const INCOMPLETE_SUCCESS_NOTE =
  "Respond 200. On verified: true, Allo requires non-empty fullName, driverId, and registeredSince. If any of those three is missing, Allo treats the response as PARTNER_ERROR (code 2006) — the customer is asked to try again shortly. That is deliberately distinct from a genuine “not eligible” answer.";

/** Tenure re-check and date parsing, combined into one note. */
export const TENURE_NOTE =
  "Allo independently re-checks tenure using the registeredSince you send. The minimum is configured per partner (default 6 months) — confirm the agreed value, do not assume 6. A verified: true response for an account under that minimum is converted to ACCOUNT_TOO_NEW regardless. The date must be YYYY-MM-DD (ISO-8601 timestamps also parse). An unparseable value — for example 15/01/2023 — is treated as too new.";

export const REASONS = [
  {
    code: 1000,
    reason: "—",
    when: "Driver is eligible (verified: true)",
  },
  {
    code: 2001,
    reason: "NOT_FOUND",
    when: "No driver for this phone (Allo uses this if reason is missing or unknown)",
  },
  { code: 2002, reason: "INACTIVE", when: "Account exists but is not active" },
  {
    code: 2003,
    reason: "ACCOUNT_TOO_NEW",
    when:
      "Account is younger than Allo’s minimum tenure (configured per partner, default 6 months). Allo re-checks registeredSince even if you sent verified: true. An unparseable date is also treated as too new.",
  },
  { code: 2004, reason: "SUSPENDED", when: "Temporarily suspended" },
  { code: 2005, reason: "BLOCKED", when: "Permanently not eligible for Allo financing" },
  {
    code: 2006,
    reason: "PARTNER_ERROR",
    when:
      "Partner-side failure, or a verified: true body missing fullName, driverId, or registeredSince. Allo tells the customer to try again later. Distinct from a genuine not-eligible answer.",
  },
] as const;

export const STATUS_BEHAVIOUR = [
  {
    status: "200 + verify JSON",
    behaviour: "Allo reads code / verified / reason. This is the path to aim for.",
  },
  {
    status: "401 or 403",
    behaviour:
      "Allo treats its own key or signature as rejected — never as an answer about the driver. Not retried, and raised to the Allo team.",
  },
  {
    status: "Any body without a boolean verified",
    behaviour:
      "Treated as PARTNER_ERROR. An error envelope is never read as a driver result.",
  },
  {
    status: "Other non-2xx carrying a valid verify JSON",
    behaviour:
      "Still read, so a stray status code does not break a real answer. Send 200 anyway.",
  },
  {
    status: "500+ with empty or non-JSON body",
    behaviour: "Allo retries once, then treats you as unreachable",
  },
  {
    status: "Timeout / connection error",
    behaviour: "Allo retries once, then treats you as unreachable",
  },
] as const;

export const CHECKLIST = [
  "Your URL starts with https:// (not http://)",
  "You created an API key and gave it to Allo",
  "Your endpoint returns verified, fullName, driverId, and registeredSince when the driver is eligible",
  "registeredSince is YYYY-MM-DD (or ISO-8601); any other format is treated as too new",
  "You confirmed the agreed minimum tenure with Allo (do not assume 6 months)",
  "Your endpoint returns verified: false with a reason code for ineligible drivers",
  "GET {yourUrl}/health responds 200 within 5 seconds",
  "Your endpoint responds within 8 seconds under load",
  "You handle all 6 reason codes (NOT_FOUND, INACTIVE, ACCOUNT_TOO_NEW, SUSPENDED, BLOCKED, PARTNER_ERROR)",
  "Optional: you verify X-Allo-Signature using the signing secret from Allo",
] as const;

export const SECRETS = [
  {
    name: "X-Allo-Key",
    who: "You create it. Allo sends it on every call.",
  },
  {
    name: "X-Allo-Signature",
    who: "Allo creates the secret. You verify the signature. (HMAC-SHA256)",
  },
] as const;

/** Everything that changes hands at setup — two from you, one from Allo. */
export const HANDOVER = [
  {
    item: "Verify URL",
    from: "You → Allo",
    what: "The HTTPS address Allo should call. Allo adds /health to it for the health check.",
  },
  {
    item: "API key",
    from: "You → Allo",
    what: "A long random string you invent. Allo sends it back on every request so you know it is Allo.",
  },
  {
    item: "Signing secret",
    from: "Allo → You",
    what: "Optional but recommended. Lets you prove a request really came from Allo and was not changed on the way.",
  },
  {
    item: "Minimum tenure",
    from: "Allo (agreed at onboarding)",
    what: "Allo re-checks registeredSince against a per-partner minimum (default 6 months). Confirm the agreed value; do not assume 6.",
  },
] as const;

/**
 * The two shared secrets, and what each side calls them. They travel in
 * opposite directions and are handed over once, out of band, at onboarding.
 */
export const CREDENTIALS = [
  {
    label: "API key",
    createdBy: "You",
    direction: "You → Allo",
    partnerEnv: "ALLO_API_KEY",
    sent: "Yes — on every request, as X-Allo-Key",
  },
  {
    label: "Signing secret",
    createdBy: "Allo",
    direction: "Allo → You",
    partnerEnv: "ALLO_SIGNING_SECRET",
    sent: "No — never transmitted; it computes X-Allo-Signature",
  },
] as const;

export const API_KEY_EXAMPLE = `# 1. You invent a long random string. This is your API key.
#    You send it to Allo once, when you first set up.

# On your server:
ALLO_API_KEY=pk_live_7f3a9c2e8b1d4f60a5e7c9b2d8f1a3e6

# Allo saves the same value as {PARTNER}_API_KEY.

# 2. From then on, Allo puts it on every request it makes:
#    X-Allo-Key: pk_live_7f3a9c2e8b1d4f60a5e7c9b2d8f1a3e6

# 3. You check it matches. If it does not, answer 401.`;

export const SIGNING_SECRET_EXAMPLE = `# 1. Allo creates this one and sends it to you once.
#    It is a different value from the API key.

# On your server:
ALLO_SIGNING_SECRET=whsec_4b8e1f6a9d3c7250e8a1b4f7c2d9e603

# Allo saves the same value as {PARTNER}_SIGNING_SECRET.

# 2. Allo never sends this value anywhere. It uses it to make
#    a fingerprint of each request, and sends the fingerprint:
#    X-Allo-Signature: t=1735680000,v1=9c1f...e4a2

# 3. You make the same fingerprint with your copy of the
#    secret and check the two match.`;

export const VERIFY_REQUEST_CURL = `curl -X POST "https://api.partner.example/allo/verify" \\
  -H "Content-Type: application/json" \\
  -H "X-Allo-Key: <api-key-you-gave-allo>" \\
  -H "X-Allo-API-Version: ${API_VERSION}" \\
  -H "X-Request-ID: 3b8f0c2e-6a1d-4c9e-9f21-0a7b4d5e6f70" \\
  -H "X-Allo-Signature: t=1735680000,v1=<hex>" \\
  -d '{"phone":"+251911000001"}'`;

export const VERIFY_REQUEST_HTTP = `POST /allo/verify HTTP/1.1
Host: api.partner.example
Content-Type: application/json
X-Allo-Key: <api-key-you-gave-allo>
X-Allo-API-Version: ${API_VERSION}
X-Request-ID: 3b8f0c2e-6a1d-4c9e-9f21-0a7b4d5e6f70
X-Allo-Signature: t=1735680000,v1=<hex>

{"phone":"+251911000001"}`;

export const SUCCESS_JSON = `{
  "verified": true,
  "code": 1000,
  "fullName": "Dawit Haile",
  "driverId": "DRV-00012",
  "registeredSince": "2023-01-15"
}`;

export const FAILURE_JSON = `{
  "verified": false,
  "code": 2001,
  "reason": "NOT_FOUND",
  "message": "No driver account for this phone."
}`;

export const TOO_NEW_JSON = `{
  "verified": false,
  "code": 2003,
  "reason": "ACCOUNT_TOO_NEW",
  "registeredSince": "2026-06-01",
  "message": "Account must be at least 6 months old."
}`;

/** Every failure body, in the order a lookup would hit them. */
export const FAILURE_EXAMPLES = [
  {
    code: 2001,
    reason: "NOT_FOUND",
    when: "No driver account matches this phone number.",
    json: `{
  "verified": false,
  "code": 2001,
  "reason": "NOT_FOUND"
}`,
  },
  {
    code: 2002,
    reason: "INACTIVE",
    when: "The account exists but is switched off — not currently driving.",
    json: `{
  "verified": false,
  "code": 2002,
  "reason": "INACTIVE"
}`,
  },
  {
    code: 2003,
    reason: "ACCOUNT_TOO_NEW",
    when:
      "Account is younger than Allo’s minimum tenure (configured per partner, default 6 months). Send registeredSince as YYYY-MM-DD — Allo computes the date the driver becomes eligible. Allo also applies this check itself: verified: true for an under-age or unparseable date becomes ACCOUNT_TOO_NEW.",
    json: `{
  "verified": false,
  "code": 2003,
  "reason": "ACCOUNT_TOO_NEW",
  "registeredSince": "2026-06-01"
}`,
  },
  {
    code: 2004,
    reason: "SUSPENDED",
    when: "Temporarily suspended. The driver may become eligible again later.",
    json: `{
  "verified": false,
  "code": 2004,
  "reason": "SUSPENDED"
}`,
  },
  {
    code: 2005,
    reason: "BLOCKED",
    when: "Permanently not eligible for Allo financing.",
    json: `{
  "verified": false,
  "code": 2005,
  "reason": "BLOCKED"
}`,
  },
  {
    code: 2006,
    reason: "PARTNER_ERROR",
    when:
      "Your own lookup failed — database down, upstream timeout — or a verified: true body is missing fullName, driverId, or registeredSince. Allo tells the driver to try again shortly. Distinct from a genuine not-eligible answer.",
    json: `{
  "verified": false,
  "code": 2006,
  "reason": "PARTNER_ERROR"
}`,
  },
] as const;

export const RATE_LIMIT_TEXT =
  "Allo sends at most 100 requests per 60 seconds to each partner. If your endpoint is hit more often than that, something is misconfigured on our side — contact your Allo integration manager. You do not need to implement rate limiting yourself.";

export type FrameworkId = "node" | "python" | "php" | "go" | "java";

export const FRAMEWORKS: Array<{
  id: FrameworkId;
  label: string;
  language: string;
  code: string;
}> = [
  {
    id: "node",
    label: "Node (Express)",
    language: "javascript",
    code: `const express = require("express");
const crypto = require("crypto");

const app = express();
const API_KEY = process.env.ALLO_API_KEY;
const SIGNING_SECRET = process.env.ALLO_SIGNING_SECRET || "";

function verifySignature(rawBody, sigHeader, secret, tolerance = 300) {
  const parts = Object.fromEntries(
    String(sigHeader || "").split(",").map((s) => {
      const i = s.indexOf("=");
      return i > 0 ? [s.slice(0, i).trim(), s.slice(i + 1).trim()] : [];
    }).filter((p) => p.length === 2)
  );
  if (!parts.t || !parts.v1) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(parts.t + "." + rawBody)
    .digest("hex");
  const a = Buffer.from(parts.v1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const age = Math.floor(Date.now() / 1000) - Number(parts.t);
  return age >= 0 && age < tolerance;
}

app.post(
  "/allo/verify",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (req.get("X-Allo-Key") !== API_KEY) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body);
    if (SIGNING_SECRET) {
      if (!verifySignature(rawBody, req.get("X-Allo-Signature"), SIGNING_SECRET)) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    }
    const { phone } = JSON.parse(rawBody);

    let driver;
    try {
      // --- Replace with your database lookup ---
      driver = await db.drivers.findByPhone(phone);
    } catch (err) {
      return res.json({ verified: false, code: 2006, reason: "PARTNER_ERROR" });
    }

    if (!driver) {
      return res.json({ verified: false, code: 2001, reason: "NOT_FOUND" });
    }
    if (!driver.isActive) {
      return res.json({ verified: false, code: 2002, reason: "INACTIVE" });
    }
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() - 6);
    if (new Date(driver.createdAt) > sixMonths) {
      return res.json({
        verified: false,
        code: 2003,
        reason: "ACCOUNT_TOO_NEW",
        registeredSince: driver.createdAt,
      });
    }
    if (driver.isSuspended) {
      return res.json({ verified: false, code: 2004, reason: "SUSPENDED" });
    }
    if (driver.isBlocked) {
      return res.json({ verified: false, code: 2005, reason: "BLOCKED" });
    }

    res.json({
      verified: true,
      code: 1000,
      fullName: driver.fullName,
      driverId: driver.id,
      registeredSince: driver.createdAt,
    });
  }
);

app.get("/allo/verify/health", (req, res) => {
  if (req.get("X-Allo-Key") !== API_KEY) return res.status(401).end();
  res.send("ok");
});

app.listen(process.env.PORT || 8080);`,
  },
  {
    id: "python",
    label: "Python (FastAPI)",
    language: "python",
    code: `import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timedelta

from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse, PlainTextResponse

app = FastAPI()
API_KEY = os.environ["ALLO_API_KEY"]
SIGNING_SECRET = os.environ.get("ALLO_SIGNING_SECRET", "")


def verify_signature(raw_body: str, sig_header: str, secret: str, tolerance: int = 300) -> bool:
    parts = dict(p.split("=", 1) for p in (sig_header or "").split(",") if "=" in p)
    ts, v1 = parts.get("t"), parts.get("v1")
    if not ts or not v1 or not secret:
        return False
    expected = hmac.new(
        secret.encode(), f"{ts}.{raw_body}".encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(v1, expected):
        return False
    return 0 <= (int(time.time()) - int(ts)) < tolerance


@app.post("/allo/verify")
async def verify(request: Request, x_allo_key: str | None = Header(default=None)):
    if x_allo_key != API_KEY:
        return JSONResponse({"error": "Invalid API key"}, status_code=401)
    raw_body = (await request.body()).decode("utf-8")
    if SIGNING_SECRET:
        sig = request.headers.get("X-Allo-Signature", "")
        if not verify_signature(raw_body, sig, SIGNING_SECRET):
            return JSONResponse({"error": "Invalid signature"}, status_code=401)
    data = json.loads(raw_body)
    phone = data.get("phone")

    try:
        # --- Replace with your database lookup ---
        driver = await db.find_driver_by_phone(phone)
    except Exception:
        return {"verified": False, "code": 2006, "reason": "PARTNER_ERROR"}

    if not driver:
        return {"verified": False, "code": 2001, "reason": "NOT_FOUND"}
    if not driver.is_active:
        return {"verified": False, "code": 2002, "reason": "INACTIVE"}
    if driver.created_at > datetime.now() - timedelta(days=180):
        return {
            "verified": False,
            "code": 2003,
            "reason": "ACCOUNT_TOO_NEW",
            "registeredSince": str(driver.created_at.date()),
        }
    if driver.is_suspended:
        return {"verified": False, "code": 2004, "reason": "SUSPENDED"}
    if driver.is_blocked:
        return {"verified": False, "code": 2005, "reason": "BLOCKED"}

    return {
        "verified": True,
        "code": 1000,
        "fullName": driver.full_name,
        "driverId": driver.id,
        "registeredSince": str(driver.created_at.date()),
    }


@app.get("/allo/verify/health")
async def health(x_allo_key: str | None = Header(default=None)):
    if x_allo_key != API_KEY:
        return JSONResponse({"error": "Invalid API key"}, status_code=401)
    return PlainTextResponse("ok")`,
  },
  {
    id: "php",
    label: "PHP",
    language: "php",
    code: `<?php
$apiKey = getenv('ALLO_API_KEY');
$signingSecret = getenv('ALLO_SIGNING_SECRET') ?: '';

function verify_signature(string $rawBody, string $sigHeader, string $secret, int $tolerance = 300): bool {
    $parts = [];
    foreach (explode(',', $sigHeader) as $segment) {
        $eq = strpos($segment, '=');
        if ($eq === false) continue;
        $parts[trim(substr($segment, 0, $eq))] = trim(substr($segment, $eq + 1));
    }
    $ts = $parts['t'] ?? '';
    $v1 = $parts['v1'] ?? '';
    if ($ts === '' || $v1 === '' || $secret === '') return false;
    $expected = hash_hmac('sha256', $ts . '.' . $rawBody, $secret);
    if (!hash_equals($expected, $v1)) return false;
    $age = time() - intval($ts);
    return $age >= 0 && $age < $tolerance;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$key = $_SERVER['HTTP_X_ALLO_KEY'] ?? '';

if ($key !== $apiKey) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid API key']);
    exit;
}

if ($method === 'GET' && str_ends_with($path, '/health')) {
    echo 'ok';
    exit;
}

$rawBody = file_get_contents('php://input');
if ($signingSecret !== '') {
    $sig = $_SERVER['HTTP_X_ALLO_SIGNATURE'] ?? '';
    if (!verify_signature($rawBody, $sig, $signingSecret)) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
}

$data = json_decode($rawBody, true);
$phone = $data['phone'] ?? '';

header('Content-Type: application/json');

try {
    // --- Replace with your database lookup ---
    $driver = findDriverByPhone($phone);
} catch (Exception $e) {
    echo json_encode(['verified' => false, 'code' => 2006, 'reason' => 'PARTNER_ERROR']);
    exit;
}

if (!$driver) {
    echo json_encode(['verified' => false, 'code' => 2001, 'reason' => 'NOT_FOUND']);
    exit;
}
if (!$driver['is_active']) {
    echo json_encode(['verified' => false, 'code' => 2002, 'reason' => 'INACTIVE']);
    exit;
}
$sixMonthsAgo = strtotime('-6 months');
if (strtotime($driver['created_at']) > $sixMonthsAgo) {
    echo json_encode([
        'verified' => false,
        'code' => 2003,
        'reason' => 'ACCOUNT_TOO_NEW',
        'registeredSince' => $driver['created_at'],
    ]);
    exit;
}
if ($driver['is_suspended'] ?? false) {
    echo json_encode(['verified' => false, 'code' => 2004, 'reason' => 'SUSPENDED']);
    exit;
}
if ($driver['is_blocked'] ?? false) {
    echo json_encode(['verified' => false, 'code' => 2005, 'reason' => 'BLOCKED']);
    exit;
}

echo json_encode([
    'verified' => true,
    'code' => 1000,
    'fullName' => $driver['full_name'],
    'driverId' => $driver['id'],
    'registeredSince' => $driver['created_at'],
]);`,
  },
  {
    id: "go",
    label: "Go",
    language: "go",
    code: `package main

import (
\t"crypto/hmac"
\t"crypto/sha256"
\t"encoding/hex"
\t"encoding/json"
\t"io"
\t"net/http"
\t"os"
\t"strconv"
\t"strings"
\t"time"
)

func verifySignature(rawBody, sigHeader, secret string, tolerance int64) bool {
\tparts := map[string]string{}
\tfor _, seg := range strings.Split(sigHeader, ",") {
\t\tk, v, ok := strings.Cut(seg, "=")
\t\tif !ok {
\t\t\tcontinue
\t\t}
\t\tparts[strings.TrimSpace(k)] = strings.TrimSpace(v)
\t}
\tts, v1 := parts["t"], parts["v1"]
\tif ts == "" || v1 == "" || secret == "" {
\t\treturn false
\t}
\tmac := hmac.New(sha256.New, []byte(secret))
\tmac.Write([]byte(ts + "." + rawBody))
\tgot, err := hex.DecodeString(v1)
\tif err != nil {
\t\treturn false
\t}
\tif !hmac.Equal(got, mac.Sum(nil)) {
\t\treturn false
\t}
\tepoch, err := strconv.ParseInt(ts, 10, 64)
\tif err != nil {
\t\treturn false
\t}
\tage := time.Now().Unix() - epoch
\treturn age >= 0 && age < tolerance
}

func main() {
\tapiKey := os.Getenv("ALLO_API_KEY")
\tsigSecret := os.Getenv("ALLO_SIGNING_SECRET")

\thttp.HandleFunc("/allo/verify/health", func(w http.ResponseWriter, r *http.Request) {
\t\tif r.Header.Get("X-Allo-Key") != apiKey {
\t\t\thttp.Error(w, \`{"error":"Invalid API key"}\`, 401)
\t\t\treturn
\t\t}
\t\tw.Write([]byte("ok"))
\t})

\thttp.HandleFunc("/allo/verify", func(w http.ResponseWriter, r *http.Request) {
\t\tif r.Header.Get("X-Allo-Key") != apiKey {
\t\t\thttp.Error(w, \`{"error":"Invalid API key"}\`, 401)
\t\t\treturn
\t\t}
\t\traw, _ := io.ReadAll(r.Body)
\t\trawBody := string(raw)
\t\tif sigSecret != "" {
\t\t\tif !verifySignature(rawBody, r.Header.Get("X-Allo-Signature"), sigSecret, 300) {
\t\t\t\thttp.Error(w, \`{"error":"Invalid signature"}\`, 401)
\t\t\t\treturn
\t\t\t}
\t\t}
\t\tvar req struct{ Phone string \`json:"phone"\` }
\t\tjson.Unmarshal(raw, &req)

\t\t// --- Replace with your database lookup ---
\t\tdriver, err := db.FindByPhone(req.Phone)

\t\tw.Header().Set("Content-Type", "application/json")
\t\tif err != nil {
\t\t\tjson.NewEncoder(w).Encode(map[string]any{
\t\t\t\t"verified": false, "code": 2006, "reason": "PARTNER_ERROR",
\t\t\t})
\t\t\treturn
\t\t}
\t\tif driver == nil {
\t\t\tjson.NewEncoder(w).Encode(map[string]any{
\t\t\t\t"verified": false, "code": 2001, "reason": "NOT_FOUND",
\t\t\t})
\t\t\treturn
\t\t}
\t\tif !driver.IsActive {
\t\t\tjson.NewEncoder(w).Encode(map[string]any{
\t\t\t\t"verified": false, "code": 2002, "reason": "INACTIVE",
\t\t\t})
\t\t\treturn
\t\t}
\t\tif time.Since(driver.CreatedAt) < 180*24*time.Hour {
\t\t\tjson.NewEncoder(w).Encode(map[string]any{
\t\t\t\t"verified": false, "code": 2003, "reason": "ACCOUNT_TOO_NEW",
\t\t\t\t"registeredSince": driver.CreatedAt.Format("2006-01-02"),
\t\t\t})
\t\t\treturn
\t\t}
\t\tif driver.IsSuspended {
\t\t\tjson.NewEncoder(w).Encode(map[string]any{
\t\t\t\t"verified": false, "code": 2004, "reason": "SUSPENDED",
\t\t\t})
\t\t\treturn
\t\t}
\t\tif driver.IsBlocked {
\t\t\tjson.NewEncoder(w).Encode(map[string]any{
\t\t\t\t"verified": false, "code": 2005, "reason": "BLOCKED",
\t\t\t})
\t\t\treturn
\t\t}

\t\tjson.NewEncoder(w).Encode(map[string]any{
\t\t\t"verified":        true,
\t\t\t"code":            1000,
\t\t\t"fullName":        driver.FullName,
\t\t\t"driverId":        driver.ID,
\t\t\t"registeredSince": driver.CreatedAt.Format("2006-01-02"),
\t\t})
\t})

\thttp.ListenAndServe(":"+os.Getenv("PORT"), nil)
}`,
  },
  {
    id: "java",
    label: "Java",
    language: "java",
    code: `import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

public class AlloVerify {
  static String apiKey = System.getenv("ALLO_API_KEY");
  static String sigSecret = System.getenv().getOrDefault("ALLO_SIGNING_SECRET", "");

  static boolean verifySignature(String rawBody, String sigHeader, String secret, long tolerance) {
    Map<String, String> parts = new HashMap<>();
    if (sigHeader != null) {
      for (String seg : sigHeader.split(",")) {
        int eq = seg.indexOf('=');
        if (eq > 0) parts.put(seg.substring(0, eq).trim(), seg.substring(eq + 1).trim());
      }
    }
    String ts = parts.get("t"), v1 = parts.get("v1");
    if (ts == null || v1 == null || secret.isEmpty()) return false;
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      String expected = HexFormat.of().formatHex(
        mac.doFinal((ts + "." + rawBody).getBytes(StandardCharsets.UTF_8)));
      if (expected.length() != v1.length()) return false;
      int diff = 0;
      for (int i = 0; i < expected.length(); i++) diff |= expected.charAt(i) ^ v1.charAt(i);
      if (diff != 0) return false;
      return (Instant.now().getEpochSecond() - Long.parseLong(ts)) < tolerance;
    } catch (Exception e) { return false; }
  }

  static void respond(HttpExchange ex, String json) throws IOException {
    byte[] b = json.getBytes(StandardCharsets.UTF_8);
    ex.getResponseHeaders().set("Content-Type", "application/json");
    ex.sendResponseHeaders(200, b.length);
    ex.getResponseBody().write(b);
    ex.close();
  }

  public static void main(String[] args) throws Exception {
    HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

    server.createContext("/allo/verify/health", ex -> {
      if (!apiKey.equals(ex.getRequestHeaders().getFirst("X-Allo-Key"))) {
        ex.sendResponseHeaders(401, -1); ex.close(); return;
      }
      byte[] ok = "ok".getBytes(StandardCharsets.UTF_8);
      ex.sendResponseHeaders(200, ok.length);
      ex.getResponseBody().write(ok); ex.close();
    });

    server.createContext("/allo/verify", ex -> {
      if (!apiKey.equals(ex.getRequestHeaders().getFirst("X-Allo-Key"))) {
        ex.sendResponseHeaders(401, -1); ex.close(); return;
      }
      String rawBody = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
      if (!sigSecret.isEmpty()) {
        String sig = ex.getRequestHeaders().getFirst("X-Allo-Signature");
        if (!verifySignature(rawBody, sig == null ? "" : sig, sigSecret, 300)) {
          ex.sendResponseHeaders(401, -1); ex.close(); return;
        }
      }

      // --- Replace with your database lookup ---
      // Driver driver;
      // try { driver = driverRepo.findByPhone(phone); }
      // catch (Exception e) {
      //   respond(ex, "{\\"verified\\":false,\\"code\\":2006,\\"reason\\":\\"PARTNER_ERROR\\"}"); return;
      // }

      // if (driver == null)
      //   respond(ex, "{\\"verified\\":false,\\"code\\":2001,\\"reason\\":\\"NOT_FOUND\\"}");
      // else if (!driver.isActive())
      //   respond(ex, "{\\"verified\\":false,\\"code\\":2002,\\"reason\\":\\"INACTIVE\\"}");
      // else if (driver.createdAt().isAfter(LocalDate.now().minusMonths(6)))
      //   respond(ex, "{\\"verified\\":false,\\"code\\":2003,\\"reason\\":\\"ACCOUNT_TOO_NEW\\",...}");
      // else if (driver.isSuspended())
      //   respond(ex, "{\\"verified\\":false,\\"code\\":2004,\\"reason\\":\\"SUSPENDED\\"}");
      // else if (driver.isBlocked())
      //   respond(ex, "{\\"verified\\":false,\\"code\\":2005,\\"reason\\":\\"BLOCKED\\"}");

      // Success example:
      respond(ex, """
        {"verified":true,"code":1000,"fullName":"Dawit Haile","driverId":"DRV-001","registeredSince":"2023-01-15"}
        """.strip());
    });

    server.start();
  }
}`,
  },
];
