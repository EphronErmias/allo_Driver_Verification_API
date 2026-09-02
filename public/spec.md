# Partner driver verification API

You host one **HTTPS** URL. Allo calls it with a driver's phone number. You answer with JSON: is this person an eligible driver on your platform?

Allo finances mobile phones in Ethiopia. When a driver applies for Allo financing, Allo verifies they are an active, tenured driver on your platform.

**Allo calls you. You never call Allo.**

**API version:** `2026-08-01` (`X-Allo-API-Version`)

## What changes hands at setup

Four things, exchanged once. Two from you, two from Allo (the signing secret is optional; the minimum tenure is agreed at onboarding).

| Item | Direction | What it is |
|---|---|---|
| Verify URL | You → Allo | The HTTPS address Allo should call. Allo adds `/health` to it for the health check. |
| API key | You → Allo | A long random string you invent. Allo sends it back on every request so you know it is Allo. |
| Signing secret | Allo → You | Optional but recommended. Lets you prove a request really came from Allo and was not changed on the way. |
| Minimum tenure | Allo (agreed at onboarding) | Allo re-checks `registeredSince` against a per-partner minimum (default 6 months, stored as `{PARTNER}_MIN_MONTHS`). Confirm the agreed value; do not assume 6. |

On Allo's side these are stored as `{PARTNER}_API_URL`, `{PARTNER}_API_KEY`, and `{PARTNER}_SIGNING_SECRET`, where `{PARTNER}` is your platform name.

Allo waits 8 seconds for a driver check and 5 seconds for health. On server error or timeout, Allo retries once after 1 second. A 401 is not retried.

**Note:** Your URL must start with `https://`. When this doc says "return HTTP 200," that is a status code — your server still uses HTTPS.

## URLs

| Method | URL | Purpose |
|---|---|---|
| `POST` | `https://api.partner.example/allo/verify` | Check a driver by phone |
| `GET` | `https://api.partner.example/allo/verify/health` | Liveness check (Allo appends `/health`) |

## Authentication

Two headers authenticate every call. The API key is required. The signature is optional but recommended.

| Header | Who owns it |
|---|---|
| `X-Allo-Key` | You create it. Allo sends it on every call. |
| `X-Allo-Signature` | Allo creates the secret. You verify the signature. (HMAC-SHA256) |

Reject a missing or wrong key with `401`. If Allo gave you a signing secret, also reject a missing or invalid signature with `401`.

| Header | Required | Meaning |
|---|---|---|
| `Content-Type` | POST only | `application/json` |
| `X-Allo-Key` | Yes | API key you create and give to Allo |
| `X-Allo-API-Version` | Yes | `2026-08-01` |
| `X-Request-ID` | POST only | Unique id; Allo reuses it on retry |
| `X-Allo-Signature` | If signing secret is set | HMAC-SHA256 proof the request came from Allo |

## Verify endpoint (POST)

```bash
curl -X POST "https://api.partner.example/allo/verify" \
  -H "Content-Type: application/json" \
  -H "X-Allo-Key: <api-key-you-gave-allo>" \
  -H "X-Allo-API-Version: 2026-08-01" \
  -H "X-Request-ID: 3b8f0c2e-6a1d-4c9e-9f21-0a7b4d5e6f70" \
  -H "X-Allo-Signature: t=1735680000,v1=<hex>" \
  -d '{"phone":"+251911000001"}'
```

`phone` is a string with country code, like `+2519XXXXXXXX`.

### Success response — driver is eligible

Respond **200**. On `verified: true`, Allo requires non-empty `fullName`, `driverId`, and `registeredSince`. If any of those three is missing, Allo treats the response as **PARTNER_ERROR** (code **2006**) — the customer is asked to try again shortly. That is deliberately distinct from a genuine “not eligible” answer.

```json
{
  "verified": true,
  "code": 1000,
  "fullName": "Dawit Haile",
  "driverId": "DRV-00012",
  "registeredSince": "2023-01-15"
}
```

| Field | Type | Notes |
|---|---|---|
| `verified` | boolean | Must be exactly true |
| `code` | number | 1000 for success |
| `fullName` | string | Driver display name |
| `driverId` | string | Stable id in your system |
| `registeredSince` | string | Account open date. Must be YYYY-MM-DD (ISO-8601 timestamps also parse). An unparseable value is treated as too new and the driver is rejected. |

Allo independently re-checks tenure using the `registeredSince` you send. The minimum is configured per partner on Allo’s side (default 6 months, stored as `{PARTNER}_MIN_MONTHS`). Confirm the agreed value; do not assume 6. A `verified: true` response for an account under that minimum is converted to `ACCOUNT_TOO_NEW` regardless.

**Validation footgun:** `registeredSince` must be `YYYY-MM-DD` (ISO-8601 timestamps also parse). A value Allo cannot parse — for example `15/01/2023` — is treated as too new and the driver is rejected as `ACCOUNT_TOO_NEW`. There is no separate error code.

### Failure response — driver is not eligible

Always return HTTP **200** — the request succeeded, the answer is "not eligible." Use **401** only if the key or signature is wrong. The `code` field tells Allo which outcome it is.

```json
{
  "verified": false,
  "code": 2001,
  "reason": "NOT_FOUND",
  "message": "No driver account for this phone."
}
```

