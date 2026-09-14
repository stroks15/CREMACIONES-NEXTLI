import { NextResponse } from 'next/server'
export const runtime='nodejs'
export async function POST(req:Request){
 try{
  const {prompt,context}=await req.json()
  const key=process.env.OPENAI_API_KEY
  if(!key)return NextResponse.json({error:'OPENAI_API_KEY no configurada en Production'}, {status:500})
  const system=`Eres el copiloto de edición de NEXTLI. Devuelve SOLO JSON válido, sin markdown:
{"message":"explicación breve","operations":[{"type":"text|style|image","selector":"selector CSS existente","value":"valor","property":"backgroundColor|color|transform|display"}]}
Nunca inventes selectores: usa únicamente los presentes en CONTEXTO. Para solicitudes que no puedan aplicarse directamente, operations=[] y explica por qué. No modifiques contenido médico ni inventes precios.
CONTEXTO: ${JSON.stringify(context||{})}`
  const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'system',content:system},{role:'user',content:String(prompt||'')}],temperature:.2,max_tokens:700})})
  const j=await r.json();if(!r.ok)return NextResponse.json({error:j?.error?.message||'OpenAI error'},{status:502})
  const raw=j?.choices?.[0]?.message?.content||'{}';let proposal
  try{proposal=JSON.parse(raw.replace(/^\`\`\`json\s*/,'').replace(/\s*\`\`\`$/,''))}catch{proposal={message:raw,operations:[]}}
  return NextResponse.json(proposal)
 }catch(e){return NextResponse.json({error:'Error del asistente IA'},{status:500})}
}