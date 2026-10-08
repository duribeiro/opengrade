import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_URL = process.env.LLM_BASE_URL ?? "https://ollama.com/v1";
const MODEL = process.env.LLM_MODEL ?? "kimi-k2.6";
const REASONING_EFFORT = process.env.LLM_REASONING_EFFORT ?? "none";
const MAX_IMAGES = 3;
const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"];

const questionSchema = z.object({
  number: z.coerce.number().int(),
  statement: z.string(),
  studentAnswer: z.string(),
  illegible: z.boolean(),
  suggestedScore: z.coerce.number().min(0).max(1),
  justification: z.string(),
  review: z.boolean(),
});

const resultSchema = z.object({ questions: z.array(questionSchema).min(1) });

const tool = {
  type: "function",
  function: {
    name: "report_grading",
    description: "Report the transcription and grading of every question found in the exam images.",
    parameters: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              number: { type: "integer" },
              statement: { type: "string" },
              studentAnswer: { type: "string" },
              illegible: { type: "boolean" },
              suggestedScore: { type: "number", minimum: 0, maximum: 1 },
              justification: { type: "string" },
              review: { type: "boolean" },
            },
            required: ["number", "statement", "studentAnswer", "illegible", "suggestedScore", "justification", "review"],
          },
        },
      },
      required: ["questions"],
    },
  },
};

const PROMPT = `Você é um professor experiente corrigindo uma prova respondida por um aluno. As imagens são as páginas da prova, em ordem.

Para cada questão da prova:
- number: número da questão.
- statement: o enunciado, como está impresso.
- studentAnswer: a resposta do aluno, transcrita exatamente como escrita, sem corrigir ortografia nem completar palavras. Em múltipla escolha, a alternativa marcada.
- illegible: true se você não consegue ler a resposta com segurança. Nesse caso studentAnswer fica vazia ("").
- suggestedScore: nota de 0 a 1 (aceita frações como 0.5).
- justification: uma frase curta em português explicando a nota.
- review: true se illegible for true, se a letra estiver borrada ou difícil, se você precisou adivinhar qualquer palavra, ou se tiver dúvida sobre a nota.

Regras:
- Nunca invente texto. Se não dá para ler com segurança, marque illegible e não chute.
- Questão sem resposta: studentAnswer vazia, nota 0, illegible false.
{ANSWER_KEY}

Responda chamando a ferramenta report_grading.`;

function buildPrompt(answerKey: string) {
  const key = answerKey
    ? `- Use este gabarito do professor como referência principal:\n${answerKey}`
    : `- Não há gabarito. Avalie pelo seu conhecimento e comece cada justification com "Sem gabarito, nota sugerida: ".`;
  return PROMPT.replace("{ANSWER_KEY}", key);
}

function extractArguments(data: any): unknown {
  const message = data?.choices?.[0]?.message;
  const args = message?.tool_calls?.[0]?.function?.arguments;
  const raw = args ?? message?.content?.match(/\{[\s\S]*\}/)?.[0];
  if (typeof raw !== "string") return args ?? null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "missing_api_key" }, { status: 500 });
  }

  const form = await req.formData();
  const answerKey = String(form.get("answerKey") ?? "").trim().slice(0, 5000);
  const files = form.getAll("images").filter((f): f is File => f instanceof File);

  if (files.length < 1 || files.length > MAX_IMAGES) {
    return Response.json({ error: "invalid_image_count" }, { status: 400 });
  }

  const images = [];
  for (const file of files) {
    if (!MEDIA_TYPES.includes(file.type) || file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "invalid_image" }, { status: 400 });
    }
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    images.push({ type: "image_url", image_url: { url: `data:${file.type};base64,${data}` } });
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      ...(REASONING_EFFORT && { reasoning_effort: REASONING_EFFORT }),
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_grading" } },
      messages: [{ role: "user", content: [...images, { type: "text", text: buildPrompt(answerKey) }] }],
    }),
  });

  if (!res.ok) {
    console.error("llm_error", res.status, (await res.text()).slice(0, 500));
    return Response.json({ error: "llm_error" }, { status: 502 });
  }

  const parsed = resultSchema.safeParse(extractArguments(await res.json()));
  if (!parsed.success) {
    return Response.json({ error: "invalid_model_output" }, { status: 502 });
  }

  const questions = parsed.data.questions.map((q) => ({
    ...q,
    studentAnswer: q.illegible ? "" : q.studentAnswer,
    review: q.review || q.illegible,
  }));
  const totalScore = questions.reduce((sum, q) => sum + q.suggestedScore, 0);

  return Response.json({ questions, totalScore });
}
