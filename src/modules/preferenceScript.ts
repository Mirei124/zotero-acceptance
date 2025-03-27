import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { getPref, setPref } from "../utils/prefs";

export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/content/preferences.xhtml onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
      journalList: getPref("acceptanceStatusList").split("|"),
    };
  } else {
    addon.data.prefs.window = _window;
  }
  updatePrefsUI();
  bindPrefEvents();
}

function appendInputRow(
  document: Document,
  parent: Node,
  value: string,
  placeholder: string,
) {
  const box = document.createElement("hbox");
  box.classList.add(`${config.addonRef}-journal-sublist-box`);
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.placeholder = placeholder;
  input.className = "input-row-input";
  const button = document.createElement("button");
  button.innerText = "⛔";
  button.className = "input-row-button";
  button.addEventListener("click", (ev) => {
    addon.data.prefs!.journalList = addon.data.prefs!.journalList.filter(
      (v) => {
        return v != input.value;
      },
    );
    updatePrefsUI();
    return false;
  });
  box.appendChild(input);
  box.appendChild(button);
  parent.appendChild(box);
}

function writePrefs(values: string[]) {
  setPref("acceptanceStatusList", values.join("|"));
  addon.data.prefs!.journalList = values;
}

async function updatePrefsUI() {
  // You can initialize some UI elements on prefs window
  // with addon.data.prefs.window.document
  // Or bind some events to the elements
  if (addon.data.prefs?.window == undefined) return;
  const renderLock = ztoolkit.getGlobal("Zotero").Promise.defer();
  const document = addon.data.prefs!.window.document!;
  const boxElem = document.querySelector(
    `#${config.addonRef}-journal-list-box`,
  );
  boxElem!.innerHTML = "";
  addon.data.prefs!.journalList.map((v) => {
    appendInputRow(document, boxElem!, v, "");
  });
  renderLock.resolve();
  await renderLock.promise;
  ztoolkit.log("Preference table rendered!");
}

function bindPrefEvents() {
  addon.data
    .prefs!.window.document.querySelector(`#${config.addonRef}-button-add`)
    ?.addEventListener("command", (ev) => {
      const boxElem = addon.data.prefs!.window.document.querySelector(
        `#${config.addonRef}-journal-list-box`,
      );
      appendInputRow(addon.data.prefs!.window.document, boxElem!, "", "CVPR");
      return false;
    });

  addon.data
    .prefs!.window.document.querySelector(`#${config.addonRef}-button-save`)
    ?.addEventListener("command", (ev) => {
      const newStatusList: string[] = [];
      addon.data
        .prefs!.window.document.querySelector(
          `#${config.addonRef}-journal-list-box`,
        )!
        .childNodes.forEach((e) => {
          const ce = e.firstChild as HTMLInputElement;
          newStatusList.push(ce.value ? ce.value : "null");
        });
      writePrefs(Array.from(new Set(newStatusList)).sort());
      updatePrefsUI();
      return addon.hooks.onUpdateRightClickMenu().then((v) => {
        return false;
      });
    });

  addon.data
    .prefs!.window.document.querySelector(`#${config.addonRef}-button-reset`)
    ?.addEventListener("command", (ev) => {
      setPref(
        "acceptanceStatusList",
        "CVPR 🌟|ICCV 🌟|ECCV 🌟|ACL 🌟|NeurIPS 🌟|ICLR 🌟|ICML 🌟|EMNLP 🌟|AAAI ⭐|ACM MM ⭐|COLING ⭐",
      );
      addon.data.prefs!.journalList = getPref("acceptanceStatusList").split(
        "|",
      );
      updatePrefsUI();
      return false;
    });
}
