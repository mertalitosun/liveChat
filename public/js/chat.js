const toggleButton = document.getElementById('toggle-chat');
const chatBody = document.querySelector('.chat-body');
const chatWidget = document.querySelector('.chat-widget');

chatWidget.style.height = "50px";

toggleButton.addEventListener('click', () => {
    if (chatWidget.style.height === "50px") {
        chatWidget.style.height = "400px";
        chatBody.style.display = "block";
    } else {
        chatWidget.style.height = "50px";
        chatBody.style.display = "none";
    }
});
