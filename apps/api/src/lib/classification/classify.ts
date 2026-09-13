import { z } from "zod";
import { REQUEST_TYPE_LABELS_AR, type RequestType } from "@tasreeh/shared";

export interface ClassifyInput {
  subject: string;
  body: string;
  userSelectedType: RequestType;
  departments: { id: string; nameAr: string }[];
}

export interface ClassifyResult {
  type: RequestType;
  departmentId: string;
  confidence: number;
  reasoning: string;
}

const resultSchema = z.object({
  type: z.enum(["statement", "inquiry", "interview", "other"]),
  departmentId: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

// Overall budget for classification inside the create-request call, shared across retries.
const TOTAL_BUDGET_MS = 12000;
const ATTEMPT_TIMEOUT_MS = 6000;
// Gemini Flash intermittently answers 503 "high demand" / 429; those are worth another try.
const RETRYABLE_STATUS = new Set([429, 500, 503]);
// gemini-2.5-flash is closed to new API keys; the "latest" alias tracks the current Flash model.
const DEFAULT_MODEL = "gemini-flash-latest";
const BACKUP_MODEL = "gemini-3.6-flash";

function buildSystemPrompt(departments: ClassifyInput["departments"]) {
  const departmentList = departments.map((d) => `- ${d.id}: ${d.nameAr}`).join("\n");
  const typeList = Object.entries(REQUEST_TYPE_LABELS_AR)
    .map(([key, label]) => `- ${key}: ${label}`)
    .join("\n");

  return `أنت مساعد توجيه لبوابة "تصريح" التي تنظّم طلبات الإعلاميين الموجهة للمتحدثين الرسميين في الجهات الحكومية السعودية.
مهمتك: قراءة موضوع الطلب ونصه، ثم تحديد نوع الطلب والجهة الحكومية الأنسب للرد عليه من القوائم التالية.

أنواع الطلبات المتاحة:
${typeList}

الجهات المتاحة (استخدم المعرف id وليس الاسم في الإجابة):
${departmentList}

أجب حصراً بكائن JSON صالح بدون أي نص إضافي، بالشكل التالي:
{"type": "...", "departmentId": "...", "confidence": 0.0, "reasoning": "..."}`;
}

type AttemptOutcome = { kind: "ok"; text: string } | { kind: "retryable" } | { kind: "failed" };

async function callGemini(model: string, apiKey: string, payload: string, timeoutMs: number): Promise<AttemptOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: payload,
    });
    if (!res.ok) {
      console.error("classification_failed", model, res.status);
      return RETRYABLE_STATUS.has(res.status) ? { kind: "retryable" } : { kind: "failed" };
    }
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("");
    return text ? { kind: "ok", text } : { kind: "failed" };
  } catch (error) {
    // A timeout or network blip is also worth trying again with the remaining budget.
    console.error("classification_failed", model, error instanceof Error ? error.message : error);
    return { kind: "retryable" };
  } finally {
    clearTimeout(timer);
  }
}

export async function classifyRequest(input: ClassifyInput, fallbackDepartmentId: string): Promise<ClassifyResult> {
  const fallback: ClassifyResult = {
    type: input.userSelectedType,
    departmentId: fallbackDepartmentId,
    confidence: 0,
    reasoning: "تعذر تشغيل التصنيف الآلي، تم التوجيه افتراضياً",
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: buildSystemPrompt(input.departments) }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `الموضوع: ${input.subject}\n\nالنص: ${input.body}\n\nالنوع الذي اختاره المستخدم يدوياً: ${input.userSelectedType}`,
          },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
  });

  const primary = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  // Primary model twice, then the backup model, all within one time budget.
  const attempts = [primary, primary, BACKUP_MODEL].filter((m, i, arr) => i < 2 || m !== arr[0]);
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (const model of attempts) {
    const remaining = deadline - Date.now();
    if (remaining < 1500) break;

    const outcome = await callGemini(model, apiKey, payload, Math.min(ATTEMPT_TIMEOUT_MS, remaining));
    if (outcome.kind === "failed") return fallback;
    if (outcome.kind === "retryable") continue;

    const jsonMatch = outcome.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(jsonMatch[0]);
    } catch {
      return fallback;
    }
    const parsed = resultSchema.safeParse(parsedJson);
    if (!parsed.success) return fallback;

    const validDepartment = input.departments.some((d) => d.id === parsed.data.departmentId);
    return validDepartment ? parsed.data : { ...parsed.data, departmentId: fallbackDepartmentId };
  }

  return fallback;
}
