const defaultPrompt = ""
function getResponse(prompt){
    if (prompt){
        try{
            // const response = await fetch("")
        }catch(error){
            console.log(error)
        }
    }
    return;
}

const classes = ["widgets"];
const elementsData = {
    "htitle": {"Type":"h1","UE":"None"},
    "utitle": {"Type":"p","UE":"None"},
    "nbutton": {"Type":"button","UE":"None"},
    "widgets": {"Type":"section","UE":"None"},
    "widget-img": {"Type":"img","UE":"widgets"},
    "widget": {"Type":"section","UE":"widgets"},
    "widget-p": {"Type":"p","UE":"widget"},
    "widget-h": {"Type":"h3","UE":"widget"},
    "tags": {"Type":"ul","UE":"None"},
    "time": {"Type":"p","UE":"tags"},
    "genre": {"Type":"p","UE":"tags"},
    "title": {"Type":"h1","UE":"None"},
    "desc": {"Type":"p","UE":"None"},
    "cc": {"Type":"a","UE":"None"},
    "uc": {"Type":"h2","UE":"None"},
    "gap": {"Type":"li","UE":"None"},
    "subtitle": {"Type":"p","UE":"None"}
};
const app = document.querySelector(".app");
const signinbutton = document.getElementById("login");
const profilepicture = document.getElementById("pp");

function render(dictelements){
    if (dictelements){
        const map = {};
        dictelements.forEach((item) =>{
            const config = elementsData[item["type"]]
            if (!config) return;
            const el = document.createElement(config.Type);
            el.id = item.type || "";
            if (item.content) el.textContent = item.content;
            if (item.src) el.src = item.src;
            if (item.href) el.href = item.href;
            if (item.alt) el.alt = item.alt;
            map[item.Type] = el;
            if (config.UE === "None"){
                app.appendChild(el);
            }else{
                const parent = map[config.UE];
                parent.appendChild(el)
            }
        })
    }
}
render([
    {
        "type": "htitle",
        "content": "Hi, I'm an Artificial Intelligence & Game Developer."
    },
    {
        "type": "utitle",
        "content": "You can explore my popular services, projects and open-source publications here! Please do not republish or repost as their as subjective to copyright and patent reserved."
    },
    {
        "type": "title",
        "content": "You can exido notght and patent reserved."
    },
    {
        "type": "desc",
        "content": "You can explore my popular services, projects and open-source publications here! Please do not republish or repost as their as subjective to copyright and patent reserved."
    }
])

async function loginsignin(response){
    console.log(response)
    const token = response.credential;
    try {
        const result = await fetch("/auth/google",{
            method: "POST",
            headers: {'Content-Type': "application/json"},
            body: JSON.stringify({'token':token})
        })
        var data = await result.json();
        if (data.success) {
            data = data.user;
            console.log(data);
            document.cookie = `gid=${data.googleId}; path=/; max-age=2592000; SameSite=Strict`;
            signinbutton.textContent = data.name;
            profilepicture.src = data.picture;
            //  window.location.reload();
        }
    }catch(error){
        console.log(error)
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    console.log(document.cookie)
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function promptsignin(){
    google.accounts.id.initialize({
        client_id: "743263269130-k3skhm0kenuou68gke23o8m7l34gb9e2.apps.googleusercontent.com",
        callback: loginsignin,
        use_fedcm_for_prompt: true
    })
    return;
}

async function getData(googleid) {
    if (!googleid) return;
    try {
        const response = await fetch("https://rankingapibackend.onrender.com/gidverify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: googleid })
        });
        const apiResult = await response.json();
        if (apiResult.success) {
            const userData = JSON.parse(apiResult.value); 
            signinbutton.textContent = userData.name;
            profilepicture.src = userData.picture;
        }
    } catch (error) {
        console.error("Failed to fetch user data:", error);
    }
}

document.addEventListener("DOMContentLoaded",function(){
    const sidebarbutton = document.getElementById("sidebar");
    let toggled = false;
    const prompt = document.querySelector(".prompt");
    const promptinput = prompt.querySelector("input");
    const promptButton = prompt.querySelector("img");
    promptsignin();
    signinbutton.addEventListener("click",function(event){
        event.preventDefault();
        if (signinbutton.textContent !== "Log in"){return}
        google.accounts.id.prompt((notification) =>{
            if (notification.isNotDisplayed()){
                console.log("One tap disabled, try another method for login.");
                alert("Login feature is currently disabled for security.")
            }
        })
        return;
    })

    const gid = getCookie("gid");
    console.log(gid);
    promptButton.addEventListener("click",async function(event){
        event.preventDefault();
        const usermessage = promptinput.value;
        const request = await groq.chat.completions.create({
            "messages": [
              {
                "role": "user",
                "content": usermessage
              }
            ],
            "model": "openai/gpt-oss-120b",
            "temperature": 1,
            "max_completion_tokens": 8192,
            "top_p": 1,
            "stream": true,
            "reasoning_effort": "medium",
            "stop": null
          });
          console.log(request)
    })

    sidebarbutton.addEventListener('click', function() {
        toggled = !toggled;
        document.querySelector('.selection').classList.toggle('open');
        document.querySelector(".app").classList.toggle("focus");
        prompt.classList.toggle("focus")
        if (toggled){
            sidebarbutton.src = "src/imgs/sidebar2.png"
        }else{
            sidebarbutton.src = "src/imgs/sidebar.png"
        }
        return;
    });
})