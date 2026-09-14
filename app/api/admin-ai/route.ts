import { NextResponse } from 'next/server'
export const runtime='nodejs'
export async function POST(req:Request){
 try{
  const {prompt,context}=await req.json()
  const key=process.env.OPENAI_API_KEY
  if(!key)return NextResponse.json({error:'OPENAI_API_KEY no configurada'}, {status:500})
  const system=`Eres el copiloto del panel administrativo de NEXTLI. Ayudas a modificar una web de cremación de mascotas con lenguaje cálido, profesional y respetuoso. No inventes datos. Propón cambios concretos y seguros. Puedes sugerir texto, selectores CSS, precios, descripciones, estructura de botones y ajustes visuales. Devuelve una propuesta clara que el administrador pueda aplicar manualmente desde el panel. Contexto actual: ${JSON.stringify(context||{})}`
  const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'system',content:system},{role:'user',content:String(prompt||'')}],temperature:.4,max_tokens:900})})
  const j=await r.json();if(!r.ok)return NextResponse.json({error:j?.error?.message||'OpenAI error'},{status:502})
  return NextResponse.json({message:j?.choices?.[0]?.message?.content||''})
 }catch(e){return NextResponse.json({error:'Error del asistente IA'},{status:500})}
}