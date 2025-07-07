import { NextRequest } from 'next/server';
import { getExercises, createExerciseController } from '@/server/controller/exercise';

export async function GET(request: NextRequest) {
  return getExercises(request);
}

export async function POST(request: NextRequest) {
  return createExerciseController(request);
}
