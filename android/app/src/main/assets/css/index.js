export default `
html {
  scroll-behavior: smooth;
  overflow-x: hidden;
  padding-top: var(--StatusBar-currentHeight);
  word-wrap: break-word;
  padding: 0;
}

::selection {
  color: var(--theme-onSecondary);
  background-color: var(--theme-secondary);
}

::-moz-selection {
  color: var(--theme-onSecondary);
  background-color: var(--theme-secondary);
}

body {
  margin-left: 0;
  margin-right: 0;
  padding: 0;
  padding-bottom: 40px;

  font-size: var(--readerSettings-textSize);
  background-color: var(--readerSettings-theme);
  color: var(--readerSettings-textColor);
  text-align: var(--readerSettings-textAlign);
  line-height: var(--readerSettings-lineHeight);
  font-family: var(--readerSettings-fontFamily);
}

chapter {
  width: 100%;
  display: block;
}

chapter > * {
  max-width: 100vw;
  padding-left: var(--readerSettings-padding);
  padding-right: var(--readerSettings-padding);
}

hr {
  margin-top: 20px;
  margin-bottom: 20px;
}

a {
  color: var(--theme-primary);
}

img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
}

table {
  background-color: var(--theme-onPrimary);
  border-collapse: collapse;
  color: var(--theme-primary);
}

th {
  font-weight: bold;
}

td {
  padding: 10px;
  text-align: center;
}

table,
th,
td {
  border: 1px solid var(--theme-outline);
}

.hidden {
  visibility: hidden;
}

.nextButton,
.infoText {
  margin-left: var(--readerSettings-padding);
  margin-right: var(--readerSettings-padding);
  width: calc(100% - var(--readerSettings-padding) * 2);
  border-radius: 50px;
  border-width: 1;
  color: var(--theme-onPrimary);
  background-color: var(--theme-primary);
  font-family: var(--readerSettings-fontFamily);
  font-size: 16px;
  border-width: 0;
  user-select: none;
}

.nextButton {
  min-height: 40px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0 16px;
}

.infoText {
  background-color: transparent;
  text-align: center;
  border: none;
  margin: 0px;
  color: inherit;
  padding-top: 16px;
  padding-bottom: 16px;
}

.chapterCtn {
  min-height: var(--chapterCtn-height);
  margin-bottom: auto;
}

.d-none {
  display: none;
}

#ToolWrapper {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  right: 5vw;
}

#ToolWrapper.horizontal {
  top: unset;
  right: unset;
  left: 50%;
  transform: translateX(-50%);
  bottom: 120px;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
}

@media only screen and (min-width: 500px) {
  #ToolWrapper.horizontal {
    bottom: 80px;
  }
}

#ToolWrapper.hidden {
  opacity: 0;
  right: 0;
}

#ToolWrapper.hidden.horizontal {
  opacity: 0;
  bottom: 0;
  right: unset;
}

#TTS-Controller {
  display: block;
}

#ToolWrapper.horizontal > #TTS-Controller {
  margin-left: 4px;
}

#TTS-Controller button {
  background: var(--theme-surface-0-9);
  border: 0;
}

#TTS-Controller svg {
  fill: var(--theme-onSurface);
}

#ToolWrapper > #ScrollBar {
  margin-top: 8px;
  width: 2.4rem;
  height: 45vh;
  min-height: 200px;
  border-radius: 1.2rem;
  background-color: var(--theme-surface-0-9);
  touch-action: none;
  font-size: 14px;
  user-select: none;
}

#ScrollBar > .scrollbar-item {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--theme-onSurface);
}

#ScrollBar > .scrollbar-item.scrollbar-text {
  height: 12.5%;
}

#ScrollBar > .scrollbar-item#scrollbar-slider {
  height: 75%;
  align-items: unset;
}

#ScrollBar #scrollbar-track {
  width: 0.1rem;
  height: 100%;
  background-color: var(--theme-outline);
}

#ScrollBar #scrollbar-progress {
  width: 100%;
  height: 0;
  background-color: var(--theme-primary);
}

#ScrollBar #scrollbar-thumb-wrapper {
  position: relative;
  top: 100%;
  height: 2rem;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-0.95rem, -1rem);
}

#ScrollBar #scrollbar-thumb {
  top: 100%;
  height: 1rem;
  width: 1rem;
  border-radius: 100%;
  background-color: var(--theme-primary);
}

#ToolWrapper.horizontal > #ScrollBar {
  display: flex;
  width: 80vw;
  height: 2.4rem;
  min-height: unset;
  align-items: center;
  margin-top: unset;
}

#ToolWrapper.horizontal > #ScrollBar > .scrollbar-item {
  display: flex;
  justify-content: center;
  color: var(--theme-onSurface);
}

#ToolWrapper.horizontal > #ScrollBar > .scrollbar-item.scrollbar-text {
  width: 12.5%;
}

#ToolWrapper.horizontal > #ScrollBar > .scrollbar-item#scrollbar-slider {
  width: 75%;
  align-items: center;
}

#ToolWrapper.horizontal > #ScrollBar #scrollbar-track {
  height: 0.1rem;
  width: 100%;
  background-color: var(--theme-outline);
}

#ToolWrapper.horizontal > #ScrollBar #scrollbar-progress {
  height: 100%;
  width: 0;
  background-color: var(--theme-primary);
}

#ToolWrapper.horizontal > #ScrollBar #scrollbar-thumb-wrapper {
  position: relative;
  left: 100%;
  height: 2rem;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-0.95rem, -1rem);
}

#ToolWrapper.horizontal > #ScrollBar #scrollbar-thumb {
  top: 100%;
  height: 1rem;
  width: 1rem;
  border-radius: 100%;
  background-color: var(--theme-primary);
}

#reader-footer-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}

#reader-footer {
  display: flex;
  flex: 3;
  padding: 0.2rem 2rem;
  background-color: var(--readerSettings-theme);
  color: var(--readerSettings-textColor);
  font-size: 1rem;
  text-align: center;
  user-select: none;
}

.reader-footer-item {
  flex: 1;
}

.reader-footer-item:first-child {
  text-align: left;
}

.reader-footer-item:last-child {
  text-align: right;
}

.highlight {
  color: var(--theme-onSecondary);
  background-color: var(--theme-secondary);
}

.contextMenu {
  position: fixed;
  background: var(--theme-surface-0-9);
  height: 0;
  top: var(--top);
  left: var(--left);
  overflow: hidden;
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
  -webkit-animation: menuAnimation 0.4s 0s both;
  animation: menuAnimation 0.4s 0s both;
  transform-origin: left;
  list-style: none;
  margin: 4px;
  padding: 0;
  display: flex;
  flex-direction: column;
  z-index: 999999999;
}

.contextMenu-item {
  padding: 4px;
}

.contextMenu-button {
  color: var(--theme-onSurface);
  background: 0;
  border: 0;
  border-radius: 4px;
  white-space: nowrap;
  padding: 6px 24px 6px 7px;
  text-align: left;
  display: flex;
  align-items: center;
  font-size: 14px;
  width: 100%;
  -webkit-animation: menuItemAnimation 0.2s 0s both;
  animation: menuItemAnimation 0.2s 0s both;
  font-family: var(--readerSettings-fontFamily);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: var(--theme-rippleColor);
}

.contextMenu-button svg {
  fill: var(--theme-onSurface);
}

.contextMenu-button span {
  margin-left: 4px;
}

@-webkit-keyframes menuAnimation {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  100% {
    height: var(--height);
    opacity: 1;
    border-radius: 8px;
    transform: scale(1);
  }
}

@keyframes menuAnimation {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  100% {
    height: var(--height);
    opacity: 1;
    border-radius: 8px;
    transform: scale(1);
  }
}

@-webkit-keyframes menuItemAnimation {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes menuItemAnimation {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

#Image-Modal {
  position: fixed;
  left: 0;
  top: 0;
  user-select: none;
}

#Image-Modal.show {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: var(--theme-surface-0-9);
  align-items: center;
  justify-content: center;
  overflow: scroll;
}

#Image img {
  display: block;
  width: 100%;
}

`;