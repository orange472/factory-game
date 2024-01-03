import * as React from "react";

import FactoryNodeForm from "./components/FactoryForm";
import FactoryProvider from "./context/FactoryContext";
import Game from "./components/Game";
import { ReactComponent as PlayIcon } from "./assets/icons/play.svg";
import { ReactComponent as ArrowBackIcon } from "./assets/icons/arrow-back.svg";
import { ReactComponent as ListIcon } from "./assets/icons/list.svg";

export default function App() {
  const [name, setName] = React.useState("");
  const [play, setPlay] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);

  return (
    <FactoryProvider>
      <Game />

      <div className="w-full fixed top-0 left-0 p-4 flex flex-row items-center justify-between gap-4 z-20">
        <div className="flex flex-row items-center gap-4 overflow-clip">
          <input
            className="text-3xl bg-transparent outline-none flex-shrink overflow-hidden"
            type="text"
            placeholder="Untitled factory"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        <ListIcon
          className={`min-w-8 min-h-8 hover:fill-amber-400 cursor-pointer transition-all ${
            showForm ? "hidden" : "block"
          }`}
          onClick={() => setShowForm(true)}
        />
      </div>

      {showForm && <FactoryNodeForm name={name} setShowForm={setShowForm} />}

      <p className="fixed bottom-4 left-0 w-screen text-center text-sm z-20">
        The Factory Game | &copy; 2023
      </p>
    </FactoryProvider>
  );
}
