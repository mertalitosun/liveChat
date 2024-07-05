const toggleButton = document.getElementById('toggle-chat');
const chatBody = document.querySelector('.chat-body');
const chatWidget = document.querySelector('.chat-widget');
const chatHeader = document.querySelector('.chat-header');
const head = document.querySelector(".chat-header h6")
const scrollBottom = document.querySelector(".scroll-bottom");
const messages = document.getElementById("messages");

messages.addEventListener("scroll",()=>{
    let isScrollBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
   if(!isScrollBottom){
    scrollBottom.style.display = "block"
    scrollBottom.addEventListener("click",()=>{
        messages.scrollTo({
            top:messages.scrollHeight - messages.clientHeight,
            behavior: "smooth"
        }) 
    })
   }else{
    scrollBottom.style.display = "none" 
   }
})

chatWidget.style.height = "50px";
chatWidget.style.width = "150px";

toggleButton.addEventListener('click', () => {
   
    if (chatWidget.style.height === "50px") {
        chatWidget.style.height = "450px";
        chatWidget.style.width = "350px";
        chatHeader.style.borderRadius = "0px";
        head.style.margin = "0px"
        
        setTimeout(()=>{chatBody.style.display = "block"},100)
        
    } else {
        chatWidget.style.height = "50px";
        chatBody.style.display = "none";
        chatWidget.style.width = "150px";
        chatHeader.style.borderRadius = "50px";
        head.style.marginLeft = "auto"
        head.style.marginRight = "auto"
    }
});



  