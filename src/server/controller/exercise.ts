import { NextRequest, NextResponse } from 'next/server';
import {
  createExercise,
  getAllExercises,
  getExerciseById,
  getExerciseBySlug,
  updateExercise,
  deleteExercise,
  searchExercisesByName,
} from '../service/exercise';

// GET /api/exercises - Buscar todos os exercícios
export async function getExercises(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let exercises;
    if (search) {
      exercises = await searchExercisesByName(search);
    } else {
      exercises = await getAllExercises();
    }

    return NextResponse.json({ exercises }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar exercícios' },
      { status: 500 }
    );
  }
}

// GET /api/exercises/[id] - Buscar exercício por ID
export async function getExercise(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const exercise = await getExerciseById(id);
    return NextResponse.json({ exercise }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Exercício não encontrado' },
      { status: 404 }
    );
  }
}

// GET /api/exercises/slug/[slug] - Buscar exercício por slug
export async function getExerciseBySlugController(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const exercise = await getExerciseBySlug(params.slug);
    return NextResponse.json({ exercise }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Exercício não encontrado' },
      { status: 404 }
    );
  }
}

// POST /api/exercises - Criar novo exercício
export async function createExerciseController(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, categoria, modelo3D, videoAR } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      );
    }

    const exercise = await createExercise({
      name,
      slug,
      description,
      categoria,
      modelo3D,
      videoAR,
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar exercício' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Atualizar exercício
export async function updateExerciseController(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, slug, description, categoria, modelo3D, videoAR } = body;

    const exercise = await updateExercise(id, {
      name,
      slug,
      description,
      categoria,
      modelo3D,
      videoAR,
    });

    return NextResponse.json({ exercise }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar exercício' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Deletar exercício
export async function deleteExerciseController(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await deleteExercise(id);
    return NextResponse.json(
      { message: 'Exercício deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar exercício' },
      { status: 500 }
    );
  }
}
