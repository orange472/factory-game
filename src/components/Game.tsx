import * as React from "react";

import Draggable from "react-draggable";
import { FactoryContext, FactoryNode } from "../context/FactoryContext";
import { ReactComponent as FactoryIcon } from "../assets/icons/factory.svg";
import Arrow from "./Arrow";

function FactoryNodeElement(props: { node: FactoryNode }) {
  const { positions, updatePositions, updateDimensions } =
    React.useContext(FactoryContext);
  const factoryNodeElementRef = React.useRef<HTMLDivElement>(null);

  function handleDrag() {
    if (factoryNodeElementRef.current === null) {
      return;
    }
    var rect = factoryNodeElementRef.current.getBoundingClientRect();
    updatePositions(
      props.node.label,
      rect.x + window.scrollX,
      rect.y + window.scrollY
    );
  }

  React.useEffect(() => {
    if (factoryNodeElementRef.current === null) {
      return;
    }
    var rect = factoryNodeElementRef.current.getBoundingClientRect();
    updateDimensions(props.node.label, rect.width, rect.height);

    window.addEventListener("scroll", handleDrag);

    return () => {
      window.removeEventListener("scroll", handleDrag);
    };
  }, []);

  return (
    <Draggable
      defaultPosition={{
        x: positions[props.node.label].x,
        y: positions[props.node.label].y,
      }}
      onDrag={handleDrag}
    >
      <div
        className="absolute flex flex-col items-center justify-center w-12 h-12 border border-stone-400 rounded-full cursor-pointer z-30"
        ref={factoryNodeElementRef}
        onClick={() => {}}
      >
        {props.node.image ? (
          <img className="w-8 h-8" alt="Couldn't load image" />
        ) : (
          <FactoryIcon className="w-8 h-8" />
        )}
        <p className="absolute top-full">{props.node.label}</p>
      </div>
    </Draggable>
  );
}

export default function Game() {
  const { factoryMap, positions } = React.useContext(FactoryContext);

  const width = React.useRef(window.screen.width * 1.5);
  const height = React.useRef(window.screen.height * 1.5);

  return (
    <div
      id="game"
      className="absolute bg-background border-stone-400 z-0"
      style={{
        width: `${Math.max(width.current, 1000)}px`,
        height: `${Math.max(height.current, 1000)}px`,
        backgroundSize: "40px 40px",
        backgroundImage:
          "radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)",
      }}
    >
      {Object.keys(positions).map((label) => {
        return (
          <React.Fragment key={label}>
            <FactoryNodeElement node={factoryMap[label]} />

            {Object.keys(factoryMap[label].inputs).map((input) => (
              <Arrow
                key={input + "-" + label}
                from={{
                  x: positions[input].x + positions[input].w / 2,
                  y: positions[input].y + positions[input].h / 2,
                }}
                to={{
                  x: positions[label].x + positions[label].w / 2,
                  y: positions[label].y + positions[label].h / 2,
                }}
              />
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}
