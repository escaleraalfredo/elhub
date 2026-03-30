"use client";
export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-red-400 to-blue-500 flex items-center justify-center text-7xl mb-4">🇵🇷</div>
        <h1 className="text-4xl font-bold">Alfredo Escalera</h1>
        <p className="text-emerald-500">San Juan • 24 spots visitados</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8">
          <h3 className="font-semibold mb-4">Mis últimos check-ins</h3>
          <p className="text-emerald-600">La Factoría • hace 2h</p>
          <p className="text-emerald-600">Jungle Bird • ayer</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8">
          <h3 className="font-semibold mb-4">Mis fotos</h3>
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-zinc-300 rounded-2xl" />
            <div className="w-24 h-24 bg-zinc-300 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}