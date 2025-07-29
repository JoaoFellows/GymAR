'use client';
import { use } from "react";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";

const exercises = [
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
        title: "Desenvolvimento de Ombros",
        slug: "desenvolvimento-ombros",
        description: "Trabalha os ombros e tríceps.",
        category: "upper-body",
    },
    {
        id: 4,
        title: "Tríceps no Banco",
        slug: "triceps-banco",
        description: "Foca no tríceps.",
        category: "upper-body",
    },
    {
        id: 5,
        title: "Remada Curvada",
        slug: "remada-curvada",
        description: "Exercício para costas e antebraços.",
        category: "upper-body",
    },
    // Lower body exercises
    {
        id: 6,
        title: "Agachamento",
        slug: "agachamento",
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
        title: "Stiff",
        slug: "stiff",
        description: "Foca nos posteriores de coxa e glúteos.",
        category: "lower-body",
    },
    {
        id: 9,
        title: "Panturrilha em Pé",
        slug: "panturrilha-em-pe",
        description: "Exercício para panturrilhas.",
        category: "lower-body",
    },
    {
        id: 10,
        title: "Cadeira Extensora",
        slug: "cadeira-extensora",
        description: "Isola o quadríceps.",
        category: "lower-body",
    },
];

type Props = { params: Promise<{ category: string; }>; };

export default function CategoryPage({ params }: Props) {
    const { category } = use(params);
    const router = useRouter();

    if (!category) {
        notFound();
    }

    return (
        <div className="bg-gradient-to-b from-[#121111] to-[#020217] min-h-screen text-white text-center">
            <Header />
            <button
                onClick={() => router.back()}
                className="flex items-center text-white mb-4 hover:underline absolute top-12 left-4 font-"
                aria-label="Voltar"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
            </button>
            <main>
                <h1>Exercícios de {category}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {exercises.filter(ex => ex.category === category).map(exercise => (
                        <Link
                            key={exercise.id}
                            href={`/exercise/${category}/${exercise.slug}`}
                            className="bg-[#1e1e2f] p-4 rounded-lg block hover:bg-[#292945] transition"
                        >
                            <h2 className="text-lg font-bold">{exercise.title}</h2>
                            <p>{exercise.description}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
