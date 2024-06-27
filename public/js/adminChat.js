const socket = io();
let currentCustomer = null;
const input = document.getElementById('input');

socket.emit("join room", "support_room");

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value && currentCustomer) {
    const inputValue = input.value
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

socket.on('customer message', function(data) {
  let { customerId, name, message } = data;
  let customerItem = document.getElementById(customerId);

  if (!customerItem) {
    // Yeni müşteri
    customerItem = document.createElement('li');
    customerItem.id = customerId;
    customerItem.textContent = `${name}`;
    customerItem.addEventListener('click', () => selectCustomer(customerId));
    document.getElementById('customer-list').prepend(customerItem);
  }
  if (currentCustomer === customerId) {
    addCustomerMessage(message,name); 
  }
});
const customerList = document.querySelectorAll(".customerList")
customerList.forEach(customer=>{
  const customerDataId = customer.getAttribute("dataId")
  customer.addEventListener("click",()=>{
    selectCustomer(customerDataId)
  })
})
socket.on('support message', function(data) {
  let { customerId, inputValue } = data;
  if (currentCustomer === customerId) {
    addSupportMessage(inputValue);
  }
});

function selectCustomer(customerId) {
  currentCustomer = customerId;
  document.getElementById('messages').innerHTML = ''; 

  socket.emit('get message history', customerId, (history,customers) => {
    history.forEach(message => {
      if (message.sendType === "customer") {
        customers.forEach(customer=>{
        addCustomerMessage(message.message,customer.name); 
        })
      } else if (message.sendType === "support") {
        addSupportMessage(message.message);
      }
    });
  });
}

function addCustomerMessage(message,name) {
  const item = document.createElement('li');
  const p = document.createElement("p");
  p.textContent = `${name}: ${message}`;
  p.style.backgroundColor = "#dedede"
  item.appendChild(p)
  document.getElementById('messages').appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function addSupportMessage(message) {
  const item = document.createElement('li');
  const p = document.createElement("p");
  p.textContent = `Destek: ${message}`;
  p.style.backgroundColor = "#fff"
  item.style.justifyContent= "end"
  item.appendChild(p)
  document.getElementById('messages').appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
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
