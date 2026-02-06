"use strict";(()=>{var e={};e.id=3,e.ids=[3],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},45881:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>h,requestAsyncStorage:()=>u,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>p});var n={};r.r(n),r.d(n,{POST:()=>c});var a=r(49303),s=r(88716),o=r(60670),i=r(87070);async function l(e){let t=process.env.GEMINI_API_KEY;if(!t)throw Error("GEMINI_API_KEY nicht konfiguriert");console.log("\uD83E\uDD16 Analyzing contract with Gemini 2.5 Flash...");let r=`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${t}`,n=`Analysiere diesen Schweizer Mietvertrag und extrahiere folgende Informationen im JSON-Format:

MIETVERTRAG TEXT:
${e}

Extrahiere:
1. address: Vollst\xe4ndige Adresse der Mietwohnung (Strasse, PLZ, Ort)
2. netRent: Nettomiete in CHF (nur die Zahl, ohne CHF)
3. referenceRate: Referenzzinssatz in Prozent (z.B. 1.25 f\xfcr 1.25%)
4. contractDate: Vertragsdatum im Format YYYY-MM-DD
5. landlordName: Name des Vermieters / der Verwaltung
6. landlordAddress: Vollst\xe4ndige Adresse des Vermieters (Strasse, PLZ, Ort)

Antworte NUR mit einem JSON-Objekt, keine zus\xe4tzlichen Erkl\xe4rungen:

{
  "address": "Strasse Nr, PLZ Ort",
  "netRent": 0,
  "referenceRate": 0,
  "contractDate": "YYYY-MM-DD",
  "landlordName": "Name",
  "landlordAddress": "Strasse Nr, PLZ Ort"
}`,a=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}],generationConfig:{temperature:.2,maxOutputTokens:2048}})});if(!a.ok){let e=await a.text();throw Error(`Gemini API Error ${a.status}: ${e}`)}let s=await a.json(),o=s.candidates?.[0]?.content?.parts?.[0]?.text;if(!o)throw Error("Keine Antwort von Gemini erhalten");console.log("\uD83D\uDCE5 Gemini response:",o.substring(0,200));let i=o.trim();i.startsWith("```json")?i=i.replace(/```json\n?/g,"").replace(/```\n?/g,""):i.startsWith("```")&&(i=i.replace(/```\n?/g,""));let l=JSON.parse(i),c={address:l.address||"",netRent:parseFloat(l.netRent)||0,referenceRate:parseFloat(l.referenceRate)||0,contractDate:l.contractDate||"",landlordName:l.landlordName||"",landlordAddress:l.landlordAddress||""};return console.log("✅ Contract analysis complete:",c),c}async function c(e){try{let{extractedText:t}=await e.json();if(!t||t.length<50)return i.NextResponse.json({success:!1,error:"Text zu kurz f\xfcr Analyse"},{status:400});console.log("\uD83D\uDCDD Starting contract analysis..."),console.log("\uD83D\uDCC4 Text length:",t.length);let r=await l(t);return console.log("✅ Analysis complete:",{address:r.address,netRent:r.netRent}),i.NextResponse.json({success:!0,data:r})}catch(e){return console.error("❌ Analysis error:",e),i.NextResponse.json({success:!1,error:e.message||"Analyse fehlgeschlagen"},{status:500})}}let d=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/analyze-contract/route",pathname:"/api/analyze-contract",filename:"route",bundlePath:"app/api/analyze-contract/route"},resolvedPagePath:"D:\\STTH\\2026 KI\\mietcheck\\src\\app\\api\\analyze-contract\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:u,staticGenerationAsyncStorage:p,serverHooks:g}=d,m="/api/analyze-contract/route";function h(){return(0,o.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:p})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[948,972],()=>r(45881));module.exports=n})();