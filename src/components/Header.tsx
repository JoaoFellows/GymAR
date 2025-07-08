import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="flex items-center justify-center p-4 bg-transparent">
            <Link href="/" className="inline-block">
                <Image src="/logo.png" alt="GymAR Logo" width={100} height={100} />
            </Link>
        </header>
    );
}