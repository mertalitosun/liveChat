const socket = io();
let currentCustomer = null;
const input = document.getElementById('input');

const notificationSound = document.getElementById("notificationSound");
const notificationSoundButton = document.getElementById("notificationSoundButton");

notificationSoundButton.addEventListener("click", () => {
  notificationSound.play();
  console.log("tıklandı");
});

socket.emit("join room", "support_room");

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
  console.log(customerItem)
  if (!customerItem) {
    // Yeni müşteri
    customerItem = document.createElement('tr');
    customerItem.id = customerId;
    customerItem.classList.add('d-flex', 'justify-content-between', "p-2", "border-bottom");
    customerItem.innerHTML = `
      <td class="customerList" dataId="${customerId}"><div class="unread"></div><span> ${name}</span>
        <p class="last-message">
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
  currentCustomer = customerId;
  document.getElementById('messages').innerHTML = '';

  const customerItem = document.querySelector(`[dataId="${customerId}"]`);
  const unread = customerItem.querySelector(".unread");

  if (unread) {
    unread.style.display = "none";
  }
  socket.emit("mark messages read", customerId);
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
  p.innerHTML = `<p style="word-wrap:break-word">${message}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
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
  p.innerHTML = ` <p style="word-wrap:break-word">${message}</p> <i style="font-size:14px; float:right; margin-top:10px">${formattedDate}</i>`;
  p.style.backgroundColor = "#fff";
  item.style.justifyContent = "end";
  item.appendChild(p);
  item.appendChild(user);

  document.getElementById('messages').appendChild(item);
  const messages = document.getElementById("messages");
  messages.scrollTo(0, messages.scrollHeight);
}

socket.on("display typing", (data) => {
  const typingIndicator = document.getElementById("typingIndicator");
  typingIndicator.textContent = data.status;
  typingIndicator.style.display = "block";
});

socket.on("hide typing", (data) => {
  const typingIndicator = document.getElementById("typingIndicator");
  typingIndicator.style.display = "none";
});
