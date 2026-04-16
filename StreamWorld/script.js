const nameInputBox = document.getElementById("nameInputBox");
const channelInputBox = document.getElementById("channelInputBox");
const colorPickerInput = document.getElementById("colorPickerInput");
const transparentToggleSwitch = document.getElementById("transparentToggleSwitch");
const webcamToggleSwitch = document.getElementById("webcamToggleSwitch");
const topBarToggleSwitch = document.getElementById("topBarToggleSwitch");
const followerToggleSwitch = document.getElementById("followerToggleSwitch");
const alertToggleSwitch = document.getElementById("alertToggleSwitch");
const chatToggleSwitch = document.getElementById("chatToggleSwitch");
const goalToggleSwitch = document.getElementById("goalToggleSwitch");
const webcamLiveToggleSwitch = document.getElementById("webcamLiveToggleSwitch");
const presetSelect = document.getElementById("presetSelect");
const templateCountText = document.getElementById("templateCountText");
const selectedPresetPreview = document.getElementById("selectedPresetPreview");

const previewStage = document.getElementById("previewStage");
const previewViewport = document.getElementById("previewViewport");
const overlayPreview = document.getElementById("overlayPreview");
const overlayNameText = document.getElementById("overlayNameText");
const colorValueText = document.getElementById("colorValueText");
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
const downloadButton = document.getElementById("downloadButton");
const obsLinkButton = document.getElementById("obsLinkButton");
const obsLinkOutput = document.getElementById("obsLinkOutput");
const resetLayoutButton = document.getElementById("resetLayoutButton");
const connectChatButton = document.getElementById("connectChatButton");
const enableWebcamButton = document.getElementById("enableWebcamButton");
const chatStatusText = document.getElementById("chatStatusText");
const webcamStatusText = document.getElementById("webcamStatusText");
const recentFollowerInputBox = document.getElementById("recentFollowerInputBox");
const goalCurrentInputBox = document.getElementById("goalCurrentInputBox");
const goalTargetInputBox = document.getElementById("goalTargetInputBox");
const draggableWidgets = document.querySelectorAll(".draggable-widget");

const presetSettings = STREAMWORLD_TEMPLATES.reduce(function(settings, template) {
  settings[template.id] = template;
  return settings;
}, {});
const presetClasses = STREAMWORLD_TEMPLATES.map(function(template) {
  return `preset-${template.id}`;
});

let currentPreset = STREAMWORLD_TEMPLATES[0].id;
let widgetPositions = {};
let activeDrag = null;
let twitchChatSocket = null;

function fitPreviewToStage() {
  const stageRect = previewStage.getBoundingClientRect();
  const availableWidth = Math.max(stageRect.width - 48, 320);
  const availableHeight = Math.max(stageRect.height - 48, 180);
  const scale = Math.min(availableWidth / 1920, availableHeight / 1080, 1);

  previewViewport.style.width = `${Math.round(1920 * scale)}px`;
  previewViewport.style.height = `${Math.round(1080 * scale)}px`;
  overlayPreview.style.transform = `scale(${scale})`;
}

function renderPresetCards() {
  presetSelect.innerHTML = "";
  templateCountText.textContent = `${STREAMWORLD_TEMPLATES.length} packs`;

  STREAMWORLD_TEMPLATES.forEach(function(template) {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = `${template.name} - ${template.tag}`;
    presetSelect.appendChild(option);
  });
}

function updateName() {
  overlayNameText.textContent = nameInputBox.value.trim() || "Streamer";
}

function updateFollowerText() {
  recentFollowerNameText.textContent = recentFollowerInputBox.value.trim() || "latestfan";
}

function updateGoalText() {
  const currentValue = Math.max(Number(goalCurrentInputBox.value) || 0, 0);
  const targetValue = Math.max(Number(goalTargetInputBox.value) || 1, 1);
  const percent = Math.min(Math.round((currentValue / targetValue) * 100), 100);

  goalCountText.textContent = `${currentValue} / ${targetValue}`;
  goalProgressFill.style.width = `${percent}%`;
}

