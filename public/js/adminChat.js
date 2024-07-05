const socket = io();
let currentCustomer = null;
const input = document.getElementById('input');
//Sohbet kapat
document.getElementById("close-support-chat").addEventListener("click",()=>{
  document.querySelector(".support-chat-widget").style.display="none"
})
const notificationSound = document.getElementById("notificationSound");
const notificationSoundButton = document.getElementById("notificationSoundButton");

notificationSoundButton.addEventListener("click", () => {
  notificationSound.play();
});

socket.emit("join room", "support_room");

function autolink(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value && currentCustomer) {
    const inputValue = input.value;
    socket.emit('support message', { customerId: currentCustomer, inputValue: inputValue });
    input.value = '';
  }
});

input.addEventListener("input", () => {
  if (currentCustomer) {
    socket.emit("typing", { customerId: currentCustomer, status: "yazıyor..." });
  }
});

input.addEventListener("blur", () => {
  if (currentCustomer) {
    socket.emit("stop typing", { customerId: currentCustomer, status: "" });
  }
});

socket.on('customer message', function (data) {
  notificationSoundButton.click();
  let { customerId, name, message, sendDate } = data;
  let customerItem = document.getElementById(customerId);
  if (!customerItem) {
    // Yeni müşteri
    customerItem = document.createElement('tr');
    customerItem.id = customerId;
    customerItem.classList.add('d-flex', 'justify-content-between', "p-2", "border-bottom");
    customerItem.innerHTML = `
      <td class="customerList" dataId="${customerId}"><div class="unread"></div><span> ${name}</span>
        <p class="last-message style="word-wrap:break-word"; max-width="150px">
          ${message}
        </p>
      </td>
      <td>
        <form action="/admin" method="POST" class="delete-form">
          <input type="hidden" name="id" value="${customerId}">
          <button type="submit" class="deleteCustomer btn btn-sm btn-danger">X</button>
        </form>
      </td>
    `;
    customerItem.addEventListener('click', () => selectCustomer(customerId));
    document.getElementById('customer-list').prepend(customerItem);
  } else {
    const lastMessageElement = customerItem.querySelector(".last-message");
    if (lastMessageElement) {
      lastMessageElement.textContent = message;
      lastMessageElement.style.maxWidth="150px"
      lastMessageElement.style.wordWrap="break-word"
    }
    const unread = customerItem.querySelector(".unread");
    if (unread) {
      unread.style.display = "inline-block";
    }
  }
  if (currentCustomer === customerId) {
    addCustomerMessage(message, name, sendDate);
  }
  
});

const customerList = document.querySelectorAll(".customerList");
customerList.forEach(customer => {
  const customerDataId = customer.getAttribute("dataId");
  customer.addEventListener("click", () => {
    selectCustomer(customerDataId);
  });
});

socket.on('support message', function (data) {
  let { customerId, inputValue, sendDate } = data;
  if (currentCustomer === customerId) {
    addSupportMessage(inputValue, sendDate);
  }
  let customerItem = document.querySelector(`[dataId="${customerId}"]`);
  if (customerItem) {
    const lastMessageElement = customerItem.querySelector(".last-message");
    if (lastMessageElement) {
      lastMessageElement.textContent = inputValue;
    }
  }
});

function selectCustomer(customerId) {
  document.querySelector(".support-chat-widget").style.display="block"
  currentCustomer = customerId;
  document.getElementById('messages').innerHTML = '';

  const customerItem = document.querySelector(`[dataId="${customerId}"]`);
  const unread = customerItem.querySelector(".unread");

  if (unread) {
    unread.style.display = "none";
  }
  socket.emit("mark messages read", customerId);
  //Mesaj geçmişi
  socket.emit('get message history', customerId, (history, customers) => {
    history.forEach(message => {
      if (message.sendType === "customer") {
        customers.forEach(customer => {
          addCustomerMessage(message.message, customer.name, message.createdAt);
        });
      } else if (message.sendType === "support") {
        addSupportMessage(message.message, message.createdAt);
      }
    });
  });
}

function addCustomerMessage(message, name, sendDate) {
  let formattedDate = new Date(sendDate);
  formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`;

  const item = document.createElement('li');
  const p = document.createElement("p");
  const user = document.createElement("span");
  user.classList.add("user");
  user.innerHTML = `<b>${name.charAt(0).toUpperCase()}</b> `;
  p.innerHTML = `<p style="word-wrap:break-word">${autolink(message)}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
  p.style.backgroundColor = "#dedede";
  item.appendChild(user);
  item.appendChild(p);
  document.getElementById('messages').appendChild(item);
  const messages = document.getElementById("messages");
  messages.scrollTo(0, messages.scrollHeight);
}

function addSupportMessage(message, sendDate) {
  let formattedDate = new Date(sendDate);
  formattedDate = `${formattedDate.getHours()}:${formattedDate.getMinutes()}`;
  const item = document.createElement('li');
  const p = document.createElement("p");
  const user = document.createElement("span");
  user.classList.add("user");
  user.innerHTML = `<b>D</b>`;
  p.innerHTML = ` <p style="word-wrap:break-word">${autolink(message)}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
  p.style.backgroundColor = "#fff";
  item.style.justifyContent = "end";
  item.appendChild(p);
  item.appendChild(user);

  document.getElementById('messages').appendChild(item);
  const messages = document.getElementById("messages");
  messages.scrollTo(0, messages.scrollHeight);
}

socket.on('display typing', function (data) {
  const { customerId, status } = data;
  if (customerId === currentCustomer) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = status;
  }
});

socket.on('hide typing', function (data) {
  const { customerId } = data;
  if (customerId === currentCustomer) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.textContent = '';
  }
});

document.getElementById('endChatButton').addEventListener('click', () => {
  if (currentCustomer) {
    socket.emit("end chat", { customerId: currentCustomer });
  }
});
socket.on("chat ended", () => {
  alert("Sohbet sona erdi.");
});

const fileInput = document.getElementById('fileInput');
const fileButton = document.getElementById('fileButton');

fileButton.addEventListener('click', () => {
  fileInput.click(); 
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = () => {
      const buffer = reader.result;
      const fileInfo = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        buffer: buffer
      };
      console.log(fileInfo)
      socket.emit('support message', { customerId: currentCustomer, fileInfo: fileInfo }); 
    };
  }
});


