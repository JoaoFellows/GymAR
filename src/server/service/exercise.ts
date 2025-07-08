import { db } from '../db';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

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

// Função para gerar QR code para um exercício
async function generateQRCodeForExercise(slug: string, exerciseName: string) {
  try {
    const qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');
    
    // Garantir que o diretório existe
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
    
    const url = `https://gymar.app/ar/${slug}`;
    const fileName = `${slug}.png`;
    const filePath = path.join(qrCodeDir, fileName);
    
    const options = {
      errorCorrectionLevel: 'M' as const,
      type: 'png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };

    await QRCode.toFile(filePath, url, options);
    console.log(`✅ QR Code gerado para "${exerciseName}": ${fileName}`);
    return `/qrcodes/${fileName}`;
  } catch (error) {
    console.error(`❌ Erro ao gerar QR code para "${exerciseName}":`, error);
    return null;
  }
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
    
    // Gerar QR code automaticamente
    await generateQRCodeForExercise(exercise.slug, exercise.name);
    
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
    // Buscar o exercício atual para verificar se o slug mudou
    const currentExercise = await db.exercise.findUnique({
      where: { id },
    });
    
    if (!currentExercise) {
      throw new Error('Exercício não encontrado');
    }
    
    const exercise = await db.exercise.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    
    // Se o slug mudou, deletar o QR code antigo e gerar um novo
    if (data.slug && data.slug !== currentExercise.slug) {
      await deleteQRCodeForExercise(currentExercise.slug, currentExercise.name);
      await generateQRCodeForExercise(exercise.slug, exercise.name);
    }
    // Se apenas o nome mudou, regenerar o QR code com o novo nome
    else if (data.name && data.name !== currentExercise.name) {
      await generateQRCodeForExercise(exercise.slug, exercise.name);
    }
    
    return exercise;
  } catch (error) {
    throw new Error(`Erro ao atualizar exercício: ${error}`);
  }
}

// Função para deletar QR code de um exercício
async function deleteQRCodeForExercise(slug: string, exerciseName: string) {
  try {
    const qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');
    const fileName = `${slug}.png`;
    const filePath = path.join(qrCodeDir, fileName);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ QR Code deletado para "${exerciseName}": ${fileName}`);
      return true;
    } else {
      console.log(`⚠️ QR Code não encontrado para "${exerciseName}": ${fileName}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao deletar QR code para "${exerciseName}":`, error);
    return false;
  }
}

// Deletar exercício
export async function deleteExercise(id: number) {
  try {
    // Primeiro, buscar o exercício para pegar o slug
    const exerciseToDelete = await db.exercise.findUnique({
      where: { id },
    });
    
    if (!exerciseToDelete) {
      throw new Error('Exercício não encontrado');
    }
    
    // Deletar o exercício do banco
    const exercise = await db.exercise.delete({
      where: {
        id,
      },
    });
    
    // Deletar o QR code correspondente
    await deleteQRCodeForExercise(exerciseToDelete.slug, exerciseToDelete.name);
    
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

// Função para limpar QR codes órfãos (sem exercício correspondente)
export async function cleanOrphanedQRCodes() {
  try {
    const qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');
    
    if (!fs.existsSync(qrCodeDir)) {
      console.log('📁 Diretório de QR codes não existe');
      return { cleaned: 0, errors: 0 };
    }
    
    // Buscar todos os exercícios para obter os slugs válidos
    const exercises = await getAllExercises();
    const validSlugs = new Set(exercises.map(ex => ex.slug));
    
    // Listar todos os arquivos QR code
    const qrCodeFiles = fs.readdirSync(qrCodeDir).filter(file => file.endsWith('.png'));
    
    let cleaned = 0;
    let errors = 0;
    
    console.log(`🔍 Verificando ${qrCodeFiles.length} arquivos QR code...`);
    
    for (const file of qrCodeFiles) {
      const slug = file.replace('.png', '');
      
      if (!validSlugs.has(slug)) {
        try {
          const filePath = path.join(qrCodeDir, file);
          fs.unlinkSync(filePath);
          console.log(`🗑️ QR code órfão removido: ${file}`);
          cleaned++;
        } catch (error) {
          console.error(`❌ Erro ao remover ${file}:`, error);
          errors++;
        }
      }
    }
    
    console.log(`✅ Limpeza concluída: ${cleaned} arquivos removidos, ${errors} erros`);
    return { cleaned, errors };
  } catch (error) {
    console.error('❌ Erro durante limpeza de QR codes:', error);
    throw new Error(`Erro ao limpar QR codes órfãos: ${error}`);
  }
}