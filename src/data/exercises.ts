export interface Exercise {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
}

export const exercises: Exercise[] = [
  // Upper body exercises
  {
    id: 1,
    title: "Abdominal Bicicleta",
    slug: "abdominal-bicicleta",
    description: "Exercício para o abdômen.",
    category: "upper-body",
  },
  {
    id: 2,
    title: "Rosca alternada",
    slug: "biceps-curl",
    description: "Exercício para bíceps.",
    category: "upper-body",
  },
  {
    id: 3,
    title: "Elevação Frontal",
    slug: "elevacao-frontal",
    description: "Trabalha os ombros e tríceps.",
    category: "upper-body",
  },

  // Lower body exercises
  {
    id: 6,
    title: "Kettlebell Swing",
    slug: "ketb",
    description: "Um exercício para as pernas e glúteos.",
    category: "lower-body",
  },
  {
    id: 7,
    title: "Terra Sumo com levantamento",
    slug: "terra-sumo",
    description: "Trabalha quadríceps e ombro.",
    category: "lower-body",
  },
  {
    id: 8,
    title: "Agachamento unilateral",
    slug: "pistol-squat",
    description: "Foca nos posteriores de coxa e glúteos.",
    category: "lower-body",
  },
];

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return exercises.find(ex => ex.slug === slug);
}

export function getExercisesByCategory(category: string): Exercise[] {
  return exercises.filter(ex => ex.category === category);
}
