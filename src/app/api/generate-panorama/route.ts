import { NextRequest, NextResponse } from 'next/server';
import { IntakeData, Panorama } from '@/types';
import { buildPanorama, computeMetrics } from '@/lib/calculations';
import { generatePanoramaNarratives } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const body: Partial<IntakeData> = await request.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'No intake data provided' },
        { status: 400 }
      );
    }

    // Step 1: Compute all metrics deterministically
    const metrics = computeMetrics(body);

    // Step 2: Build dimension results and summary
    const partialPanorama = buildPanorama(body);

    // Step 3: Generate AI narratives
    const ai_narratives = await generatePanoramaNarratives(body, metrics);

    // Step 4: Assemble final panorama
    const panorama: Panorama = {
      ...partialPanorama,
      ai_narratives,
    };

    return NextResponse.json(panorama);
  } catch (error) {
    console.error('Generate panorama error:', error);
    return NextResponse.json(
      { error: 'Failed to generate panorama. Please try again.' },
      { status: 500 }
    );
  }
}

// Ensure this runs on Node.js runtime (required for Anthropic SDK)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 second timeout for AI generation
