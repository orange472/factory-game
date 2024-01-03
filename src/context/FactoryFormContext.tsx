import * as React from "react";

import { Inputs } from "../FactoryTypes";

type Mode = "view" | "create" | "edit";

export const FactoryFormContext = React.createContext<{
  
}>({} as any);

export default function FactoryFormProvider(props: { children: React.ReactNode }) {
  const [originalLabel, setOriginalLabel] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [cost, setCost] = React.useState("");
  const [profit, setProfit] = React.useState("");
  const [capacity, setCapacity] = React.useState(1);
  const [materials, setMaterials] = React.useState<Inputs>({});

  const [mode, setMode] = React.useState<Mode>("view");

  return (
    <FactoryFormContext.Provider value={{}}>
      {props.children}
    </FactoryFormContext.Provider>
  );
}
