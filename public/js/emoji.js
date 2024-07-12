const emojiButton = document.getElementById("emojiButton");
const emojiPicker = document.querySelector("emoji-picker");
const messageInput = document.querySelector(".messageInput");
emojiPicker.style.display="none"
emojiButton.addEventListener("click", () => {
    if (emojiPicker.style.display === "block") {
        emojiPicker.style.display = "none";
    } else {
        emojiPicker.style.display = "block";
        emojiPicker.style.bottom = `${messageInput.offsetHeight + 20}px`; 
        emojiPicker.style.right = `${document.body.offsetWidth - messageInput.offsetLeft - messageInput.offsetWidth - 20}px`;
    }
});
emojiPicker.addEventListener("emoji-click", (event) => {
    const emoji = event.detail.unicode;
    messageInput.value += emoji;
    emojiPicker.style.display = "none"; 
});