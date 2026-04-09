import { google } from 'googleapis';
import { config } from '../src/config';

const SHEET_NAME = 'ideas';
const HEADERS = [
  'id',
  'created_at',
  'added_by',
  'title',
  'description',
  'cost_tier',
  'cost_exact',
  'category',
  'tags',
  'raw_input',
];

async function setup() {
  const auth = new google.auth.JWT({
    email: config.googleServiceAccountEmail,
    key: config.googlePrivateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = config.googleSheetId;

  // Check if 'ideas' sheet exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  );

  if (!existing) {
    // Add the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: SHEET_NAME, index: 0 },
            },
          },
        ],
      },
    });
    console.log(`Created sheet "${SHEET_NAME}"`);
  }

  // Write headers to row 1
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:J1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
  });

  // Freeze row 1
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = sheetMeta.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  )?.properties?.sheetId;

  if (sheetId !== undefined) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });
  }

  console.log('Headers written and row 1 frozen. Setup complete.');
}

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
