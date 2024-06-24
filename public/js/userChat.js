const socket = io();

// Müşteri odasına katıl
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

socket.on('support message', function(data) {
  const item = document.createElement('li');
  item.textContent = `Destek: ${data.message}`;
  document.getElementById('messages').appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('customer message', function(data) {
  const item = document.createElement('li');
  item.textContent = `${data.name}: ${data.message}`;
  document.getElementById('messages').appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
