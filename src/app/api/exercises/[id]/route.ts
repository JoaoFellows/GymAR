import { NextRequest } from 'next/server';
import { getExercise, updateExerciseController, deleteExerciseController } from '@/server/controller/exercise';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  return getExercise(request, context);
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  return updateExerciseController(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  return deleteExerciseController(request, context);
}
