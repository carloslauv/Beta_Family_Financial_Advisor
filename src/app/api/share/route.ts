import { NextRequest, NextResponse } from 'next/server';
import { storePanorama } from './store';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { panorama } = body;

    if (!panorama) {
      return NextResponse.json({ error: 'Missing panorama data' }, { status: 400 });
    }

    const token = generateId();
    storePanorama(token, panorama);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Share route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
