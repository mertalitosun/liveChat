
const socket = io();

socket.emit("join room", "customer_room");
const notificationSound = document.getElementById("notificationSound");
const notificationSoundButton = document.getElementById("notificationSoundButton");

notificationSoundButton.addEventListener("click",()=>{
  notificationSound.play()
  console.log("tıklandı")
})

// socket.on("addToLocalStorage", (data)=>{
//   const {userId} = data;
//   localStorage.setItem("customerId", userId)
//   console.log(localStorage)
// })
// const userId = localStorage.getItem("customerId");
// socket.emit("localStorage", userId);

// socket.on("deleteToLocalStorage",()=>{
//   localStorage.clear()
//   console.log("silindi:",localStorage)
// })

socket.on("support online", (data) => {
  const headSet = document.getElementById("headSet");
  if (data.count>0) {
    headSet.style.color = "green";
  }else{
    headSet.style.color = "red";
  }
});


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
  notificationSoundButton.click();
  let formattedDate = new Date(data.sendDate);
  formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`

  const item = document.createElement('li');
  const p = document.createElement("p")
  const user = document.createElement("span")
  user.classList.add("user")
  user.innerHTML = `<b>D</b>`
  p.innerHTML = `<p style="word-wrap:break-word">${data.inputValue}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
  p.style.width = "75%";
  p.style.backgroundColor = "#dedede";
  item.appendChild(user)
  item.appendChild(p)
  document.getElementById('messages').appendChild(item);
  const messages = document.getElementById("messages")
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on('customer message', function(data) {
  let formattedDate = new Date(data.sendDate);
  formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`
  const item = document.createElement('li');
  const p = document.createElement("p")
  const user = document.createElement("span")
  user.classList.add("user")
  user.innerHTML = `<b>${data.name.charAt(0).toUpperCase()}</b>`
  item.style.justifyContent = "end";
  p.style.backgroundColor = "#fff";
  p.style.width = "75%";
  p.innerHTML = `<p style="word-wrap:break-word">${data.message}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
  item.appendChild(p)
  item.appendChild(user)
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

const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      const fileData = event.target.result;
      const fileName = file.name;
      const fileType = file.type;

      // Gönderilen dosyayı sohbete ekle
      const fileItem = document.createElement('li');
      const fileLink = document.createElement('a');
      fileLink.textContent = fileName;
      fileLink.href = fileData;
      fileLink.download = fileName;
      fileItem.appendChild(fileLink);

      const messages = document.getElementById('messages');
      messages.appendChild(fileItem);
      messages.scrollTo(0, messages.scrollHeight);

      socket.emit('file message', { fileData, fileName, fileType });
    };
    reader.readAsDataURL(file);
  });