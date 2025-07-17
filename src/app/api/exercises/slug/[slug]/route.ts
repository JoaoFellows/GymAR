import { NextRequest } from 'next/server';
import { getExerciseBySlugController } from '@/server/controller/exercise';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = (await params).slug;
  return getExerciseBySlugController(request, { params: { slug } });
}