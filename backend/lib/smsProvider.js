const normalizePhone = (phone) => String(phone || "").replace(/[^0-9+]/g, "");

const sendWithConsoleProvider = async ({ to, message, reference }) => {
  console.log("[sms:console]", { to, message, reference });
  return {
    attempted: true,
    status: "queued",
    provider: "console",
    reference,
    reason: "Queued in console provider",
  };
};

const sendWithMockProvider = async ({ to, message, reference }) => {
  if (!to || message.length < 5) {
    return {
      attempted: true,
      status: "failed",
      provider: "mock",
      reference,
      reason: "Invalid payload for mock provider",
    };
  }

  return {
    attempted: true,
    status: "sent",
    provider: "mock",
    reference,
    reason: "Delivered by mock provider",
  };
};

export const sendSms = async ({ to, message, reference }) => {
  const normalizedTo = normalizePhone(to);
  const provider = String(process.env.SMS_PROVIDER || "console").toLowerCase();

  if (!normalizedTo) {
    return {
      attempted: false,
      status: "failed",
      provider,
      reference,
      reason: "No phone available for SMS fallback",
    };
  }

  if (provider === "mock") {
    return sendWithMockProvider({ to: normalizedTo, message, reference });
  }

  return sendWithConsoleProvider({ to: normalizedTo, message, reference });
};
