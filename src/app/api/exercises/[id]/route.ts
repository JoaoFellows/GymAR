import { NextRequest } from 'next/server';
import {
  getExercise,
  updateExerciseController,
  deleteExerciseController,
} from '@/server/controller/exercise';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id; 
  return getExercise(request, { params: { id } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id) {
    return new Response('Missing exercise ID', { status: 400 });
  }
  return updateExerciseController(request, { params: { id } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id) {
    return new Response('Missing exercise ID', { status: 400 });
  }
  return deleteExerciseController(request, { params: { id } });
}