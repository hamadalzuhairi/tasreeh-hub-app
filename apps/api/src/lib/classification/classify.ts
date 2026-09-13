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

const CLASSIFY_TIMEOUT_MS = 8000;

export async function classifyRequest(
  input: ClassifyInput,
  fallbackDepartmentId: string
): Promise<ClassifyResult> {
  const fallback: ClassifyResult = {
    type: input.userSelectedType,
    departmentId: fallbackDepartmentId,
    confidence: 0,
    reasoning: "تعذر تشغيل التصنيف الآلي، تم التوجيه افتراضياً",
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  const departmentList = input.departments.map((d) => `- ${d.id}: ${d.nameAr}`).join("\n");

  const typeList = Object.entries(REQUEST_TYPE_LABELS_AR)
    .map(([key, label]) => `- ${key}: ${label}`)
    .join("\n");

  const systemPrompt = `أنت مساعد توجيه لبوابة "تصريح" التي تنظّم طلبات الإعلاميين الموجهة للمتحدثين الرسميين في الجهات الحكومية السعودية.
مهمتك: قراءة موضوع الطلب ونصه، ثم تحديد نوع الطلب والجهة الحكومية الأنسب للرد عليه من القوائم التالية.

أنواع الطلبات المتاحة:
${typeList}

الجهات المتاحة (استخدم المعرف id وليس الاسم في الإجابة):
${departmentList}

أجب حصراً بكائن JSON صالح بدون أي نص إضافي، بالشكل التالي:
{"type": "...", "departmentId": "...", "confidence": 0.0, "reasoning": "..."}`;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLASSIFY_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
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
      }),
    });

    if (!res.ok) {
      console.error("classification_failed", res.status, await res.text());
      return fallback;
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return fallback;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = resultSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!parsed.success) return fallback;

    const validDepartment = input.departments.some((d) => d.id === parsed.data.departmentId);
    if (!validDepartment) {
      return { ...parsed.data, departmentId: fallbackDepartmentId };
    }

    return parsed.data;
  } catch (error) {
    console.error("classification_failed", error);
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}
