
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleAuth } from "npm:google-auth-library"

serve(async (req) => {
  try {
    const { record, table, type } = await req.json()
    
    // 1. Initialize Supabase Client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // 2. Get all FCM tokens from profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('fcm_token')
      .not('fcm_token', 'is', null)

    if (profileError) throw profileError
    const tokens = profiles.map(p => p.fcm_token).filter(t => !!t)

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No tokens found" }), { status: 200 })
    }

    // 3. Prepare Notification Content
    let title = "تنبيه جديد"
    let body = "تم إضافة محتوى جديد في المنصة"

    if (table === 'lessons') {
      title = "درس جديد متاح!"
      body = `تم إضافة درس جديد: ${record.title || record.name || ''}`
    } else if (table === 'news') {
      title = "خبر جديد"
      body = record.title || "تفقد قسم الأخبار الآن"
    }

    // 4. Authenticate with Google
    const auth = new GoogleAuth({
      credentials: {
        client_email: Deno.env.get("FIREBASE_CLIENT_EMAIL"),
        private_key: Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, '\n'),
        project_id: Deno.env.get("FIREBASE_PROJECT_ID"),
      },
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })
    const client = await auth.getClient()
    const projectId = await auth.getProjectId()
    const accessToken = (await client.getAccessToken()).token

    // 5. Send Notifications
    const sendPromises = tokens.map(token => 
      fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: token,
            notification: { title, body },
            webpush: {
              fcm_options: {
                link: "/" 
              }
            }
          }
        })
      })
    )

    const results = await Promise.all(sendPromises)
    
    return new Response(JSON.stringify({ success: true, count: results.length }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Error in notify-students:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
