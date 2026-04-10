import { NextRequest, NextResponse } from 'next/server';
import { updateIdea, deleteIdea } from '@/src/services/sheets';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();

  const updated = await updateIdea(id, updates);
  if (!updated) {
    return NextResponse.json(
      { error: 'Idea no encontrada' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deleted = await deleteIdea(id);
  if (!deleted) {
    return NextResponse.json(
      { error: 'Idea no encontrada' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
