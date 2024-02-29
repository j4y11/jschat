var socket;
var usernameInput;
var chatIDInput;
var messageInput;
var chatRoom;
var dingSound;
var messages = [];
var delay = true;
var usernameSet = false;

function onload() {
  socket = io();
  usernameInput = document.getElementById("NameInput");
  chatIDInput = document.getElementById("IDInput");
  messageInput = document.getElementById("ComposedMessage");
  chatRoom = document.getElementById("RoomID");
  dingSound = document.getElementById("Ding");

  socket.on("join", function (room) {
    chatRoom.innerHTML = "Chatroom: " + room;
  });

  socket.on("recieve", function (message) {
    console.log(message);
    if (messages.length < 9) {
      messages.push(message);
      dingSound.currentTime = 0;
      dingSound.play();
    } else {
      messages.shift();
      messages.push(message);
    }
    for (var i = 0; i < messages.length; i++) {
      document.getElementById("Message" + i).innerHTML = messages[i];
      document.getElementById("Message" + i).style.color = "#303030";
    }
  });

  socket.on("usernameError", function (errorMessage) {
    alert(errorMessage);
    usernameInput.style.border = "2px solid red";
    usernameSet = false;
  });

  usernameInput.addEventListener("input", function () {
    checkUsernameAvailability();
  });
}

function checkUsernameAvailability() {
  var username = usernameInput.value;
  var isUsernameAvailable = true;

  socket.emit("checkUsername", username, function (available) {
    isUsernameAvailable = available;

    if (isUsernameAvailable) {
      usernameInput.style.border = "2px solid green";
      usernameSet = true;
    } else {
      usernameInput.style.border = "2px solid red";
      usernameSet = false;
    }
  });
}

function Connect() {
  if (!usernameSet) {
    alert("Please enter a unique username.");
    return;
  }

  socket.emit("join", chatIDInput.value, usernameInput.value);
}

function Send() {
  if (delay && messageInput.value.replace(/\s/g, "") !== "") {
    delay = false;
    setTimeout(delayReset, 1000);
    socket.emit("send", messageInput.value);
    messageInput.value = "";
  }
}

function delayReset() {
  delay = true;
}

window.onload = onload;