| `code` | `reason` | When to use |
|---|---|---|
| `1000` | — | Driver is eligible (`verified: true`) |
| `2001` | `NOT_FOUND` | No driver for this phone |
| `2002` | `INACTIVE` | Account exists but is not active |
| `2003` | `ACCOUNT_TOO_NEW` | Account is younger than Allo’s minimum tenure (configured per partner, default 6 months). Allo re-checks `registeredSince` even if you sent `verified: true`. An unparseable date is also treated as too new. |
| `2004` | `SUSPENDED` | Temporarily suspended |
| `2005` | `BLOCKED` | Permanently not eligible for Allo financing |
| `2006` | `PARTNER_ERROR` | Partner-side failure, or a `verified: true` body missing `fullName`, `driverId`, or `registeredSince`. Allo tells the customer to try again later. Distinct from a genuine not-eligible answer. |

`message` is optional.

| Your response | What Allo does |
|---|---|
| `200` + verify JSON | Reads `code` / `verified` / `reason`. Aim for this. |
| `401` or `403` | Treats its own key/signature as rejected — never as an answer about the driver. Not retried, raised to the Allo team. |
| Any body without a boolean `verified` | Treated as `PARTNER_ERROR`. An error envelope is never read as a driver result. |
| Other non-2xx carrying valid verify JSON | Still read, so a stray status code does not break a real answer. Send `200` anyway. |
| `500+` empty body, or timeout | Retries once, then treats you as unreachable |

## Health check (GET)

Allo GETs `https://api.partner.example/allo/verify/health` with `X-Allo-Key` and `X-Allo-API-Version`. No body. No signature. Respond **200** when up.

## Rate limits

Allo sends at most **100 requests per 60 seconds** to each partner. If your endpoint is hit more often than that, something is misconfigured on our side — contact your Allo integration manager. You do not need to implement rate limiting yourself.

## Request signing (HMAC-SHA256)

```
t={unixSeconds},v1={hexHmacSha256}
```

Sign `{timestamp}.{rawBody}` with the shared secret. Read the body as raw text before parsing JSON. Do not rebuild the JSON. Reject signatures older than 300 seconds. Use a timing-safe comparison.

Code examples for **Node (Express)**, **Python (FastAPI)**, **PHP**, **Go**, and **Java** are on the `/auth` page.

### Node (Express)

```js
const crypto = require("crypto");

function verifySignature(rawBody, sigHeader, secret, tolerance = 300) {
  const parts = Object.fromEntries(
    String(sigHeader || "").split(",").map((s) => {
      const i = s.indexOf("=");
      return i > 0 ? [s.slice(0, i).trim(), s.slice(i + 1).trim()] : [];
    }).filter((p) => p.length === 2)
  );
  if (!parts.t || !parts.v1) return false;
  const expected = crypto.createHmac("sha256", secret).update(parts.t + "." + rawBody).digest("hex");
  const a = Buffer.from(parts.v1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const age = Math.floor(Date.now() / 1000) - Number(parts.t);
  return age >= 0 && age < tolerance;
}
```

Read the body as raw text before `JSON.parse`. Full Express route (key + signature + failure paths + health) is on `/auth`.

### Python (FastAPI)

```python
import hashlib, hmac, time

def verify_signature(raw_body: str, sig_header: str, secret: str, tolerance: int = 300) -> bool:
    parts = dict(p.split("=", 1) for p in (sig_header or "").split(",") if "=" in p)
    ts, v1 = parts.get("t"), parts.get("v1")
    if not ts or not v1 or not secret:
        return False
    expected = hmac.new(secret.encode(), f"{ts}.{raw_body}".encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(v1, expected):
        return False
    return 0 <= (int(time.time()) - int(ts)) < tolerance
```

### PHP

```php
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
```

### Go

```go
func verifySignature(rawBody, sigHeader, secret string, tolerance int64) bool {
	parts := map[string]string{}
	for _, seg := range strings.Split(sigHeader, ",") {
		k, v, ok := strings.Cut(seg, "=")
		if !ok { continue }
		parts[strings.TrimSpace(k)] = strings.TrimSpace(v)
	}
	ts, v1 := parts["t"], parts["v1"]
	if ts == "" || v1 == "" || secret == "" { return false }
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(ts + "." + rawBody))
	got, _ := hex.DecodeString(v1)
	if !hmac.Equal(got, mac.Sum(nil)) { return false }
	epoch, _ := strconv.ParseInt(ts, 10, 64)
	return (time.Now().Unix() - epoch) >= 0 && (time.Now().Unix() - epoch) < tolerance
}
```

### Java

```java
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
```

## Before you go live

1. Your URL starts with https:// (not http://)
2. You created an API key and gave it to Allo
3. Your endpoint returns verified, fullName, driverId, and registeredSince when eligible
4. registeredSince is YYYY-MM-DD (or ISO-8601); any other format is treated as too new
5. You confirmed the agreed minimum tenure with Allo (do not assume 6 months)
6. Your endpoint returns verified: false with a reason code for ineligible drivers
7. GET {yourUrl}/health responds 200 within 5 seconds
8. Your endpoint responds within 8 seconds under load
9. You handle all 6 reason codes (NOT_FOUND, INACTIVE, ACCOUNT_TOO_NEW, SUSPENDED, BLOCKED, PARTNER_ERROR)
10. Optional: you verify X-Allo-Signature using the signing secret from Allo

Human pages: `/` `/verify` `/auth` `/health` `/errors`
