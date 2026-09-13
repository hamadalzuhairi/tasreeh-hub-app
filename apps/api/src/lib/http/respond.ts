import { NextResponse } from "next/server";
import type { ApiResponse } from "@tasreeh/shared";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export class ApiHttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: { code, message } },
    { status }
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof ApiHttpError) {
    return fail(error.status, error.code, error.message);
  }
  console.error(error);
  return fail(500, "internal_error", "حدث خطأ غير متوقع");
}
