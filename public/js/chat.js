const toggleButton = document.getElementById('toggle-chat');
const chatBody = document.querySelector('.chat-body');
const chatWidget = document.querySelector('.chat-widget');
const chatHeader = document.querySelector('.chat-header');
const head = document.querySelector(".chat-header h6");
const scrollBottom = document.querySelector(".scroll-bottom");
const messages = document.getElementById("messages");


chatWidget.style.height = "50px";
chatWidget.style.width = "150px";
chatHeader.style.borderRadius = "50px";
head.style.marginLeft = "auto";
head.style.marginRight = "auto";
chatBody.style.display = "none";

setTimeout(() => {
    chatWidget.style.height = "520px";
    chatWidget.style.width = "350px";
    chatHeader.style.borderRadius = "0px";
    head.style.margin = "0px";
    chatBody.style.display = "block";
}, 2000);

toggleButton.addEventListener('click', () => {
    if (chatWidget.style.height === "50px") {
        chatWidget.style.height = "520px";
        chatWidget.style.width = "350px";
        chatHeader.style.borderRadius = "0px";
        head.style.margin = "0px";
        chatBody.style.display = "block";
    } else {
        chatWidget.style.height = "50px";
        chatBody.style.display = "none";
        chatWidget.style.width = "150px";
        chatHeader.style.borderRadius = "50px";
        head.style.marginLeft = "auto";
        head.style.marginRight = "auto";
    }
});

messages.addEventListener("scroll", () => {
    let isScrollBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
    if (!isScrollBottom) {
        scrollBottom.style.display = "block";
        scrollBottom.addEventListener("click", () => {
            messages.scrollTo({
                top: messages.scrollHeight - messages.clientHeight,
                behavior: "smooth"
            });
        });
    } else {
        scrollBottom.style.display = "none";
    }
});
