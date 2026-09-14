import { NextResponse } from 'next/server'
export const runtime='nodejs'
export async function POST(req:Request){
 try{
  const {html,token}=await req.json()
  const expected=process.env.NEXTLI_CMS_SAVE_TOKEN
  if(!expected || !token || token!==expected) return NextResponse.json({error:'No autorizado'},{status:401})
  if(typeof html!=='string' || html.length<500) return NextResponse.json({error:'HTML inválido'},{status:400})
  if(html.includes('id="cms-panel-herramientas"')) return NextResponse.json({error:'El panel CMS no puede guardarse en el sitio público'},{status:400})
  const gh=process.env.GITHUB_TOKEN
  const owner=process.env.GITHUB_OWNER||'stroks15'
  const repository=process.env.GITHUB_REPO||'CREMACIONES-NEXTLI'
  if(!gh)return NextResponse.json({error:'Falta GITHUB_TOKEN en Vercel Production'},{status:500})
  const api='https://api.github.com/repos/'+owner+'/'+repository+'/contents/public/site.html'
  const headers={Authorization:'Bearer '+gh,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'}
  const current=await fetch(api,{headers})
  const cj=await current.json()
  if(!current.ok)return NextResponse.json({error:'GitHub: '+(cj.message||'no se pudo leer el archivo')},{status:502})
  const bytes=new TextEncoder().encode(html);let binary='';bytes.forEach(b=>binary+=String.fromCharCode(b));const encoded=btoa(binary)
  const message='cms: actualizar NEXTLI desde panel privado'
  const update=await fetch(api,{method:'PUT',headers,body:JSON.stringify({message,content:encoded,sha:cj.sha,branch:'main'})})
  const uj=await update.json()
  if(!update.ok)return NextResponse.json({error:'GitHub: '+(uj.message||'no se pudo guardar')},{status:502})
  return NextResponse.json({ok:true,commit:uj.commit?.sha||null,url:uj.content?.html_url||null})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Error al guardar'},{status:500})}
}