function updateColor() {
  document.documentElement.style.setProperty("--accentColor", colorPickerInput.value);
  overlayPreview.style.setProperty("--accentColor", colorPickerInput.value);
  colorValueText.textContent = colorPickerInput.value;
}

function updateVisibility() {
  overlayPreview.classList.toggle("transparent-bg", transparentToggleSwitch.checked);
  webcamFrameBox.style.display = webcamToggleSwitch.checked ? "grid" : "none";
  topBarBox.style.display = topBarToggleSwitch.checked ? "flex" : "none";
  recentFollowerBox.style.display = followerToggleSwitch.checked ? "block" : "none";
  alertBox.style.display = alertToggleSwitch.checked ? "flex" : "none";
  chatBox.style.display = chatToggleSwitch.checked ? "block" : "none";
  goalBox.style.display = goalToggleSwitch.checked ? "block" : "none";
}

function updatePresetClass() {
  overlayPreview.classList.remove(...presetClasses);
  overlayPreview.classList.add(`preset-${currentPreset}`);
  presetSelect.value = currentPreset;
}

function updateSelectedPresetPreview(template) {
  selectedPresetPreview.style.setProperty("--thumbBackground", `linear-gradient(135deg, ${template.bg}, ${template.bg2})`);
  selectedPresetPreview.style.setProperty("--thumbAccent", template.color);
  selectedPresetPreview.innerHTML = `
    <span class="template-thumb"></span>
    <span>
      <strong>${template.name}</strong>
      <small>${template.tag}</small>
    </span>
  `;
}

function updateTemplateStyle(template) {
  overlayPreview.classList.remove(
    "layout-classic",
    "layout-centered",
    "layout-wide",
    "layout-minimal",
    "layout-mirrored",
    "layout-cozy",
    "motion-calm",
    "motion-scan",
    "motion-float",
    "motion-bounce",
    "motion-pulse",
    "motion-slide",
    "motion-shine",
    "shape-sharp",
    "shape-soft",
    "shape-block",
    "fx-none",
    "fx-grid",
    "fx-glass",
    "fx-sparks",
    "fx-waves",
    "fx-stars",
    "fx-bubbles",
    "fx-crystal",
    "fx-rings",
    "fx-speed",
    "fx-leaves"
  );

  overlayPreview.classList.add(
    `layout-${template.layout}`,
    `motion-${template.motion}`,
    `shape-${template.shape}`,
    `fx-${template.fx}`
  );
  overlayPreview.style.setProperty("--accentColor", template.color);
  overlayPreview.style.setProperty("--templateBg", template.bg);
  overlayPreview.style.setProperty("--templateBg2", template.bg2);
  overlayPreview.style.setProperty("--panelBg", template.panel);
  overlayPreview.style.setProperty("--overlayText", template.text);
}

function getPreviewPoint(event) {
  const previewRect = overlayPreview.getBoundingClientRect();
  const scale = previewRect.width / overlayPreview.offsetWidth;

  return {
    x: (event.clientX - previewRect.left) / scale,
    y: (event.clientY - previewRect.top) / scale
  };
}

