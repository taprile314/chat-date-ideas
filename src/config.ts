function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getServiceAccount(): { client_email: string; private_key: string } {
  const b64 = process.env['GOOGLE_SERVICE_ACCOUNT_JSON_B64'];
  if (b64) {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
  }
  // Fallback to individual env vars (local dev)
  return {
    client_email: required('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    private_key: required('GOOGLE_PRIVATE_KEY'),
  };
}

let _serviceAccount: { client_email: string; private_key: string } | undefined;
function lazyServiceAccount() {
  if (!_serviceAccount) _serviceAccount = getServiceAccount();
  return _serviceAccount;
}

export const config = {
  get telegramToken() {
    return required('TELEGRAM_BOT_API_KEY');
  },
  get telegramSecretToken() {
    return process.env['TELEGRAM_SECRET_TOKEN'] || '';
  },
  get googleServiceAccountEmail() {
    return lazyServiceAccount().client_email;
  },
  get googlePrivateKey() {
    return lazyServiceAccount().private_key;
  },
  get googleSheetId() {
    return required('GOOGLE_SHEET_ID');
  },
  get geminiApiKey() {
    return required('GEMINI_API_KEY');
  },
  get frontendPassword() {
    return process.env['FRONTEND_PASSWORD'] || '';
  },
} as const;
