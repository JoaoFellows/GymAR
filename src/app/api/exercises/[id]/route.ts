import { NextRequest } from 'next/server';
import { getExercise, updateExerciseController, deleteExerciseController } from '@/server/controller/exercise';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return getExercise(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return updateExerciseController(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return deleteExerciseController(request, { params });
}
