const urlParams = new URLSearchParams(window.location.search);

const overlayPreview = document.getElementById("overlayPreview");
const overlayNameText = document.getElementById("overlayNameText");
const webcamFrameBox = document.getElementById("webcamFrameBox");
const webcamVideo = document.getElementById("webcamVideo");
const webcamPlaceholderText = document.getElementById("webcamPlaceholderText");
const topBarBox = document.getElementById("topBarBox");
const recentFollowerBox = document.getElementById("recentFollowerBox");
const recentFollowerNameText = document.getElementById("recentFollowerNameText");
const alertBox = document.getElementById("alertBox");
const chatBox = document.getElementById("chatBox");
const chatMessages = document.getElementById("chatMessages");
const goalBox = document.getElementById("goalBox");
const goalCountText = document.getElementById("goalCountText");
const goalProgressFill = document.getElementById("goalProgressFill");
const draggableWidgets = {
  topbar: topBarBox,
  webcam: webcamFrameBox,
  follower: recentFollowerBox,
  alert: alertBox,
  chat: chatBox,
  goal: goalBox
};

const nameValue = urlParams.get("name") || "Streamer";
const channelValue = cleanChannelName(urlParams.get("channel"));
const presetValue = urlParams.get("preset") || STREAMWORLD_TEMPLATES[0].id;
const selectedTemplate = findStreamWorldTemplate(presetValue);
const colorValue = urlParams.get("color") || selectedTemplate.color;
const transparentValue = urlParams.get("transparent");
const webcamValue = urlParams.get("webcam");
const liveWebcamValue = urlParams.get("liveWebcam");
const topBarValue = urlParams.get("topbar");
const followerValue = urlParams.get("follower");
const followerNameValue = urlParams.get("followerName") || "latestfan";
const alertValue = urlParams.get("alert");
const chatValue = urlParams.get("chat");
const goalValue = urlParams.get("goal");
const goalCurrentValue = Math.max(Number(urlParams.get("goalCurrent")) || 0, 0);
const goalTargetValue = Math.max(Number(urlParams.get("goalTarget")) || 1, 1);
const goalPercentValue = Math.min(Math.round((goalCurrentValue / goalTargetValue) * 100), 100);

overlayNameText.textContent = nameValue;
recentFollowerNameText.textContent = followerNameValue;
goalCountText.textContent = `${goalCurrentValue} / ${goalTargetValue}`;
goalProgressFill.style.width = `${goalPercentValue}%`;
document.documentElement.style.setProperty("--accentColor", colorValue);
overlayPreview.style.setProperty("--accentColor", colorValue);
overlayPreview.style.setProperty("--templateBg", selectedTemplate.bg);
overlayPreview.style.setProperty("--templateBg2", selectedTemplate.bg2);
overlayPreview.style.setProperty("--panelBg", selectedTemplate.panel);
overlayPreview.style.setProperty("--overlayText", selectedTemplate.text);
overlayPreview.classList.remove(...STREAMWORLD_TEMPLATES.map(function(template) {
  return `preset-${template.id}`;
}));

overlayPreview.classList.add(
  `preset-${selectedTemplate.id}`,
  `layout-${selectedTemplate.layout}`,
  `motion-${selectedTemplate.motion}`,
  `shape-${selectedTemplate.shape}`,
  `fx-${selectedTemplate.fx}`
);

const transparentEnabled = transparentValue === null ? selectedTemplate.transparent : transparentValue === "true";

if (transparentEnabled) {
  overlayPreview.classList.add("transparent-bg");
} else {
  overlayPreview.classList.remove("transparent-bg");
}

if (webcamValue === "false") {
  webcamFrameBox.style.display = "none";
}

if (webcamValue !== "false" && liveWebcamValue === "true") {
  enableWebcamPreview({
    videoElement: webcamVideo,
    placeholderElement: webcamPlaceholderText
  });
}

if (topBarValue === "false") {
  topBarBox.style.display = "none";
}

if (followerValue === "false") {
  recentFollowerBox.style.display = "none";
}

if (alertValue === "false") {
  alertBox.style.display = "none";
}

if (chatValue === "false") {
  chatBox.style.display = "none";
}

if (chatValue !== "false" && channelValue) {
  connectTwitchChat({
    channelName: channelValue,
    chatMessagesElement: chatMessages
  });
}

if (goalValue === "false") {
  goalBox.style.display = "none";
}

Object.keys(draggableWidgets).forEach(function(widgetKey) {
  const xValue = Number(urlParams.get(`${widgetKey}X`));
  const yValue = Number(urlParams.get(`${widgetKey}Y`));

  if (!Number.isFinite(xValue) || !Number.isFinite(yValue)) {
    return;
  }

  const widget = draggableWidgets[widgetKey];
  widget.classList.add("custom-position");
  widget.style.left = `${xValue}px`;
  widget.style.top = `${yValue}px`;
  widget.style.right = "auto";
  widget.style.bottom = "auto";
  widget.style.transform = "none";
});
