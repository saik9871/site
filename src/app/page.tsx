import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to WEENSTOCKS</h1>
      <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
        Enter Dashboard
      </button>
    </main>
  );
}
