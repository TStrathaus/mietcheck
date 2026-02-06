(()=>{var e={};e.id=9541,e.ids=[9541],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{"use strict";e.exports=require("assert")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},35240:e=>{"use strict";e.exports=require("https")},98216:e=>{"use strict";e.exports=require("net")},19801:e=>{"use strict";e.exports=require("os")},55315:e=>{"use strict";e.exports=require("path")},86624:e=>{"use strict";e.exports=require("querystring")},76162:e=>{"use strict";e.exports=require("stream")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},93739:()=>{},9031:(e,r,t)=>{"use strict";t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>h,requestAsyncStorage:()=>m,routeModule:()=>p,serverHooks:()=>w,staticGenerationAsyncStorage:()=>x});var s={};t.r(s),t.d(s,{GET:()=>d});var n=t(49303),a=t(88716),i=t(60670),o=t(87070),u=t(75571),c=t(95456),l=t(75748);async function d(e,{params:r}){try{let e=await (0,u.getServerSession)(c.L);if(!e?.user?.email)return o.NextResponse.json({error:"Unauthorized"},{status:401});let t=await (0,l.PR)(e.user.email);if(!t)return o.NextResponse.json({error:"User not found"},{status:404});let s=parseInt(r.id),n=await (0,l.iD)(s,t.id);if(!n)return o.NextResponse.json({error:"Contract not found"},{status:404});return o.NextResponse.json({success:!0,contract:n})}catch(e){return console.error("❌ Get contract error:",e),o.NextResponse.json({error:"Failed to fetch contract: "+e.message},{status:500})}}let p=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/user/contracts/[id]/route",pathname:"/api/user/contracts/[id]",filename:"route",bundlePath:"app/api/user/contracts/[id]/route"},resolvedPagePath:"D:\\STTH\\2026 KI\\mietcheck\\src\\app\\api\\user\\contracts\\[id]\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:m,staticGenerationAsyncStorage:x,serverHooks:w}=p,g="/api/user/contracts/[id]/route";function h(){return(0,i.patchFetch)({serverHooks:w,staticGenerationAsyncStorage:x})}},53797:(e,r)=>{"use strict";r.Z=function(e){return{id:"credentials",name:"Credentials",type:"credentials",credentials:{},authorize:()=>null,options:e}}},95456:(e,r,t)=>{"use strict";t.d(r,{L:()=>o});var s=t(53797),n=t(42023),a=t.n(n),i=t(86923);let o={providers:[(0,s.Z)({name:"Credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;try{let r=(await (0,i.i6)`
            SELECT id, email, password_hash, name
            FROM users
            WHERE email = ${e.email.toLowerCase().trim()}
          `).rows[0];if(!r||!await a().compare(e.password,r.password_hash))return null;return console.log("✅ Login successful for:",r.email),{id:r.id.toString(),email:r.email,name:r.name}}catch(e){return console.error("❌ Auth error:",e),null}}})],pages:{signIn:"/login",signOut:"/login",error:"/login"},callbacks:{jwt:async({token:e,user:r})=>(r&&(e.id=r.id),e),session:async({session:e,token:r})=>(e.user&&(e.user.id=r.id),e)},session:{strategy:"jwt",maxAge:2592e3},secret:process.env.NEXTAUTH_SECRET}},75748:(e,r,t)=>{"use strict";t.d(r,{OP:()=>i,PR:()=>n,iD:()=>o,r4:()=>a});var s=t(86923);async function n(e){return(await (0,s.i6)`
    SELECT * FROM users WHERE email = ${e} LIMIT 1;
  `).rows[0]||null}async function a(e,r,t){return(await (0,s.i6)`
    INSERT INTO users (email, password_hash, name)
    VALUES (${e}, ${r}, ${t||""})
    RETURNING id, email, name, created_at;
  `).rows[0]}async function i(e,r){return(await (0,s.i6)`
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
  `).rows[0]}async function o(e,r){return(await (0,s.i6)`
    SELECT * FROM contracts
    WHERE id = ${e} AND user_id = ${r}
    LIMIT 1;
  `).rows[0]||null}}};var r=require("../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[8948,1615,5972,6923,5571,2023],()=>t(9031));module.exports=s})();