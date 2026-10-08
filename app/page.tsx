"use client";

import { useState } from "react";

type Question = {
  number: number;
  statement: string;
  studentAnswer: string;
  illegible: boolean;
  suggestedScore: number;
  justification: string;
  review: boolean;
};

const MAX_IMAGES = 3;
const MAX_SIDE = 1600;

async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize"))), "image/jpeg", 0.85),
  );
}

export default function Home() {
  const [answerKey, setAnswerKey] = useState("");
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[] | null>(null);

  async function addPhotos(list: FileList | null) {
    if (!list) return;
    const resized = await Promise.all(Array.from(list).map(resize));
    setPhotos((prev) => [...prev, ...resized].slice(0, MAX_IMAGES));
  }

  async function grade() {
    setLoading(true);
    setError("");
    const body = new FormData();
    body.append("answerKey", answerKey);
    photos.forEach((p, i) => body.append("images", p, `page-${i + 1}.jpg`));
    try {
      const res = await fetch("/api/grade", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
    } catch {
      setError("Não foi possível corrigir. Tente outra foto, com boa luz e a folha inteira.");
    } finally {
      setLoading(false);
    }
  }

  function setScore(index: number, value: string) {
    const score = Math.min(1, Math.max(0, Number(value) || 0));
    setQuestions((qs) => qs!.map((q, i) => (i === index ? { ...q, suggestedScore: score } : q)));
  }

  function reset() {
    setPhotos([]);
    setQuestions(null);
    setError("");
  }

  const total = questions?.reduce((s, q) => s + q.suggestedScore, 0) ?? 0;
  const toReview = questions?.filter((q) => q.review).length ?? 0;

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">OpenGrade</h1>
        <p className="text-sm text-neutral-600">Fotografe a prova. A IA corrige. Você revisa só o que ficou em dúvida.</p>
      </header>

      {!questions && (
        <section className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Gabarito (opcional)</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-base"
              rows={4}
              placeholder="Ex.: 1) B  2) 42  3) A fotossíntese transforma luz em energia..."
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
            />
          </label>

          <label className="flex cursor-pointer items-center justify-center rounded-lg bg-emerald-600 px-4 py-4 text-lg font-semibold text-white has-disabled:opacity-50">
            {photos.length === 0 ? "Fotografar prova" : "Adicionar outra página"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="sr-only"
              disabled={photos.length >= MAX_IMAGES || loading}
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          {photos.length > 0 && (
            <div className="flex gap-2">
              {photos.map((p, i) => (
                <img key={i} src={URL.createObjectURL(p)} alt={`Página ${i + 1}`} className="h-24 rounded border object-cover" />
              ))}
            </div>
          )}

          <button
            className="w-full rounded-lg bg-neutral-900 px-4 py-4 text-lg font-semibold text-white disabled:opacity-40"
            disabled={photos.length === 0 || loading}
            onClick={grade}
          >
            {loading ? "Corrigindo..." : `Corrigir (${photos.length} de ${MAX_IMAGES} páginas)`}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </section>
      )}

      {questions && (
        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-4">
            <div>
              <p className="text-sm text-neutral-600">Nota total</p>
              <p className="text-3xl font-bold">
                {total.toFixed(1)} <span className="text-lg font-normal text-neutral-500">de {questions.length}</span>
              </p>
            </div>
            <p className="text-sm">{toReview} para revisar</p>
          </div>

          {questions.map((q, i) => (
            <article key={i} className={`rounded-lg border p-4 ${q.review ? "border-amber-400 bg-amber-50" : "border-neutral-200"}`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-semibold">Questão {q.number}</h2>
                {q.review && <span className="rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">Revisar</span>}
              </div>
              <p className="text-sm text-neutral-700">{q.statement}</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Resposta: </span>
                {q.illegible ? <em className="text-amber-800">ilegível</em> : q.studentAnswer || <em>em branco</em>}
              </p>
              <p className="mt-1 text-sm text-neutral-600">{q.justification}</p>
              <label className="mt-3 flex items-center gap-2 text-sm">
                Nota
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={1}
                  step={0.1}
                  value={q.suggestedScore}
                  onChange={(e) => setScore(i, e.target.value)}
                  className="w-20 rounded border border-neutral-300 p-1 text-base"
                />
                de 1
              </label>
            </article>
          ))}

          <button className="w-full rounded-lg border border-neutral-300 px-4 py-3 font-semibold" onClick={reset}>
            Corrigir outra prova
          </button>
        </section>
      )}
    </main>
  );
}
