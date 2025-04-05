import { getLocaleID, getString } from "../utils/locale";
import type { MenuitemOptions } from "zotero-plugin-toolkit";
import { ExtraFieldTool } from "zotero-plugin-toolkit";

const ACCEPTANCE_KEY_NAME = "Acceptance";
const ACCEPTANCE_STATUS_NONE = "None";

export class Acceptance {
  static getSelectedItems() {
    return Zotero.getActiveZoteroPane()
      .getSelectedItems()
      .filter((it) => {
        return it.isRegularItem();
      });
  }

  static async setItemAcceptanceStatus(it: Zotero.Item, status: string) {
    await new ExtraFieldTool().setExtraField(it, ACCEPTANCE_KEY_NAME, status);
  }

  static getItemAcceptanceStatus(it: Zotero.Item) {
    const status = new ExtraFieldTool().getExtraField(it, ACCEPTANCE_KEY_NAME);
    if (status != undefined) {
      if (status !== ACCEPTANCE_STATUS_NONE) {
        return status;
      }
      return getString("none-label");
    }
    return getString("unknown-label");
  }

  static setSelectedAcceptanceStatus(status: string) {
    this.getSelectedItems().map((it) => {
      Acceptance.setItemAcceptanceStatus(it, status).then((v) => {
        return;
      });
    });
  }

  static registerRightClickMenu(acceptance_status: string[]) {
    ztoolkit.Menu.register("item", {
      tag: "menu",
      id: "zotero-acceptance-menu",
      label: getString("acceptance-menu-label"),
      children: [
        {
          tag: "menuitem",
          label: getString("none-label"),
          commandListener: (ev) => {
            Acceptance.setSelectedAcceptanceStatus(ACCEPTANCE_STATUS_NONE);
          },
        } as MenuitemOptions,
      ].concat(
        acceptance_status.map((v: string) => {
          return {
            tag: "menuitem",
            label: v,
            commandListener: (ev) => {
              Acceptance.setSelectedAcceptanceStatus(v);
            },
          };
        }),
      ),
    });
  }

  static unRegisterRightClickMenu() {
    ztoolkit.Menu.unregister("zotero-acceptance-menu");
  }

  static async registerExtraColumn() {
    await Zotero.ItemTreeManager.registerColumns({
      pluginID: addon.data.config.addonID,
      dataKey: "zotero-acceptance",
      label: getString("acceptance-label"),
      dataProvider: (item: Zotero.Item, dataKey: string) => {
        return this.getItemAcceptanceStatus(item);
      },
      // iconPath: "chrome://zotero/skin/cross.png",
    });
  }

  static registerPrefs() {
    Zotero.PreferencePanes.register({
      pluginID: addon.data.config.addonID,
      src: rootURI + "content/preferences.xhtml",
      label: getString("prefs-title"),
      image: `chrome://${addon.data.config.addonRef}/content/icons/favicon.png`,
    });
  }
}
