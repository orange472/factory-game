import * as React from "react";

import { FactoryContext } from "../context/FactoryContext";
import { Inputs } from "../FactoryTypes";
import useClickOutside from "../hooks/useClickOutside";
import { ReactComponent as ArrowBackIcon } from "../assets/icons/arrow-back.svg";
import { ReactComponent as CloseIcon } from "../assets/icons/close.svg";
import { ReactComponent as CheckIcon } from "../assets/icons/check.svg";
import { ReactComponent as EditIcon } from "../assets/icons/edit.svg";
import { ReactComponent as AddIcon } from "../assets/icons/add.svg";
import { ReactComponent as DeleteIcon } from "../assets/icons/delete.svg";

type Mode = "view" | "create" | "edit";

export default function FactoryForm(props: {
  name: string;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [originalLabel, setOriginalLabel] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [cost, setCost] = React.useState("");
  const [profit, setProfit] = React.useState("");
  const [storage, setStorage] = React.useState(1);
  const [materials, setMaterials] = React.useState<Inputs>({});

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<string[]>([]);
  const [showResults, setShowResults] = React.useState(false);
  const searchInputRef = React.useRef(null);
  useClickOutside(searchInputRef, () => setShowResults(false));

  const [mode, setMode] = React.useState<Mode>("view");
  const [error, setError] = React.useState("");

  const factory = React.useContext(FactoryContext);

  function handleSubmit() {
    if (label.length === 0) {
      setError("Item name is required.");
      return;
    }
    if (cost.length > 0 && typeof Number(cost) !== "number") {
      setError("Cost must be a number.");
      return;
    }
    if (profit.length > 0 && typeof Number(profit) !== "number") {
      setError("Cost must be a number.");
      return;
    }
    if (Number(cost) < 0) {
      setError("Cost can't be negative.");
      return;
    }
    if (Number(profit) < 0) {
      setError("Profit can't be negative.");
      return;
    }
    if (storage < 0) {
      setError("Max storage can't be negative.");
      return;
    }

    if (mode === "create") {
      factory.insertFactoryNode({
        label: label,
        cost: Number(cost),
        profit: Number(profit),
        storage: storage,
        inputs: materials,
      });
    } else {
      factory.updateFactoryNode({
        originalLabel,
        label: label,
        cost: Number(cost),
        profit: Number(profit),
        storage: storage,
        inputs: materials,
      });
    }

    setMode("view");
  }

  // Start searching for available materials
  React.useEffect(() => {
    setSearching(true);
    var searchTimeout = window.setTimeout(() => {
      const ids = factory.findFactoryNodes(searchTerm, originalLabel);
      setSearchResults(ids);
      setSearching(false);
    }, 300);

    return () => {
      window.clearTimeout(searchTimeout);
    };
  }, [searchTerm, mode]);

  // Reset fields
  React.useEffect(() => {
    if (mode !== "edit") {
      setOriginalLabel("");
      setLabel("");
      setCost("");
      setProfit("");
      setStorage(1);
      setMaterials({});
    }
    setSearchTerm("");
    setError("");
  }, [mode]);

  return (
    <div
      className={`fixed flex-col right-0 w-screen md:w-1/4 min-w-60 h-screen bg-background border-l z-40`}
    >
      {mode === "view" ? (
        <div className="relative flex flex-col gap-4 p-4 overflow-auto">
          <div className="sticky top-0 flex flex-row gap-4 items-center justify-between">
            <CloseIcon
              className="min-w-6 min-h-6 hover:fill-amber-400 cursor-pointer transition-all"
              onClick={() => props.setShowForm(false)}
            />
            <h1 className="text-xl text-ellipsis line-clamp-1 whitespace-nowrap overflow-scroll">
              {props.name || "Untitled factory"}
            </h1>
            <AddIcon
              className="min-w-6 min-h-6 hover:fill-amber-400 cursor-pointer transition-all"
              onClick={() => setMode("create")}
            />
          </div>

          <hr />

          <ul className="flex flex-col gap-2 overflow-auto">
            {Object.keys(factory.factoryMap).length === 0 ? (
              <li className="text-sm">No items yet!</li>
            ) : (
              factory.labels.map((label) => {
                const node = factory.factoryMap[label];
                return (
                  <li
                    key={label}
                    className="group flex flex-row items-center justify-between p-2 border border-slate-400 rounded-sm cursor-pointer"
                    onClick={() => {
                      setOriginalLabel(node.label);
                      setLabel(node.label);
                      setCost(String(node.cost));
                      setProfit(String(node.profit));
                      setStorage(node.storage);
                      setMaterials(structuredClone(node.inputs));
                      setMode("edit");
                    }}
                  >
                    {label}
                    <EditIcon className="group-hover:fill-amber-400 transition-all" />
                  </li>
                );
              })
            )}
          </ul>

          <button
            className="p-2 border-2 border-stone-400 rounded-sm cursor-pointer hover:border-amber-400 hover:text-amber-400 transition-all"
            onClick={() => {
              console.log(factory.solve());
            }}
          >
            Simulate
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
            <h1 className="flex flex-row items-center justify-between gap-4 text-xl">
              <div className="flex flex-row gap-4 items-center">
                <ArrowBackIcon
                  className="cursor-pointer scale-125 hover:fill-amber-400 transition-all"
                  onClick={() => setMode("view")}
                />
                {mode === "create" ? "Add new item" : "Edit item"}
              </div>
              <div className="flex flex-row items-center gap-4">
                <CheckIcon
                  className="cursor-pointer scale-125 hover:fill-amber-400 transition-all"
                  onClick={handleSubmit}
                />
                {mode === "edit" && (
                  <DeleteIcon
                    className="cursor-pointer scale-125 hover:fill-amber-400 transition-all"
                    onClick={() => {
                      factory.deleteFactoryNode(originalLabel);
                      setMode("view");
                    }}
                  />
                )}
              </div>
            </h1>
            <hr />
            <div className="flex flex-col gap-1">
              <label className="text-sm">Item name</label>
              <div className="w-full flex flex-row p-2 shadow-sm border border-slate-400 rounded-sm">
                <input
                  type="text"
                  placeholder="Item name"
                  className="flex-1 outline-none bg-transparent"
                  onChange={(e) => setLabel(e.target.value)}
                  value={label}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Cost per unit</label>
              <div className="w-full flex flex-row p-2 shadow-sm border border-slate-400 rounded-sm">
                <input
                  type="number"
                  min={0}
                  placeholder="Cost (default is 0)"
                  className="flex-1 outline-none bg-transparent"
                  onChange={(e) => setCost(e.target.value)}
                  value={cost}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Profit per unit</label>
              <div className="w-full flex flex-row p-2 shadow-sm border border-slate-400 rounded-sm">
                <input
                  type="number"
                  min={0}
                  placeholder="Profit (default is 0)"
                  className="flex-1 outline-none bg-transparent"
                  onChange={(e) => setProfit(e.target.value)}
                  value={profit}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Max storage</label>
              <div className="w-full flex flex-row p-2 shadow-sm border border-slate-400 rounded-sm">
                <input
                  type="number"
                  min={1}
                  placeholder="Units"
                  className="flex-1 outline-none bg-transparent"
                  onChange={(e) => setStorage(Number(e.target.value))}
                  value={storage ? storage : ""}
                  onBlur={() => {
                    if (!storage) {
                      setStorage(1);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 z-40">
              <label className="text-sm">Required materials</label>
              <div className="relative flex flex-col z-40" ref={searchInputRef}>
                <div className="w-full flex flex-row p-2 shadow-sm border border-slate-400 rounded-sm">
                  <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 outline-none bg-transparent"
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    onFocus={() => setShowResults(true)}
                    value={searchTerm}
                  />
                </div>
                {showResults && (
                  <ul className="w-full absolute top-full">
                    {searching ? (
                      <li className="p-2 backdrop-blur-lg text-neutral-800 border border-slate-400 rounded-sm z-40">
                        Searching...
                      </li>
                    ) : searchResults.length === 0 ? (
                      <li className="p-2 backdrop-blur-lg text-neutral-800 border border-slate-400 rounded-sm z-40">
                        No results found.
                      </li>
                    ) : (
                      searchResults.map((label) => (
                        <li
                          key={label}
                          className="p-2 backdrop-blur-lg text-neutral-800 border border-slate-400 rounded-sm cursor-pointer z-40"
                          onClick={() => {
                            if (label in materials) {
                              setError("Material already added!");
                            } else {
                              materials[label] = 1;
                              setMaterials(materials);
                            }
                            setShowResults(false);
                          }}
                        >
                          {factory.factoryMap[label].label}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>

            {Object.keys(materials).length !== 0 && (
              <ul className="flex flex-col gap-2 z-10">
                {Object.keys(materials).map((label) => (
                  <li key={label} className="flex flex-row items-center gap-2">
                    <div className="flex-[1] border-b-2 border-b-stone-500">
                      <input
                        className="w-full outline-none bg-transparent"
                        type="number"
                        min={1}
                        onChange={(e) => {
                          materials[label] = Number(e.target.value);
                          factory.forceUpdate();
                        }}
                        value={materials[label] ? materials[label] : ""}
                        onBlur={() => {
                          if (materials[label] <= 0) {
                            materials[label] = 1;
                            factory.forceUpdate();
                          }
                        }}
                      />
                    </div>
                    <p className="flex-[4]">{label}</p>
                    <CloseIcon
                      className="hover:fill-amber-400 cursor-pointer"
                      onClick={() => {
                        delete materials[label];
                        factory.forceUpdate();
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4 px-4 pb-4">
            <hr />
            <p className="h-6">{error}</p>
            <button
              className="flex items-center justify-center p-2 rounded-sm cursor-pointer border-2 border-stone-500 hover:brightness-110 transition-all hover:border-amber-400 hover:text-amber-400"
              onClick={handleSubmit}
            >
              {mode === "create" ? "Add item" : "Finish editing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
