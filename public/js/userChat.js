const socket = io();

socket.emit("join room", "customer_room");

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('input');
  const name = document.getElementById("name");
  const inputValue = input.value;
  const nameValue = name.value;

  if (nameValue) {
    if (inputValue) {
      socket.emit('customer message', { inputValue, nameValue });
      input.value = "";
      name.style.display="none"
    }
  }else{
    alert("Sohbet başlatmak için isminizi yazmanız gerekmektedir.")
  }
});
input.addEventListener("input", () => {
  socket.emit("typing", { status: "yazıyor..." });
});

input.addEventListener("blur", () => {
  socket.emit("stop typing", { status: "" });
});


socket.on('support message', function(data) {
  const item = document.createElement('li');
  const p = document.createElement("p")
  p.innerHTML = `<b>Destek</b>: ${data.inputValue}`;
  p.style.width = "75%";
  p.style.backgroundColor = "#dedede";
  item.appendChild(p)
  document.getElementById('messages').appendChild(item);
  const messages = document.getElementById("messages")
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on('customer message', function(data) {
  const item = document.createElement('li');
  const p = document.createElement("p")
  item.style.justifyContent = "end";
  p.style.backgroundColor = "#fff";
  p.style.width = "75%";
  p.innerHTML = `<b>${data.name}</b>: ${data.message}`;
  item.appendChild(p)
  document.getElementById('messages').appendChild(item);
  const messages = document.getElementById("messages")
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on("display typing", (data) => {
  const typingIndicator = document.getElementById("typingIndicator");
  typingIndicator.textContent = data.status;
  typingIndicator.style.display = "block";
});

socket.on("hide typing", (data) => {
  const typingIndicator = document.getElementById("typingIndicator");
  typingIndicator.style.display = "none";
});