function clampPosition(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function applyWidgetPosition(widget, position) {
  widget.classList.add("custom-position");
  widget.style.left = `${position.x}px`;
  widget.style.top = `${position.y}px`;
  widget.style.right = "auto";
  widget.style.bottom = "auto";
  widget.style.transform = "none";
}

function resetWidgetPositions() {
  widgetPositions = {};

  draggableWidgets.forEach(function(widget) {
    widget.classList.remove("custom-position");
    widget.style.left = "";
    widget.style.top = "";
    widget.style.right = "";
    widget.style.bottom = "";
    widget.style.transform = "";
  });

  generateOBSLink();
}

function startWidgetDrag(event) {
  if (event.button !== 0) {
    return;
  }

  const widget = event.currentTarget;
  const widgetKey = widget.dataset.widgetKey;
  const previewPoint = getPreviewPoint(event);
  const widgetRect = widget.getBoundingClientRect();
  const previewRect = overlayPreview.getBoundingClientRect();
  const scale = previewRect.width / overlayPreview.offsetWidth;

  activeDrag = {
    widget,
    widgetKey,
    offsetX: (event.clientX - widgetRect.left) / scale,
    offsetY: (event.clientY - widgetRect.top) / scale
  };

  widget.classList.add("is-dragging");
  applyWidgetPosition(widget, {
    x: previewPoint.x - activeDrag.offsetX,
    y: previewPoint.y - activeDrag.offsetY
  });

  widget.setPointerCapture(event.pointerId);
}

function moveWidgetDrag(event) {
  if (!activeDrag) {
    return;
  }

  const previewPoint = getPreviewPoint(event);
  const widgetWidth = activeDrag.widget.offsetWidth;
  const widgetHeight = activeDrag.widget.offsetHeight;
  const maxX = overlayPreview.offsetWidth - widgetWidth;
  const maxY = overlayPreview.offsetHeight - widgetHeight;
  const nextPosition = {
    x: Math.round(clampPosition(previewPoint.x - activeDrag.offsetX, 0, maxX)),
    y: Math.round(clampPosition(previewPoint.y - activeDrag.offsetY, 0, maxY))
  };

  widgetPositions[activeDrag.widgetKey] = nextPosition;
  applyWidgetPosition(activeDrag.widget, nextPosition);
}

function stopWidgetDrag() {
  if (!activeDrag) {
    return;
  }

  activeDrag.widget.classList.remove("is-dragging");
  activeDrag = null;
  generateOBSLink();
}

function applyPreset(presetName) {
  const selectedPreset = presetSettings[presetName];

  if (!selectedPreset) {
    return;
  }

  currentPreset = presetName;
  colorPickerInput.value = selectedPreset.color;
  transparentToggleSwitch.checked = selectedPreset.transparent;
  webcamToggleSwitch.checked = selectedPreset.webcam;
  topBarToggleSwitch.checked = selectedPreset.topbar;
  followerToggleSwitch.checked = selectedPreset.follower;
  alertToggleSwitch.checked = selectedPreset.alert;
  chatToggleSwitch.checked = selectedPreset.chat;
  goalToggleSwitch.checked = selectedPreset.goal;

  updateVisibility();
  updateTemplateStyle(selectedPreset);
  updateColor();
  updatePresetClass();
  updateSelectedPresetPreview(selectedPreset);
  resetWidgetPositions();
  generateOBSLink();
}

function buildOverlayURL() {
  const overlayURL = new URL("overlay.html", window.location.href);

  overlayURL.searchParams.set("name", nameInputBox.value.trim() || "Streamer");
  overlayURL.searchParams.set("channel", cleanChannelName(channelInputBox.value));
  overlayURL.searchParams.set("color", colorPickerInput.value);
  overlayURL.searchParams.set("preset", currentPreset);
  overlayURL.searchParams.set("transparent", transparentToggleSwitch.checked);
  overlayURL.searchParams.set("webcam", webcamToggleSwitch.checked);
  overlayURL.searchParams.set("liveWebcam", webcamLiveToggleSwitch.checked);
  overlayURL.searchParams.set("topbar", topBarToggleSwitch.checked);
  overlayURL.searchParams.set("follower", followerToggleSwitch.checked);
  overlayURL.searchParams.set("followerName", recentFollowerInputBox.value.trim() || "latestfan");
  overlayURL.searchParams.set("alert", alertToggleSwitch.checked);
  overlayURL.searchParams.set("chat", chatToggleSwitch.checked);
  overlayURL.searchParams.set("goal", goalToggleSwitch.checked);
  overlayURL.searchParams.set("goalCurrent", Math.max(Number(goalCurrentInputBox.value) || 0, 0));
  overlayURL.searchParams.set("goalTarget", Math.max(Number(goalTargetInputBox.value) || 1, 1));

  Object.keys(widgetPositions).forEach(function(widgetKey) {
    overlayURL.searchParams.set(`${widgetKey}X`, widgetPositions[widgetKey].x);
    overlayURL.searchParams.set(`${widgetKey}Y`, widgetPositions[widgetKey].y);
  });

  return overlayURL;
}

function connectLiveChat() {
  if (twitchChatSocket) {
    twitchChatSocket.close();
    twitchChatSocket = null;
  }

  twitchChatSocket = connectTwitchChat({
    channelName: channelInputBox.value,
    chatMessagesElement: chatMessages,
    statusElement: chatStatusText
  });

  generateOBSLink();
}

function enableLiveWebcam() {
  enableWebcamPreview({
    videoElement: webcamVideo,
    placeholderElement: webcamPlaceholderText,
    statusElement: webcamStatusText
  });
}

function generateOBSLink() {
  const overlayURL = buildOverlayURL();
  obsLinkOutput.textContent = overlayURL.href;
  obsLinkOutput.href = overlayURL.href;
}

async function downloadPreview() {
  if (!window.html2canvas) {
    alert("Download tool is still loading. Try again in a moment.");
    return;
  }

  overlayPreview.classList.remove("preview-scale");
  const previewTransform = overlayPreview.style.transform;
  overlayPreview.style.transform = "none";

  let canvas;
  try {
    canvas = await html2canvas(overlayPreview, {
      backgroundColor: transparentToggleSwitch.checked ? null : undefined,
      scale: 1,
      width: 1920,
      height: 1080
    });
  } finally {
    overlayPreview.classList.add("preview-scale");
    overlayPreview.style.transform = previewTransform;
  }

  const downloadLink = document.createElement("a");
  downloadLink.download = "streamworld-overlay.png";
  downloadLink.href = canvas.toDataURL("image/png");
  downloadLink.click();
}

nameInputBox.addEventListener("input", updateName);
channelInputBox.addEventListener("input", generateOBSLink);
colorPickerInput.addEventListener("input", updateColor);
transparentToggleSwitch.addEventListener("change", updateVisibility);
webcamToggleSwitch.addEventListener("change", updateVisibility);
webcamLiveToggleSwitch.addEventListener("change", generateOBSLink);
topBarToggleSwitch.addEventListener("change", updateVisibility);
followerToggleSwitch.addEventListener("change", updateVisibility);
alertToggleSwitch.addEventListener("change", updateVisibility);
chatToggleSwitch.addEventListener("change", updateVisibility);
goalToggleSwitch.addEventListener("change", updateVisibility);
recentFollowerInputBox.addEventListener("input", function() {
  updateFollowerText();
  generateOBSLink();
});
goalCurrentInputBox.addEventListener("input", function() {
  updateGoalText();
  generateOBSLink();
});
goalTargetInputBox.addEventListener("input", function() {
  updateGoalText();
  generateOBSLink();
});
presetSelect.addEventListener("change", function() {
  applyPreset(presetSelect.value);
});
obsLinkButton.addEventListener("click", generateOBSLink);
downloadButton.addEventListener("click", downloadPreview);
resetLayoutButton.addEventListener("click", resetWidgetPositions);
connectChatButton.addEventListener("click", connectLiveChat);
enableWebcamButton.addEventListener("click", enableLiveWebcam);
draggableWidgets.forEach(function(widget) {
  widget.addEventListener("pointerdown", startWidgetDrag);
  widget.addEventListener("pointermove", moveWidgetDrag);
  widget.addEventListener("pointerup", stopWidgetDrag);
  widget.addEventListener("pointercancel", stopWidgetDrag);
});
window.addEventListener("resize", fitPreviewToStage);

updateName();
updateFollowerText();
updateGoalText();
renderPresetCards();
applyPreset(currentPreset);
fitPreviewToStage();
requestAnimationFrame(fitPreviewToStage);
