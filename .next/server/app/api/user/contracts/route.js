(()=>{var e={};e.id=7101,e.ids=[7101],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{"use strict";e.exports=require("assert")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},35240:e=>{"use strict";e.exports=require("https")},98216:e=>{"use strict";e.exports=require("net")},19801:e=>{"use strict";e.exports=require("os")},55315:e=>{"use strict";e.exports=require("path")},86624:e=>{"use strict";e.exports=require("querystring")},76162:e=>{"use strict";e.exports=require("stream")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},93739:()=>{},87155:(e,r,t)=>{"use strict";t.r(r),t.d(r,{originalPathname:()=>y,patchFetch:()=>h,requestAsyncStorage:()=>w,routeModule:()=>g,serverHooks:()=>R,staticGenerationAsyncStorage:()=>x});var s={};t.r(s),t.d(s,{GET:()=>p,POST:()=>m});var n=t(49303),a=t(88716),o=t(60670),i=t(87070),c=t(75571),u=t(95456),d=t(86923),l=t(75748);async function p(e){try{console.log("\uD83D\uDD0D GET /api/user/contracts - Start");let e=await (0,c.getServerSession)(u.L);if(console.log("Session:",{exists:!!e,userId:e?.user?.id,userIdType:typeof e?.user?.id}),!e?.user?.id)return console.warn("⚠️ No session or user ID"),i.NextResponse.json({error:"Nicht authentifiziert",success:!1,contracts:[]},{status:401});let r="string"==typeof e.user.id?parseInt(e.user.id,10):e.user.id;console.log("\uD83D\uDCCA Querying contracts for user:",r);let t=await (0,d.i6)`
      SELECT
        id,
        address,
        net_rent,
        new_rent,
        monthly_reduction,
        yearly_savings,
        reference_rate,
        contract_date,
        landlord_name,
        landlord_address,
        tenant_name,
        tenant_address,
        created_at
      FROM contracts
      WHERE user_id = ${r}
      ORDER BY created_at DESC
    `;return console.log("✅ Found contracts:",t.rows.length),i.NextResponse.json({success:!0,contracts:t.rows})}catch(e){return console.error("❌ Error fetching contracts:",e),i.NextResponse.json({error:"Fehler beim Laden der Vertr\xe4ge",success:!1,contracts:[],details:e instanceof Error?e.message:"Unknown"},{status:500})}}async function m(e){try{let r=await (0,c.getServerSession)(u.L);if(console.log("\uD83D\uDCDD POST /api/user/contracts - Session:",r?"exists":"missing"),console.log("\uD83D\uDC64 User ID:",r?.user?.id),!r?.user?.id)return console.warn("⚠️ Unauthorized request - no session"),i.NextResponse.json({error:"Nicht authentifiziert"},{status:401});let t=await e.json();console.log("\uD83D\uDCE6 Contract data received:",{address:t.address,netRent:t.netRent,newRent:t.newRent});let s=await (0,l.OP)(parseInt(r.user.id),{address:t.address,netRent:t.netRent,referenceRate:t.referenceRate,contractDate:t.contractDate,landlordName:t.landlordName,landlordAddress:t.landlordAddress,tenantName:t.tenantName,tenantAddress:t.tenantAddress,newRent:t.newRent,monthlyReduction:t.monthlyReduction,yearlySavings:t.yearlySavings});return console.log("✅ Contract created with ID:",s.id),i.NextResponse.json({success:!0,contractId:s.id,contract:s})}catch(e){return console.error("❌ Error creating contract:",e),i.NextResponse.json({error:"Fehler beim Speichern des Vertrags",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let g=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/user/contracts/route",pathname:"/api/user/contracts",filename:"route",bundlePath:"app/api/user/contracts/route"},resolvedPagePath:"D:\\STTH\\2026 KI\\mietcheck\\src\\app\\api\\user\\contracts\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:w,staticGenerationAsyncStorage:x,serverHooks:R}=g,y="/api/user/contracts/route";function h(){return(0,o.patchFetch)({serverHooks:R,staticGenerationAsyncStorage:x})}},53797:(e,r)=>{"use strict";r.Z=function(e){return{id:"credentials",name:"Credentials",type:"credentials",credentials:{},authorize:()=>null,options:e}}},95456:(e,r,t)=>{"use strict";t.d(r,{L:()=>i});var s=t(53797),n=t(42023),a=t.n(n),o=t(86923);let i={providers:[(0,s.Z)({name:"Credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;try{let r=(await (0,o.i6)`
            SELECT id, email, password_hash, name
            FROM users
            WHERE email = ${e.email.toLowerCase().trim()}
          `).rows[0];if(!r||!await a().compare(e.password,r.password_hash))return null;return console.log("✅ Login successful for:",r.email),{id:r.id.toString(),email:r.email,name:r.name}}catch(e){return console.error("❌ Auth error:",e),null}}})],pages:{signIn:"/login",signOut:"/login",error:"/login"},callbacks:{jwt:async({token:e,user:r})=>(r&&(e.id=r.id),e),session:async({session:e,token:r})=>(e.user&&(e.user.id=r.id),e)},session:{strategy:"jwt",maxAge:2592e3},secret:process.env.NEXTAUTH_SECRET}},75748:(e,r,t)=>{"use strict";t.d(r,{OP:()=>o,PR:()=>n,iD:()=>i,r4:()=>a});var s=t(86923);async function n(e){return(await (0,s.i6)`
    SELECT * FROM users WHERE email = ${e} LIMIT 1;
  `).rows[0]||null}async function a(e,r,t){return(await (0,s.i6)`
    INSERT INTO users (email, password_hash, name)
    VALUES (${e}, ${r}, ${t||""})
    RETURNING id, email, name, created_at;
  `).rows[0]}async function o(e,r){return(await (0,s.i6)`
    INSERT INTO contracts (
      user_id, address, net_rent, reference_rate, contract_date,
      landlord_name, landlord_address, tenant_name, tenant_address,
      new_rent, monthly_reduction, yearly_savings
    )
    VALUES (
      ${e}, ${r.address}, ${r.netRent}, ${r.referenceRate},
      ${r.contractDate}, ${r.landlordName||""}, ${r.landlordAddress||""},
      ${r.tenantName||""}, ${r.tenantAddress||""},
      ${r.newRent||null}, ${r.monthlyReduction||null}, ${r.yearlySavings||null}
    )
    RETURNING *;
  `).rows[0]}async function i(e,r){return(await (0,s.i6)`
    SELECT * FROM contracts
    WHERE id = ${e} AND user_id = ${r}
    LIMIT 1;
  `).rows[0]||null}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[8948,1615,5972,6923,5571,2023],()=>t(87155));module.exports=s})();