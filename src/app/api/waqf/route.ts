import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Récupérer les points de Waqf pour une Ayah donnée
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ayahId = searchParams.get('ayahId');

  if (!ayahId) return NextResponse.json({ error: 'Ayah ID required' }, { status: 400 });

  const points = await prisma.waqfPoint.findMany({
    where: { 
      ayahId,
      status: 'APPROVED' // Règle stricte : Ne jamais envoyer de brouillons au public
    },
    orderBy: { wordIndex: 'asc' }
  });

  return NextResponse.json(points);
}

// Créer ou mettre à jour un point de Waqf
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ayahId, wordIndex, methodology, data, status } = body;

    const waqfPoint = await prisma.waqfPoint.upsert({
      where: { id: id || 'new-uuid' },
      update: {
        methodology,
        status,
        data: JSON.stringify(data),
      },
      create: {
        ayahId,
        wordIndex,
        methodology,
        status,
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json(waqfPoint);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save Waqf point' }, { status: 500 });
  }
}
