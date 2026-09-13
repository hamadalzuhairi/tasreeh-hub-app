import { createContext, useContext, useState, type ReactNode } from "react";
import type { RequestType } from "@tasreeh/shared";

interface WizardState {
  type: RequestType | null;
  subject: string;
  body: string;
  attachmentName: string | null;
}

interface WizardContextValue {
  state: WizardState;
  setType: (type: RequestType) => void;
  setSubject: (subject: string) => void;
  setBody: (body: string) => void;
  setAttachmentName: (name: string | null) => void;
  reset: () => void;
}

const INITIAL_STATE: WizardState = { type: null, subject: "", body: "", attachmentName: null };

const WizardContext = createContext<WizardContextValue | null>(null);

export function NewRequestWizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  return (
    <WizardContext.Provider
      value={{
        state,
        setType: (type) => setState((s) => ({ ...s, type })),
        setSubject: (subject) => setState((s) => ({ ...s, subject })),
        setBody: (body) => setState((s) => ({ ...s, body })),
        setAttachmentName: (attachmentName) => setState((s) => ({ ...s, attachmentName })),
        reset: () => setState(INITIAL_STATE),
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useNewRequestWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useNewRequestWizard must be used within NewRequestWizardProvider");
  return ctx;
}
