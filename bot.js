import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Supabase Connection (Railway ke environment variables se uthayega)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MASTER_GEMINI_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
    const { token, message } = req.body;

    try {
        // 1. Database se check karo ki yeh token kis user ka hai aur uski settings kya hain
        const { data: settings, error } = await supabase
            .from('bot_settings')
            .select('*')
            .eq('token', token)
            .single();

        if (error || !settings) {
            return res.status(403).json({ error: "Invalid Token!" });
        }

        // 2. Check karo ki is specific user ka bot ON hai ya OFF (Global nahi hai)
        if (!settings.is_active) {
            return res.status(200).json({ reply: null }); 
        }

        // 3. Mode aur Auto-Location Inference ke sath Smart System Prompt
        let systemPrompt = `You are a custom AI assistant for a business. 
        Business Details & Address: ${settings.business_info || 'Not provided'}.
        CRITICAL INSTRUCTION FOR LOCATION: If the user provides a local address or landmark (like Giridih) that lacks a state or country, automatically use your internal geographic knowledge to identify the correct state (e.g., Jharkhand) and answer accurately when asked.`;

        if (settings.mode === 'professional') {
            systemPrompt += `\nMODE: PROFESSIONAL. Strictly discuss only business details, products, and services. Politely refuse casual or off-topic chat.`;
        } else {
            systemPrompt += `\nMODE: FRIENDLY. You can engage in casual conversation and friendly chat while remaining helpful.`;
        }

        // 4. Gemini AI ko call karo
        const aiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MASTER_GEMINI_KEY}`,
            {
                contents: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "user", parts: [{ text: message }] }
                ]
            }
        );

        const replyText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Jawab nahi mila.";
        res.json({ reply: replyText });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// Vite/Railway Compatibility: 
// Development mode mein manually run hoga, Production mein Vite app.listen khud handle karega.
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Railway Central Server running on port ${PORT}`));
}

// VITE/NITRO KO YAHI DEFAULT EXPORT CHAHIYE THA
export default app;
