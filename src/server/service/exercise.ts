import { db } from '../db';

// Tipos para as operações
interface CreateExerciseData {
  name: string;
  slug: string;
  description?: string;
  modelo3D?: string;
  videoAR?: string;
}

interface UpdateExerciseData {
  name?: string;
  slug?: string;
  description?: string;
  modelo3D?: string;
  videoAR?: string;
}

// Criar um novo exercício
export async function createExercise(data: CreateExerciseData) {
  try {
    const exercise = await db.exercise.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        modelo3D: data.modelo3D,
        videoAR: data.videoAR,
      },
    });
    return exercise;
  } catch (error) {
    throw new Error(`Erro ao criar exercício: ${error}`);
  }
}

// Buscar todos os exercícios
export async function getAllExercises() {
  try {
    const exercises = await db.exercise.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return exercises;
  } catch (error) {
    throw new Error(`Erro ao buscar exercícios: ${error}`);
  }
}

// Buscar exercício por ID
export async function getExerciseById(id: number) {
  try {
    const exercise = await db.exercise.findUnique({
      where: {
        id,
      },
    });
    
    if (!exercise) {
      throw new Error('Exercício não encontrado');
    }
    
    return exercise;
  } catch (error) {
    throw new Error(`Erro ao buscar exercício: ${error}`);
  }
}

// Buscar exercício por slug
export async function getExerciseBySlug(slug: string) {
  try {
    const exercise = await db.exercise.findUnique({
      where: {
        slug,
      },
    });
    
    if (!exercise) {
      throw new Error('Exercício não encontrado');
    }
    
    return exercise;
  } catch (error) {
    throw new Error(`Erro ao buscar exercício: ${error}`);
  }
}

// Atualizar exercício
export async function updateExercise(id: number, data: UpdateExerciseData) {
  try {
    const exercise = await db.exercise.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return exercise;
  } catch (error) {
    throw new Error(`Erro ao atualizar exercício: ${error}`);
  }
}

// Deletar exercício
export async function deleteExercise(id: number) {
  try {
    const exercise = await db.exercise.delete({
      where: {
        id,
      },
    });
    return exercise;
  } catch (error) {
    throw new Error(`Erro ao deletar exercício: ${error}`);
  }
}

// Buscar exercícios por nome (busca parcial)
export async function searchExercisesByName(name: string) {
  try {
    const exercises = await db.exercise.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return exercises;
  } catch (error) {
    throw new Error(`Erro ao buscar exercícios: ${error}`);
  }
}