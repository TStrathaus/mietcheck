(()=>{var e={};e.id=310,e.ids=[310],e.modules={20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},61282:e=>{"use strict";e.exports=require("child_process")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},35240:e=>{"use strict";e.exports=require("https")},98216:e=>{"use strict";e.exports=require("net")},19801:e=>{"use strict";e.exports=require("os")},55315:e=>{"use strict";e.exports=require("path")},76162:e=>{"use strict";e.exports=require("stream")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},93739:()=>{},48612:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>x,requestAsyncStorage:()=>m,routeModule:()=>_,serverHooks:()=>T,staticGenerationAsyncStorage:()=>E});var s={};r.r(s),r.d(s,{POST:()=>l});var i=r(49303),o=r(88716),a=r(60670),n=r(87070),c=r(39256),p=r(86923);let u=new c.Z(process.env.STRIPE_SECRET_KEY||"",{apiVersion:"2025-02-24.acacia"}),d=process.env.STRIPE_WEBHOOK_SECRET||"";async function l(e){let t;let r=await e.text(),s=e.headers.get("stripe-signature")||"";try{t=u.webhooks.constructEvent(r,s,d)}catch(e){return console.error("❌ Webhook signature verification failed:",e.message),n.NextResponse.json({error:`Webhook Error: ${e.message}`},{status:400})}switch(t.type){case"checkout.session.completed":{let e=t.data.object;console.log("✅ Payment successful:",e.id);try{await (0,p.i6)`
          UPDATE transactions
          SET status = 'completed',
              stripe_session_id = ${e.id},
              paid_at = CURRENT_TIMESTAMP
          WHERE stripe_session_id = ${e.id}
        `;let t=e.metadata||{};if(t.email){let r=await (0,p.i6)`
            SELECT id FROM users WHERE email = ${t.email} LIMIT 1
          `;if(r.rows.length>0){let s=r.rows[0].id;await (0,p.i6)`
              INSERT INTO transactions (
                user_id,
                service_type,
                amount,
                stripe_session_id,
                status,
                paid_at,
                metadata
              )
              VALUES (
                ${s},
                ${t.service||"generate"},
                ${(e.amount_total||5e3)/100},
                ${e.id},
                'completed',
                CURRENT_TIMESTAMP,
                ${JSON.stringify(t)}
              )
              ON CONFLICT (stripe_session_id) DO UPDATE SET
                status = 'completed',
                paid_at = CURRENT_TIMESTAMP
            `}}console.log("✅ Transaction recorded for session:",e.id)}catch(e){console.error("❌ Database error:",e)}break}case"checkout.session.expired":{let e=t.data.object;console.log("⏰ Checkout session expired:",e.id);try{await (0,p.i6)`
          UPDATE transactions
          SET status = 'expired'
          WHERE stripe_session_id = ${e.id}
        `}catch(e){console.error("❌ Database error:",e)}break}case"payment_intent.payment_failed":{let e=t.data.object;console.log("❌ Payment failed:",e.id),console.log("Failure reason:",e.last_payment_error?.message);try{await (0,p.i6)`
          INSERT INTO payment_failures (
            stripe_payment_intent_id,
            error_message,
            created_at
          )
          VALUES (
            ${e.id},
            ${e.last_payment_error?.message||"Unknown error"},
            CURRENT_TIMESTAMP
          )
        `}catch(e){console.log("Note: payment_failures table not found")}break}default:console.log(`Unhandled event type: ${t.type}`)}return n.NextResponse.json({received:!0})}let _=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/webhook/stripe/route",pathname:"/api/webhook/stripe",filename:"route",bundlePath:"app/api/webhook/stripe/route"},resolvedPagePath:"D:\\STTH\\2026 KI\\mietcheck\\src\\app\\api\\webhook\\stripe\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:m,staticGenerationAsyncStorage:E,serverHooks:T}=_,h="/api/webhook/stripe/route";function x(){return(0,a.patchFetch)({serverHooks:T,staticGenerationAsyncStorage:E})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[948,972,923,256],()=>r(48612));module.exports=s})();