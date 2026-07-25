import { describe, expect, it } from "vitest";
import { CONTACT_PHONE_PATTERN, DARAJA_PHONE_PATTERN } from "../netlify/functions/_lib/phone";

describe("CONTACT_PHONE_PATTERN", () => {
  it("accepts local and international formats", () => {
    expect(CONTACT_PHONE_PATTERN.test("254712345678")).toBe(true);
    expect(CONTACT_PHONE_PATTERN.test("+254712345678")).toBe(true);
  });

  it("rejects too-short, too-long, and non-numeric input", () => {
    expect(CONTACT_PHONE_PATTERN.test("12345")).toBe(false);
    expect(CONTACT_PHONE_PATTERN.test("1234567890123456")).toBe(false);
    expect(CONTACT_PHONE_PATTERN.test("abc1234567")).toBe(false);
  });
});

describe("DARAJA_PHONE_PATTERN", () => {
  it("accepts a valid Safaricom MSISDN", () => {
    expect(DARAJA_PHONE_PATTERN.test("254712345678")).toBe(true);
  });

  it("rejects a leading plus, leading zero, or wrong network prefix", () => {
    expect(DARAJA_PHONE_PATTERN.test("+254712345678")).toBe(false);
    expect(DARAJA_PHONE_PATTERN.test("0712345678")).toBe(false);
    expect(DARAJA_PHONE_PATTERN.test("254812345678")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(DARAJA_PHONE_PATTERN.test("25471234567")).toBe(false);
    expect(DARAJA_PHONE_PATTERN.test("2547123456789")).toBe(false);
  });
});
