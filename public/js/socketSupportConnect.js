const socket = io();
socket.emit("join room", "support_room");
socket.on("unread messages count", (count) => {
  // document.getElementById("unreadMessagesCount").style.display="none"
  document.getElementById("unreadMessagesCount").textContent = count;
});
