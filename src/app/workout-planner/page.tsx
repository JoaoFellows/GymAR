'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { ArrowLeft, Plus, Trash2, Play, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWorkoutPlanner } from '@/hooks/useWorkoutPlanner';
import { exercises } from '@/data/exercises';
import Toast from '@/components/Toast';

export default function WorkoutPlannerPage() {
  const router = useRouter();
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const {
    selectedExercises,
    addExercise,
    removeExercise,
    updateExercise,
    clearWorkout,
    isExerciseSelected,
    totalExercises,
    toast,
    hideToast,
  } = useWorkoutPlanner();

  const categories = [
    { key: 'upper-body', label: 'Parte Superior' },
    { key: 'lower-body', label: 'Parte Inferior' },
  ];

  const availableExercises = selectedCategory
    ? exercises.filter(ex => ex.category === selectedCategory)
    : exercises;

  const handleAddExercise = (exercise: typeof exercises[0]) => {
    addExercise(exercise);
    setShowExerciseSelector(false);
    setSelectedCategory(null);
  };

  return (
    <div className="bg-gradient-to-b from-[#121111] to-[#020217] min-h-screen text-white">
      <Header />
      
      <button
        onClick={() => router.back()}
        className="flex items-center text-white mb-4 hover:underline absolute top-12 left-4"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar
      </button>

      <main className="pt-20 px-4 pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <Calendar className="h-8 w-8 text-white mr-3" />
            <h1 className="text-3xl font-bold">Treino do Dia</h1>
          </div>

          {/* Stats */}
          <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
            <p className="text-lg">
              <span className="font-bold text-2xl text-green-400">{totalExercises}</span>{' '}
              {totalExercises === 1 ? 'exercício selecionado' : 'exercícios selecionados'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6 justify-center flex-wrap">
            <button
              onClick={() => setShowExerciseSelector(true)}
              className="flex items-center bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg h-14 w-56 font-semibold transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Exercício
            </button>
            
            {totalExercises > 0 && (
              <button
                onClick={clearWorkout}
                className="flex items-center justify-center bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg h-14 w-56 font-semibold transition-colors"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Limpar Treino
              </button>
            )}
          </div>

          {/* Selected Exercises List */}
          {selectedExercises.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4 text-center">Seus Exercícios</h2>
              {selectedExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="bg-white/10 rounded-lg p-4"
                >
                  <div className="flex flex-col">
                    {/* Header with number and title */}
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold">{exercise.title}</h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4">{exercise.description}</p>
                    
                    {/* Sets and Reps inputs */}
                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <label className="text-gray-400">Séries:</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, { sets: parseInt(e.target.value)})}
                          className="bg-white/20 rounded px-2 py-1 w-16 text-center text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-400">Reps:</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(exercise.id, { reps: parseInt(e.target.value)})}
                          className="bg-white/20 rounded px-2 py-1 w-16 text-center text-white"
                        />
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 w-full">
                      <Link
                        href={`/exercise/${exercise.category}/${exercise.slug}`}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        AR
                      </Link>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        className="flex items-center justify-center bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-semibold transition-colors min-w-[60px]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-24 w-24 text-gray-500 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">Nenhum exercício selecionado ainda</p>
              <p className="text-gray-500">Adicione exercícios ao seu treino do dia clicando no botão acima</p>
            </div>
          )}
        </div>
      </main>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a2e] rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Selecionar Exercício</h2>
              <button
                onClick={() => {
                  setShowExerciseSelector(false);
                  setSelectedCategory(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Category Selection */}
            {!selectedCategory ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map(category => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className="bg-white/10 hover:bg-white/20 p-6 rounded-lg text-center transition-colors"
                  >
                    <h3 className="text-lg font-semibold">{category.label}</h3>
                    <p className="text-sm text-gray-400 mt-2">
                      {exercises.filter(ex => ex.category === category.key).length} exercícios
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center text-gray-400 hover:text-white mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às categorias
                </button>
                
                <div className="grid grid-cols-1 gap-3">
                  {availableExercises.map(exercise => (
                    <div
                      key={exercise.id}
                      className={`bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-colors ${
                        isExerciseSelected(exercise.id) ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{exercise.title}</h3>
                          <p className="text-sm text-gray-400">{exercise.description}</p>
                        </div>
                        <button
                          onClick={() => handleAddExercise(exercise)}
                          disabled={isExerciseSelected(exercise.id)}
                          className={`px-4 py-2 rounded font-semibold transition-colors ${
                            isExerciseSelected(exercise.id)
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isExerciseSelected(exercise.id) ? 'Já adicionado' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
