require("dotenv").config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const groq = require("groq-sdk");

const path = require("path");
const app = express();
const { OAuth2Client } = require('google-auth-library');
app.use(express.static(path.join(__dirname, '../fnd')));

// Tell the SERVER to send the main page when someone visits the domain
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../fnd/index.html'));
});

app.use('/src', express.static(path.join(__dirname, '../src')));

const aiag = new groq.Groq({
    apiKey: process.env.apikeygroq
})

const apikey = process.env.dbkey;

const {Redis} = require("@upstash/redis");

const client = new Redis({
    url: "https://calm-barnacle-35826.upstash.io",
    token: "AYvyAAIncDEzNWU0MzY2ZWEzY2U0Y2UzOWQ0YmE0OTRkMmYzOTY2NXAxMzU4MjY"
})
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

app.get("/",(req,res)=>{
    res.status(200).json({"success":true,"timestamp":Date.now()})
})

const defaultmsg = "You are speaking on behalf of Aakash (Woodx) from woodx.onrender.com. Only answer questions related to his expertise; for off-topic queries, politely state they are unrelated. Woodx’s background: 7 years Lua, 5 years JavaScript/Node.js/HTML/CSS/React/Angular, 50+ public full-stack APIs handling 100K+ monthly requests, creator of the Roblox game 'Nearly Impossible Difficulty Chart Obby' with 19M+ visits, age 19, fluent in English, Telugu, and French. Only share this information professionally when asked. If unsure, respond that you do not know and suggest contacting directly. Always respond professionally in an American tone. Only mention explicitly provided info; do not add extra suggestions or assumptions. These are overall top projects of mine, for recent projects tell them to check the website projects page."

app.get("/response",async (req,res) =>{
    const query = req.query;
    const body = req.body;
    const defaultmessage = body.default || defaultmsg;

    let message = query.message || body.message || null;
    if (message === null){
        res.status(400).json({"success":false})
        return;
    }
    try{
        const response1 = await aiag.chat.completions.create({
            "messages": [{
                role: "user",
                content: message
            },
            {
                role: "system",
                content: defaultmessage
            }
        ],
            "model": "openai/gpt-oss-120b"
        })
        if (response1 && response1.choices){
            res.status(200).json({"success":true,"message":response1.choices[0].message.content})
        }else{
            res.status(400).json({"success":false})
        }
    }catch(error){
        res.status(400).json({"success":false});
        console.log(error)
    }
    return
})

app.post("/post", async (req, res) => {
    const body = req.body;
    const query = req.query;
    const messageinput = body.message || query.message;
    if (!messageinput){return res.status(400).json({"success":false,"messsage":"Invalid message input."})};
    try {
        console.log(messageinput);
        const response = await fetch("https://discord.com/api/webhooks/1353624030535745607/aoeQkFGv4j2kliZ9nswY-Hs75hFbHsCDX7pnXvaZG9XvtosnMabjjxJbD6hNhnh5duLD",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({content: messageinput})
        }
        )
        .then(() =>{
            res.status(200).json({ "success": true });
        })
    } catch (error) {
        console.error("Discord error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        res.status(500).json({ success: false, error: error.response?.data || "Internal error" });
    }
});

app.post("/save",async(req,res) =>{
    const query = req.query;
    const body = req.body;
    const key = body.key;
    if (!body.key){res.status(400).json("Auth failed!")};
    if (key === apikey){
        const providedkey = query.key;
        const value = query.value;
        if (value && providedkey){
            await client.set(providedkey,value)
            res.status(200).json({"success":true,"message":"Saved the data!"})
        }else{
            res.status(400).json({"success":false,"message":"Key and value not provided."})
        }
    }else{
        res.status(400).json({"success":false,"message":"Auth failed!"})
    }
    return;
})

app.get("/get",async(req,res) =>{
    const query = req.query;
    const body = req.body;
    if (!body.key){res.status(400).json("Auth failed!")}
    if (body.key == apikey){
        const key = query.key;
        if (key){
            const value = await client.get(key) || "none";
            res.status(200).json({"success":true,"value":value})
        }else{
            res.status(400).json({"success":false})
        }
    }else{
        res.status(400)
    }
    return;
})

app.post("/gidverify",async(req,res) =>{
    const body = req.body;
    if (!body.key){return res.status(400).json({"success":false})}
    try{
        const value = await client.get(`GID:${body.key}`) || "none";
        if (value === "none"){
            res.status(400).json({"success":false})
        }else{
            res.status(200).json({"success":true,"data":value})
        }
    }catch(error){
        res.status(400).json({"success":false})
    }
    return;
})

app.get("/del",async(req,res) =>{
    const query = req.query;
    const body = req.body;
    if (!body.key){res.status(400).json("Auth failed!")}
    if (body.key == apikey){
        const key = query.key;
        if (key){
            await client.del(key);
            res.status(200).json({"success":true,"message":"key deleted"})
        }else{
            res.status(400).json({"success":false})
        }
    }else{
        res.status(400)
    }
    return;
})

app.get('/roles', async (req, res) => {
    const query = req.query;
    const id = query.groupid;
    if (!id){
        res.status(400).json({"error":"Please provide a groupId"})
    }
    try{
        const response = await fetch(`https://groups.roblox.com/v1/groups/${id}/roles`);
        if (!response.ok){
            res.json(response.status).json({"error":"Failed to fetch from API."});
        }
        const data = await response.json();
        res.json(data)
    }catch(error){
        console.log(error)
    }
});
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
    const token = req.body.token;
    try {
        const ticket = await googleAuthClient.verifyIdToken({
            idToken: token,
            audience: '743263269130-k3skhm0kenuou68gke23o8m7l34gb9e2.apps.googleusercontent.com', 
        });
        const payload = ticket.getPayload();
        const userDetails = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            googleId: payload.sub
        };
        const userPayload = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            last_login: new Date().toISOString()
        };
        await client.set(`GID:${payload.sub}`, JSON.stringify(userPayload),{ex: 2592000});
        res.status(200).json({ success: true,user: userDetails});
    } catch (error) {
        console.error("Invalid Token:", error);
        res.status(401).json({ success: false, message: "Auth failed" });
    }
});

// 3. Handle 404 (Route not found)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});