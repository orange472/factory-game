import { FactoryNode } from "./context/FactoryContext";

export type Inputs = {
  [label: string]: number;
};

export type Outputs = {
  [label: string]: number;
};

export type FactoryNodeInsertProps = {
  label: string;
  inputs?: Inputs;
  cost?: number;
  profit?: number;
  storage?: number;
};

export type FactoryNodeUpdateProps = {
  originalLabel: string;
  label?: string;
  inputs?: Inputs;
  cost?: number;
  profit?: number;
  storage?: number;
};

export type Positions = {
  [key: string]: { x: number; y: number; w: number; h: number };
};

export type FactoryMap = {
  [key: string]: FactoryNode;
};

// GLPK types

type Variable = {
  name: string;
  coef: number;
};

export type Objective = {
  name: string;
  direction: any;
  vars: Variable[];
}

export type Constraint = {
  name: string;
  vars: Variable[];
  bnds: {
    type: any;
    ub: number;
    lb: number;
  };
};
