import { NextResponse } from "next/server";

const API_URL = "http://212.227.251.228/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { response: "Error de conexión con el servidor. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
