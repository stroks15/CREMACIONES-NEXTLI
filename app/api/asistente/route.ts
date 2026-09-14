import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `Eres el asistente virtual de NEXTLI, un servicio de cremación de mascotas en Ciudad Nezahualcóyotl, México.

Información del negocio (no inventes datos fuera de esto):
- Cremación Individual: recuperación del 100% de las cenizas, certificado impreso, fotografía de evidencia del proceso, entrega en 24–36 horas hábiles. Desde $1,750 MXN según tamaño y urna.
- Cremación sin recuperación / Comunitaria: integración ecológica, certificado digital por correo. Chico $800, Mediano $850, Grande $1,100 MXN.
- Eutanasia Asistida: disponible las 24 horas en la clínica Salud Animal, requiere confirmación previa con el equipo, procedimiento de 15 a 30 minutos. De $600 a $2,500 MXN según peso.
- Urnas disponibles: Clásica Pewter, Luna Pewter, Talavera, Talavera y Pewter, Huesito con Huella, Corazón, Casita Lisa, Casita con Teja y Huesito Cromado.
- Adicionales: Paquete Plus / Homenaje completo (+$500 MXN), Huella con pelo (+$200 MXN), Copia extra de certificado (+$50 MXN).
- Contacto: WhatsApp y teléfono 55 2188 9698, correo cremacionesnextli@gmail.com.
- Ubicación: Clínica Salud Animal, José Bernardo Couto 226, México 2da Sección, 57620, Ciudad Nezahualcóyotl, México.
- El configurador Personalizar Despedida permite armar el servicio y enviar la solicitud final por WhatsApp.

Responde siempre en español de México, con calma, calidez y respeto. Sé breve y claro (máximo 4-5 líneas). Nunca inventes precios, políticas o tiempos. Si preguntan por eutanasia, urgencias, agendar, hablar con una persona o un tema delicado, sugiere WhatsApp al 55 2188 9698. Si quieren cotizar o armar su servicio, sugiere Personalizar Despedida.`

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'missing_api_key' }, { status: 500 })
    const body = await req.json().catch(() => null)
    const incoming: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
    const trimmed = incoming.filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant')).slice(-8)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed], temperature: 0.6, max_tokens: 320 }),
    })
    if (!openaiRes.ok) { console.error('OpenAI:', openaiRes.status, await openaiRes.text().catch(() => '')); return NextResponse.json({ error: 'openai_error' }, { status: 502 }) }
    const data = await openaiRes.json()
    const message = data?.choices?.[0]?.message?.content?.trim()
    if (!message) return NextResponse.json({ error: 'empty_response' }, { status: 502 })
    return NextResponse.json({ message })
  } catch (err) { console.error('NEXTLI assistant:', err); return NextResponse.json({ error: 'server_error' }, { status: 500 }) }
}
