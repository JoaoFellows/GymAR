import { NextRequest } from 'next/server';
import { getExerciseBySlugController } from '@/server/controller/exercise';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  return getExerciseBySlugController(request, { params });
}
