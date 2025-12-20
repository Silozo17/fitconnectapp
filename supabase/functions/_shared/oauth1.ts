/**
 * OAuth 1.0a Helper Functions
 * Used for Garmin Connect API integration
 */

export function generateNonce(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

export function generateSignatureBaseString(
  method: string,
  url: string,
  params: Record<string, string>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");

  return `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
}

export async function generateHmacSha1Signature(
  baseString: string,
  consumerSecret: string,
  tokenSecret: string = ""
): Promise<string> {
  const key = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(baseString);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export function generateAuthorizationHeader(
  oauthParams: Record<string, string>
): string {
  const headerParams = Object.keys(oauthParams)
    .filter((key) => key.startsWith("oauth_"))
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(", ");

  return `OAuth ${headerParams}`;
}
