function cleanChannelName(channelName) {
  return (channelName || "")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

function setStatus(statusElement, message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function addChatMessage(chatMessagesElement, username, message) {
  if (!chatMessagesElement) {
    return;
  }

  const messageLine = document.createElement("p");
  const nameElement = document.createElement("strong");
  nameElement.textContent = `${username}:`;
  messageLine.appendChild(nameElement);
  messageLine.append(` ${message}`);

  chatMessagesElement.appendChild(messageLine);

  while (chatMessagesElement.children.length > 5) {
    chatMessagesElement.removeChild(chatMessagesElement.firstElementChild);
  }
}

function parseTwitchChatLine(rawLine) {
  const match = rawLine.match(/:([^!]+)![^ ]+ PRIVMSG #[^ ]+ :(.+)/);

  if (!match) {
    return null;
  }

  return {
    username: match[1],
    message: match[2]
  };
}

function connectTwitchChat(options) {
  const channelName = cleanChannelName(options.channelName);
  const chatMessagesElement = options.chatMessagesElement;
  const statusElement = options.statusElement;

  if (!channelName) {
    setStatus(statusElement, "Add a Twitch channel first.");
    return null;
  }

  const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
  const guestName = `justinfan${Math.floor(Math.random() * 90000) + 10000}`;

  setStatus(statusElement, `Connecting to #${channelName} chat...`);

  socket.addEventListener("open", function() {
    socket.send("PASS SCHMOOPIIE");
    socket.send(`NICK ${guestName}`);
    socket.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
    socket.send(`JOIN #${channelName}`);
    setStatus(statusElement, `Connected to #${channelName} chat.`);
  });

  socket.addEventListener("message", function(event) {
    const lines = String(event.data).split("\r\n");

    lines.forEach(function(line) {
      if (!line) {
        return;
      }

      if (line.startsWith("PING")) {
        socket.send("PONG :tmi.twitch.tv");
        return;
      }

      const chatLine = parseTwitchChatLine(line);

      if (chatLine) {
        addChatMessage(chatMessagesElement, chatLine.username, chatLine.message);
      }
    });
  });

  socket.addEventListener("close", function() {
    setStatus(statusElement, "Chat disconnected.");
  });

  socket.addEventListener("error", function() {
    setStatus(statusElement, "Could not connect to Twitch chat.");
  });

  return socket;
}

async function enableWebcamPreview(options) {
  const videoElement = options.videoElement;
  const placeholderElement = options.placeholderElement;
  const statusElement = options.statusElement;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus(statusElement, "This browser does not support webcam access.");
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    videoElement.srcObject = stream;
    videoElement.classList.add("is-live");

    if (placeholderElement) {
      placeholderElement.style.display = "none";
    }

    setStatus(statusElement, "Webcam preview is live.");
    return stream;
  } catch (error) {
    setStatus(statusElement, "Camera permission was blocked or unavailable.");
    return null;
  }
}
