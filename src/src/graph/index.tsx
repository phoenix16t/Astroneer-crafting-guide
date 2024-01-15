import { useCallback, useEffect, useMemo, useRef } from "react";
import mermaid from "mermaid";

import { atmospheric, natural } from "data";

enum METHODS {
  "AC" = "[/Atmospheric<br />Condenser\\]",
  "BP" = "[[Backpack<br />Printer]]",
  "CL" = "{{Chemistry<br />Lab}}",
  "LP" = "[[Large<br />Printer]]",
  "MP" = "[[Medium<br />Printer]]",
  "SP" = "[[Small<br />Printer]]",
  "SF" = "[(Smelting<br />Furnace)]",
}

type TreeNode = {
  name: string;
  method?: string | undefined;
  planets?: string[] | undefined;
  sources?: TreeNode[] | undefined;
};

const STR = [
  "graph TD",
  "classDef naturalElement fill:#0f0",
  "classDef craftedItem fill:#f96",
  "classDef planet fill:#6ff",
  "classDef method fill:#ddd",
];

export const Graph = ({
  hasCondenser,
  hasOtherMachines,
  maxDepth,
  tree,
}: {
  hasCondenser: boolean;
  hasOtherMachines: boolean;
  maxDepth: number;
  tree: TreeNode | undefined;
}): JSX.Element => {
  const craftFlowRef = useRef<HTMLDivElement | null>(null);

  const extendedArrow = useMemo(() => {
    return hasCondenser && hasOtherMachines ? "--->" : "-->";
  }, [hasCondenser, hasOtherMachines]);

  const buildChart = useCallback(
    ({ treeNode, id = "0" }: { treeNode: TreeNode; id?: string }): string[] => {
      const { method, name, planets, sources } = treeNode;

      const depth = (id.match(/-/g) || []).length;
      const distance = maxDepth - depth;
      const dashes = planets ? "-".repeat(distance * 2) : "";
      const prevId = id.replace(/-\d+$/, "");
      const methodInput = id !== "0" ? `${dashes}--> method${prevId}` : "";
      const planetList = `planet${id}([${(planets || []).join("<br>")}])`;
      const isAtmosphericItem =
        atmospheric[name as keyof typeof atmospheric] !== undefined;
      const isNaturalItem = natural[name as keyof typeof natural] !== undefined;
      const graphSteps: string[] = [];

      // add planet info
      if (isAtmosphericItem) {
        graphSteps.push(`${planetList} --> method${id}`);
      } else if (isNaturalItem) {
        graphSteps.push(`${planetList} ${extendedArrow} item${id}`);
      }

      // add method info
      if (!isNaturalItem) {
        const methodName = METHODS[method as keyof typeof METHODS];
        graphSteps.push(`method${id}${methodName} --> item${id}`);
      }

      // add item info
      graphSteps.push(`item${id}(${name})${methodInput}`);

      // add styling
      if (planets) {
        graphSteps.push(`class planet${id} planet`);
        graphSteps.push(`class item${id} naturalElement`);
      } else {
        graphSteps.push(`class item${id} craftedItem`);
      }
      if (!isNaturalItem) {
        graphSteps.push(`class method${id} method`);
      }

      (sources || []).forEach((source, i) => {
        graphSteps.push(...buildChart({ treeNode: source, id: `${id}-${i}` }));
      });

      return graphSteps;
    },
    [extendedArrow, maxDepth],
  );

  useEffect(() => {
    if (tree === undefined) {
      return;
    }

    const graph = STR.concat(buildChart({ treeNode: tree })).join(";\n");
    mermaid.mermaidAPI
      .render("flow", graph, craftFlowRef.current || undefined)
      .then((result) => {
        if (craftFlowRef.current) {
          craftFlowRef.current.innerHTML = result.svg;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [buildChart, tree]);

  return <div ref={craftFlowRef} />;
};
