const socket = io();
let currentCustomer = null;

// Destek odasına katıl
socket.emit("join room", "support_room");

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('input');
  if (input.value && currentCustomer) {
    socket.emit('support message', { customerId: currentCustomer, message: input.value });
    input.value = '';
  }
});

socket.on('customer message', function(data) {
  let { customerId, name, message } = data; // name değerini de al
  let customerItem = document.getElementById(customerId);

  if (!customerItem) {
    // Yeni müşteri
    customerItem = document.createElement('li');
    customerItem.className = 'list-group-item';
    customerItem.id = customerId;
    customerItem.textContent = `${name}`;
    customerItem.addEventListener('click', () => selectCustomer(customerId));
    document.getElementById('customer-list').appendChild(customerItem);
  }

  if (currentCustomer === customerId) {
    addCustomerMessage(name, message); // Müşteri adını ve mesajı ekle
  }
});

socket.on('support message', function(data) {
  let { customerId, message } = data;
  if (currentCustomer === customerId) {
    addSupportMessage(message);
  }
});

function selectCustomer(customerId) {
  currentCustomer = customerId;
  document.getElementById('messages').innerHTML = ''; // Önceki mesajları temizle

  socket.emit('get message history', customerId, (history) => {
    history.forEach((msgObj) => {
      if (msgObj.type === 'customer') {
        addCustomerMessage(msgObj.name, msgObj.message); // Müşteri adını ve mesajı ekle
      } else if (msgObj.type === 'support') {
        addSupportMessage(msgObj.message);
      }
    });
  });
}

function addCustomerMessage(name, message) {
  const item = document.createElement('li');
  item.textContent = `${name}: ${message}`;
  document.getElementById('messages').appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function addSupportMessage(message) {
  const item = document.createElement('li');
  item.textContent = `Destek: ${message}`;
  document.getElementById('messages').appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}
