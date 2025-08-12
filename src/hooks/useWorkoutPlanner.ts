import { useState, useEffect } from 'react';

export interface Exercise {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
}

export interface WorkoutExercise extends Exercise {
  sets?: number;
  reps?: number;
  addedAt: number;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
}

const STORAGE_KEY = 'gym-ar-workout-plan';

export function useWorkoutPlanner() {
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [toast, setToast] = useState<ToastState>({ 
    message: '', 
    type: 'success', 
    isVisible: false 
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Carregar exercícios do localStorage ao inicializar
  useEffect(() => {
    const savedWorkout = localStorage.getItem(STORAGE_KEY);
    if (savedWorkout) {
      try {
        const parsedWorkout = JSON.parse(savedWorkout) as WorkoutExercise[];
        if (Array.isArray(parsedWorkout)) {
          setSelectedExercises(parsedWorkout);
        }
      } catch (error) {
        console.error('Erro ao carregar treino do localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Salvar no localStorage sempre que a lista mudar
  useEffect(() => {
    if (selectedExercises.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedExercises));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedExercises]);

  const addExercise = (exercise: Exercise, sets = 3, reps = 12) => {
    const workoutExercise: WorkoutExercise = {
      ...exercise,
      sets,
      reps,
      addedAt: Date.now(),
    };

    setSelectedExercises(prev => {
      // Verificar se o exercício já está na lista
      const exists = prev.some(ex => ex.id === exercise.id);
      if (exists) {
        showToast('Este exercício já está no seu treino!', 'info');
        return prev; // Não adicionar duplicatas
      }
      showToast(`${exercise.title} adicionado ao treino!`, 'success');
      return [...prev, workoutExercise];
    });
  };

  const removeExercise = (exerciseId: number) => {
    setSelectedExercises(prev => {
      const exercise = prev.find(ex => ex.id === exerciseId);
      if (exercise) {
        showToast(`${exercise.title} removido do treino!`, 'info');
      }
      return prev.filter(ex => ex.id !== exerciseId);
    });
  };

  const updateExercise = (exerciseId: number, updates: Partial<Pick<WorkoutExercise, 'sets' | 'reps'>>) => {
    setSelectedExercises(prev =>
      prev.map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex)
    );
  };

  const clearWorkout = () => {
    if (selectedExercises.length > 0) {
      showToast('Treino removido com sucesso!', 'info');
    }
    setSelectedExercises([]);
  };

  const isExerciseSelected = (exerciseId: number) => {
    return selectedExercises.some(ex => ex.id === exerciseId);
  };

  return {
    selectedExercises,
    addExercise,
    removeExercise,
    updateExercise,
    clearWorkout,
    isExerciseSelected,
    totalExercises: selectedExercises.length,
    toast,
    showToast,
    hideToast,
  };
}
