import { Stack } from "expo-router";
import { NewRequestWizardProvider } from "../../../../src/requests/NewRequestWizardContext";

export default function NewRequestLayout() {
  return (
    <NewRequestWizardProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NewRequestWizardProvider>
  );
}
