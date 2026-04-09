import { google } from 'googleapis';
import { config } from '../config';
import type { DateIdea, SheetRow } from '../types/idea';

const SHEET_NAME = 'ideas';

const auth = new google.auth.JWT({
  email: config.googleServiceAccountEmail,
  key: config.googlePrivateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function appendIdea(idea: DateIdea): Promise<void> {
  const row: SheetRow = [
    idea.id,
    idea.created_at,
    idea.added_by,
    idea.title,
    idea.description,
    idea.cost_tier,
    idea.cost_exact !== null ? String(idea.cost_exact) : '',
    idea.category,
    idea.tags.join(', '),
    idea.raw_input,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.googleSheetId,
    range: `${SHEET_NAME}!A:J`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

export async function getAllIdeas(limit = 100): Promise<DateIdea[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSheetId,
    range: `${SHEET_NAME}!A2:J`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  const sliced = rows.slice(-limit);

  return sliced.map((row): DateIdea => ({
    id: row[0] || '',
    created_at: row[1] || '',
    added_by: row[2] || '',
    title: row[3] || '',
    description: row[4] || '',
    cost_tier: (row[5] as DateIdea['cost_tier']) || '$',
    cost_exact: row[6] ? Number(row[6]) : null,
    category: (row[7] as DateIdea['category']) || 'other',
    tags: row[8] ? row[8].split(', ').filter(Boolean) : [],
    raw_input: row[9] || '',
  }));
}
