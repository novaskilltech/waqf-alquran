import { NextResponse } from 'next/server';

export async function GET() {
  // Toujours retourner success: true pour indiquer que notre Next.js API est en ligne
  return NextResponse.json({
    success: true,
    message: "Shamela integrated API proxy is online"
  });
}
