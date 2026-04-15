const urlParams = new URLSearchParams(window.location.search);

const overlayPreview = document.getElementById("overlayPreview");
const overlayNameText = document.getElementById("overlayNameText");
const webcamFrameBox = document.getElementById("webcamFrameBox");
const topBarBox = document.getElementById("topBarBox");
const recentFollowerBox = document.getElementById("recentFollowerBox");
const alertBox = document.getElementById("alertBox");
const chatBox = document.getElementById("chatBox");
const goalBox = document.getElementById("goalBox");
const draggableWidgets = {
  topbar: topBarBox,
  webcam: webcamFrameBox,
  follower: recentFollowerBox,
  alert: alertBox,
  chat: chatBox,
  goal: goalBox
};

const nameValue = urlParams.get("name") || "Streamer";
const presetValue = urlParams.get("preset") || STREAMWORLD_TEMPLATES[0].id;
const selectedTemplate = findStreamWorldTemplate(presetValue);
const colorValue = urlParams.get("color") || selectedTemplate.color;
const transparentValue = urlParams.get("transparent");
const webcamValue = urlParams.get("webcam");
const topBarValue = urlParams.get("topbar");
const followerValue = urlParams.get("follower");
const alertValue = urlParams.get("alert");
const chatValue = urlParams.get("chat");
const goalValue = urlParams.get("goal");

overlayNameText.textContent = nameValue;
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
