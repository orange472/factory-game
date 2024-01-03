import * as React from "react";
import GLPK from "glpk.js";
import {
  FactoryNodeInsertProps,
  FactoryNodeUpdateProps,
  Inputs,
  Outputs,
  Positions,
  FactoryMap,
  Constraint,
  Objective,
} from "../FactoryTypes";

export class FactoryNode {
  public label: string;
  public image?: Blob;

  public inputs: Inputs = {};
  public outputs: Outputs = {};

  public cost: number;
  public profit: number;

  public storage: number;
  public stored: number = 0;

  constructor(props: FactoryNodeInsertProps) {
    this.label = props.label;
    this.inputs = props.inputs ?? {};
    this.cost = props.cost ?? 0;
    this.profit = props.profit ?? 0;
    this.storage = props.storage ?? 100;
  }

  isFinalProduct() {
    return Object.keys(this.outputs).length === 0;
  }
}

export const FactoryContext = React.createContext<{
  factoryMap: { [key: string]: FactoryNode };
  positions: Positions;
  labels: string[];
  forceUpdate: React.DispatchWithoutAction;
  insertFactoryNode(props: FactoryNodeInsertProps): any;
  deleteFactoryNode(label: string): void;
  updateFactoryNode(props: FactoryNodeUpdateProps): boolean;
  updateDimensions(label: string, w: number, h: number): void;
  updatePositions(label: string, x: number, y: number): void;
  findFactoryNodes(label: string, exclude?: string): string[];
  solve(): any;
}>({} as any);

export default function FactoryProvider(props: { children: React.ReactNode }) {
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const factoryMap = React.useRef<FactoryMap>({});
  const positions = React.useRef<Positions>({});
  const [labels, setLabels] = React.useState<string[]>([]);

  function insertFactoryNode(props: FactoryNodeInsertProps) {
    if (props.label in factoryMap.current) {
      return;
    }

    var node = new FactoryNode(props);

    factoryMap.current[node.label] = node;
    positions.current[node.label] = {
      x: window.screen.width / 2 + window.scrollX,
      y: window.screen.height / 2 + window.scrollY,
      w: 0,
      h: 0,
    };
    setLabels((prev) => [...prev, node.label]);
  }

  function deleteFactoryNode(label: string) {
    setLabels((prev) => prev.filter((l) => l !== label));
    delete positions.current[label];
    delete factoryMap.current[label];

    Object.values(factoryMap.current).forEach((node) => {
      delete node.inputs[label];
    });
    Object.values(factoryMap.current).forEach((node) => {
      delete node.outputs[label];
    });
  }

  function updateLabel(oldLabel: string, newLabel: string) {
    setLabels((prev) =>
      prev.map((l) => (l === oldLabel && newLabel ? newLabel : l))
    );

    Object.values(factoryMap.current).forEach((node) => {
      if (oldLabel in node.inputs) {
        node.inputs[newLabel] = node.inputs[oldLabel];
        delete node.inputs[oldLabel];
      }
      if (oldLabel in node.outputs) {
        node.outputs[newLabel] = node.outputs[oldLabel];
        delete node.outputs[oldLabel];
      }
    });

    positions.current[newLabel] = positions.current[oldLabel];
    delete positions.current[oldLabel];

    factoryMap.current[newLabel] = factoryMap.current[oldLabel];
    delete factoryMap.current[oldLabel];
  }

  function updateFactoryNode(props: FactoryNodeUpdateProps) {
    if (!(props.originalLabel in factoryMap.current)) {
      return false;
    }

    var node = factoryMap.current[props.originalLabel];

    if (props.label !== undefined && props.originalLabel !== props.label) {
      node.label = props.label;
      updateLabel(props.originalLabel, props.label);
    }
    if (props.inputs !== undefined) {
      node.inputs = props.inputs;
    }
    if (props.cost !== undefined) {
      node.cost = props.cost;
    }
    if (props.profit !== undefined) {
      node.profit = props.profit;
    }
    if (props.storage !== undefined) {
      node.storage = props.storage;
    }
    forceUpdate();

    return true;
  }

  function updateDimensions(label: string, w: number, h: number) {
    positions.current[label].w = w;
    positions.current[label].h = h;
  }

  function updatePositions(label: string, x: number, y: number) {
    positions.current[label].x = x;
    positions.current[label].y = y;
    forceUpdate();
  }

  function findFactoryNodes(label: string, exclude?: string) {
    var results: string[] = [];

    for (var i = 0; i < labels.length; i++) {
      if (
        labels[i].toLowerCase().includes(label.toLowerCase()) &&
        (exclude === undefined || labels[i] !== exclude)
      ) {
        results.push(labels[i]);
      }
    }

    return results;
  }

  function isCyclic() {
    var visited: { [key: string]: boolean } = {};
    var stack: { [key: string]: boolean } = {};
    var containsCycle = false;

    function helper(node: FactoryNode) {
      if (!(node.label in visited)) {
        visited[node.label] = stack[node.label] = true;

        Object.keys(node.inputs).some((inputLabel) => {
          const inputNode = factoryMap.current[inputLabel];

          if (!(inputLabel in visited) && helper(inputNode)) {
            containsCycle = true;
          } else if (stack[inputLabel] === true) {
            containsCycle = true;
          }
          return containsCycle;
        });
      }

      stack[node.label] = false;
      return containsCycle;
    }

    return Object.values(factoryMap.current).some((node) => {
      return !(node.label in visited) && helper(node);
    });
  }

  function solve() {
    var visited: { [key: string]: boolean } = {};
    var info: { [key: string]: { net: number; bottleneck: number } } = {};
    var products: string[] = [];

    // Helper function for DFS
    function explore(node: FactoryNode): { net: number; bottleneck: number } {
      var net = -node.cost;
      var bottleneck = node.storage;

      if (node.isFinalProduct()) {
        net += node.profit;
        products.push(node.label);
      }

      if (!(node.label in visited)) {
        visited[node.label] = true;

        Object.keys(node.inputs).forEach((inputLabel) => {
          const inputNode = factoryMap.current[inputLabel];
          const inputAmount = node.inputs[inputLabel];
          const res = explore(inputNode);

          net += inputAmount * res.net;

          bottleneck = Math.min(
            bottleneck,
            res.bottleneck,
            Math.floor(Math.min(node.storage, inputNode.storage) / inputAmount)
          );
        });
      }

      return (info[node.label] = { net, bottleneck });
    }

    // DFS
    Object.values(factoryMap.current).forEach((node) => {
      !(node.label in visited) && explore(node);
    });

    return info;
  }

  return (
    <FactoryContext.Provider
      value={{
        factoryMap: factoryMap.current,
        positions: positions.current,
        labels,
        forceUpdate,
        insertFactoryNode,
        deleteFactoryNode,
        updateFactoryNode,
        findFactoryNodes,
        updateDimensions,
        updatePositions,
        solve,
      }}
    >
      {props.children}
    </FactoryContext.Provider>
  );
}
