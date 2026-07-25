const BASE_URL =
  process.env.DARAJA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!response.ok) {
    throw new Error("Failed to get Daraja access token");
  }

  const data = (await response.json()) as { access_token: string; expires_in: string };
  cachedToken = {
    token: data.access_token,
    // Refresh a minute early so a near-expiry token is never handed out.
    expiresAt: Date.now() + (Number(data.expires_in) - 60) * 1000,
  };
  return cachedToken.token;
}

function darajaTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export type StkPushResult = {
  CheckoutRequestID: string;
  MerchantRequestID: string;
};

export async function initiateStkPush(params: {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}): Promise<StkPushResult> {
  const token = await getAccessToken();
  const shortcode = process.env.DARAJA_SHORTCODE!;
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${shortcode}${process.env.DARAJA_PASSKEY}${timestamp}`).toString(
    "base64"
  );

  // The callback URL carries a shared secret as a query param — Safaricom
  // doesn't sign callbacks, and CheckoutRequestID is returned to the client,
  // so without this anyone holding it could POST a forged "paid" callback
  // for their own order. Only requests carrying this token are trusted.
  const callbackUrl = new URL(process.env.DARAJA_CALLBACK_URL!);
  callbackUrl.searchParams.set("token", process.env.DARAJA_CALLBACK_SECRET!);

  const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: params.amount,
      PartyA: params.phone,
      PartyB: shortcode,
      PhoneNumber: params.phone,
      CallBackURL: callbackUrl.toString(),
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    }),
  });

  const data = await response.json();

  if (!response.ok || typeof data.CheckoutRequestID !== "string") {
    throw new Error(data.errorMessage ?? "STK push failed");
  }

  return data as StkPushResult;
}
