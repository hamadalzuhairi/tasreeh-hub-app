import { I18nManager } from "react-native";

// Layout is mirrored explicitly (row-reverse / textAlign right) so it renders identically on
// web and native. The native RTL engine is disabled to avoid double-flipping on Arabic devices.
export function ensureLayoutDirection() {
  if (I18nManager.isRTL) {
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
  }
}
