import { google } from 'googleapis';
import { config } from '../config';
import type { DateIdea, SheetRow } from '../types/idea';

const SHEET_NAME = 'ideas';

let _sheets: ReturnType<typeof google.sheets> | undefined;
function getSheets() {
  if (!_sheets) {
    const auth = new google.auth.JWT({
      email: config.googleServiceAccountEmail,
      key: config.googlePrivateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    _sheets = google.sheets({ version: 'v4', auth });
  }
  return _sheets;
}

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

  await getSheets().spreadsheets.values.append({
    spreadsheetId: config.googleSheetId,
    range: `${SHEET_NAME}!A:J`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

export async function getIdeaById(id: string): Promise<DateIdea | null> {
  const ideas = await getAllIdeas();
  return ideas.find((i) => i.id === id) || null;
}

export async function updateIdea(
  id: string,
  updates: Partial<Omit<DateIdea, 'id' | 'created_at' | 'added_by' | 'raw_input'>>
): Promise<boolean> {
  const res = await getSheets().spreadsheets.values.get({
    spreadsheetId: config.googleSheetId,
    range: `${SHEET_NAME}!A2:J`,
  });

  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const row = rows[rowIndex];
  if (updates.title !== undefined) row[3] = updates.title;
  if (updates.description !== undefined) row[4] = updates.description;
  if (updates.cost_tier !== undefined) row[5] = updates.cost_tier;
  if (updates.cost_exact !== undefined)
    row[6] = updates.cost_exact !== null ? String(updates.cost_exact) : '';
  if (updates.category !== undefined) row[7] = updates.category;
  if (updates.tags !== undefined) row[8] = updates.tags.join(', ');

  const sheetRow = rowIndex + 2; // +1 header, +1 zero-index
  await getSheets().spreadsheets.values.update({
    spreadsheetId: config.googleSheetId,
    range: `${SHEET_NAME}!A${sheetRow}:J${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });

  return true;
}

export async function deleteIdea(id: string): Promise<boolean> {
  const res = await getSheets().spreadsheets.values.get({
    spreadsheetId: config.googleSheetId,
    range: `${SHEET_NAME}!A2:J`,
  });

  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  // Get the sheet ID (gid) for deleteDimension
  const sheetMeta = await getSheets().spreadsheets.get({
    spreadsheetId: config.googleSheetId,
    fields: 'sheets.properties',
  });
  const sheet = sheetMeta.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  );
  const sheetId = sheet?.properties?.sheetId ?? 0;

  const sheetRow = rowIndex + 1; // +1 for header (0-indexed for batchUpdate)
  await getSheets().spreadsheets.batchUpdate({
    spreadsheetId: config.googleSheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: sheetRow,
              endIndex: sheetRow + 1,
            },
          },
        },
      ],
    },
  });

  return true;
}

export async function getAllIdeas(limit = 100): Promise<DateIdea[]> {
  const res = await getSheets().spreadsheets.values.get({
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
