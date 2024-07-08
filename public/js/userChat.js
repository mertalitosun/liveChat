const socket = io();

socket.emit("join room", "customer_room");

const notificationSound = document.getElementById("notificationSound");
const notificationSoundButton = document.getElementById(
  "notificationSoundButton"
);

notificationSoundButton.addEventListener("click", () => {
  notificationSound.play();
  console.log("tıklandı");
});

socket.emit("checkLocalStorage", localStorage.getItem("sessionId"));

socket.on("addToLocalStorage", (data) => {
  const { sessionId } = data;
  localStorage.setItem("sessionId", sessionId);
});

socket.on("deleteToLocalStorage", () => {
  localStorage.removeItem("sessionId");
});

socket.on("support online", (data) => {
  const headSet = document.getElementById("headSet");
  if (data.count > 0) {
    headSet.style.color = "green";
  } else {
    headSet.style.color = "red";
  }
});

function autolink(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();
  const input = document.getElementById("input");
  const name = document.getElementById("name");
  const inputValue = input.value;
  const nameValue = name.value;
  if (nameValue) {
    if (inputValue) {
      socket.emit("customer message", { inputValue, nameValue });
      input.value = "";
      name.style.display = "none";
    } 
  } else {
    alert("Sohbet başlatmak için isminizi yazmanız gerekmektedir.");
  }
});
input.addEventListener("input", () => {
  socket.emit("typing", { status: "yazıyor..." });
});

input.addEventListener("blur", () => {
  socket.emit("stop typing", { status: "" });
});

socket.on("support message", function (data) {
  notificationSoundButton.click();
  let formattedDate = new Date(data.sendDate);
  formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`;

  const item = document.createElement("li");
  const p = document.createElement("p");
  const user = document.createElement("span");
  user.classList.add("user");
  user.innerHTML = `<b>D</b>`;
  p.innerHTML = `<p style="word-wrap:break-word">${autolink(
    data.inputValue
  )}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
  p.style.width = "75%";
  p.style.backgroundColor = "#dedede";
  item.appendChild(user);
  item.appendChild(p);
  document.getElementById("messages").appendChild(item);
  const messages = document.getElementById("messages");
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on("customer message", function (data) {
  let formattedDate = new Date(data.sendDate);
  formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`;
  const item = document.createElement("li");
  const p = document.createElement("p");
  const user = document.createElement("span");
  user.classList.add("user");
  user.innerHTML = `<b>${data.name.charAt(0).toUpperCase()}</b>`;
  item.style.justifyContent = "end";
  p.style.backgroundColor = "#fff";
  p.style.width = "75%";
  p.innerHTML = `<p style="word-wrap:break-word">${autolink(
    data.message
  )}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
  item.appendChild(p);
  item.appendChild(user);
  document.getElementById("messages").appendChild(item);
  const messages = document.getElementById("messages");
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on("display typing", (data) => {
  const typingIndicator = document.getElementById("typingIndicator");
  typingIndicator.textContent = data.status;
});

socket.on("hide typing", () => {
  const typingIndicator = document.getElementById("typingIndicator");
  typingIndicator.textContent = "";
});

socket.on("get message history", (history, customer) => {
  history.forEach((message) => {
    if (message.sendType === "customer") {
      const name = document.getElementById("name");
      name.value = customer.name;
      name.style.display = "none";
      let formattedDate = new Date(message.createdAt);
      formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`;
      const item = document.createElement("li");
      const p = document.createElement("p");
      const user = document.createElement("span");
      user.classList.add("user");
      user.innerHTML = `<b>${customer.name.charAt(0).toUpperCase()}</b> `;
      item.style.justifyContent = "end";
      p.style.backgroundColor = "#fff";
      p.style.width = "75%";
      p.innerHTML = `<p style="word-wrap:break-word">${autolink(
        message.message
      )}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
      item.appendChild(p);
      item.appendChild(user);
      document.getElementById("messages").appendChild(item);
      const messages = document.getElementById("messages");
      messages.scrollTo(0, messages.scrollHeight);
    } else if (message.sendType === "support") {
      let formattedDate = new Date(message.createdAt);
      formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`;

      const item = document.createElement("li");
      const p = document.createElement("p");
      const user = document.createElement("span");
      user.classList.add("user");
      user.innerHTML = `<b>D</b>`;
      p.innerHTML = `<p style="word-wrap:break-word">${autolink(
        message.message
      )}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
      p.style.width = "75%";
      p.style.backgroundColor = "#dedede";
      item.appendChild(user);
      item.appendChild(p);
      document.getElementById("messages").appendChild(item);
      const messages = document.getElementById("messages");
      messages.scrollTo(0, messages.scrollHeight);
    }
  });
});

socket.on("chat ended", () => {
  localStorage.removeItem("sessionId");
  socket.disconnect();
  document.querySelector(".input-group").style.display = "none";
  document.querySelector("#sendButton").style.display = "none";
  document.querySelector(".chatEnded").style.display = "block";
});
//Bağlantı zaman aşımı
socket.on("sessionTimeout", (data) => {
  alert(data.message);
});

const fileButton = document.getElementById("fileButton");
const fileInput = document.getElementById("fileInput");

fileButton.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  console.log(file)

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      const fileData = e.target.result;
      const fileInfo = {
        buffer: fileData,
        name: file.name,
        type: file.type,
        size: file.size
      };
      console.log("Gönderilen FileInfo:", fileInfo); // fileInfo'yi log edin
      socket.emit("file", { fileInfo });
      fileInput.value = "";
    };

    reader.onerror = function(e) {
      console.error("Dosya okunamadı:", e);
    };

    reader.readAsArrayBuffer(file);
  }
});
