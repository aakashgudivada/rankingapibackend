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

document.addEventListener("DOMContentLoaded",function(){
    fetch("https://rankingapibackend.onrender.com/")
    .then((data) =>{
        return data.json()
    })
    .then((data) => {
        if (data.success === true){
            console.log("Loaded website successfully!")
        }
    })
    const sidebarbutton = document.getElementById("sidebar");
    let toggled = false;

    const prompt = document.querySelector(".prompt");
    const promptinput = prompt.querySelector("input");
    const promptButton = prompt.querySelector("img");

    promptButton.addEventListener("click",async function(event){
        console.log("uh")
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