import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";

import {
  atmospheric,
  natural,
  refined,
  tier1,
  tier2,
  tier3,
  tier4,
} from "data";

type Item = {
  method?: string;
  planets?: string[];
  sources?: string[];
};

type Items = {
  [key: string]: Item;
};

type TreeNode = {
  name: string;
  method?: string | undefined;
  planets?: string[] | undefined;
  sources?: TreeNode[] | undefined;
};

const STR = [
  "graph TD",
  "classDef rootElement fill:#6f9",
  "classDef compoundElement fill:#f96",
  "classDef planettt fill:#6f9",
];

enum METHODS {
  "AC" = "[/Atmospheric Condenser\\]",
  "BP" = "[[Backpack Printer]]",
  "CL" = "[/Chemistry Lab\\]",
  "LP" = "[[Large Printer]]",
  "MP" = "[[Medium Printer]]",
  "SP" = "[[Small Printer]]",
  "SF" = "[(Smelting Furnace)]",
}

const DEFAULT = "RTG";

export const App = (): JSX.Element => {
  console.log("\n\n\n");

  const [resource, setResource] = useState<string>(DEFAULT);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [tree, setTree] = useState<TreeNode | undefined>(undefined);
  const [hasCondenser, setHasCondenser] = useState<boolean>(false);
  const [hasOtherMachines, setHasOtherMachines] = useState<boolean>(false);
  const craftFlowRef = useRef<HTMLDivElement | null>(null);

  const allCraftedItems = useMemo((): Items => {
    return { ...refined, ...tier1, ...tier2, ...tier3, ...tier4 };
  }, []);

  const allItems = useMemo((): Items => {
    return { ...allCraftedItems, ...atmospheric, ...natural };
  }, [allCraftedItems]);

  const extendedArrow = useMemo(() => {
    return hasCondenser && hasOtherMachines ? "--->" : "-->";
  }, [hasCondenser, hasOtherMachines]);

  const generateTree = useCallback(
    ({ name, depth = 0 }: { name: string; depth?: number }): TreeNode => {
      setMaxDepth((m) => Math.max(m, depth));

      const { method, planets, sources } = allItems[name] ?? {};

      if (planets !== undefined) {
        method === "AC" ? setHasCondenser(true) : setHasOtherMachines(true);
      }

      const sourceList = sources
        ?.sort()
        .map((s) => generateTree({ depth: depth + 1, name: s }));

      return {
        name,
        ...(method !== undefined && { method }),
        ...(planets !== undefined && { planets }),
        ...(sources !== undefined && { sources: sourceList }),
      };
    },
    [allItems],
  );

  const buildChart = useCallback(
    (asdf: TreeNode, id = "0"): string[] => {
      const { method, name, planets, sources } = asdf;
      const prevId = id.replace(/-\d+$/, "");
      const depth = (id.match(/-/g) || []).length;
      const calc = Math.max(maxDepth - depth, 0);
      const dash = maxDepth === 0 ? "--" : "-".repeat(calc * 2);
      const str: string[] = [];

      const m = METHODS[method as keyof typeof METHODS];
      const isAtmosphericItem =
        atmospheric[name as keyof typeof atmospheric] !== undefined;
      const isNaturalItem = natural[name as keyof typeof natural] !== undefined;

      const p =
        planets !== undefined ? `planet${id}([${planets.join("<br>")}])` : "";

      if (isAtmosphericItem) {
        str.push(`${p} --> method${id}`);
        str.push(`method${id}${m} --> item${id}`);
      } else if (isNaturalItem) {
        str.push(`${p} ${extendedArrow} item${id}`);
      } else {
        str.push(`method${id}${m} --> item${id}`);
      }

      if (planets !== undefined) {
        str.push(`class planet${id} planettt`);
      }

      const s = ` ${planets === undefined ? "" : dash}--> method${prevId}`;

      const methodStr = id === "0" ? "" : s;

      str.push(`item${id}[${name}]${methodStr}`);
      str.push(`class item${id} compoundElement`);

      (sources || []).forEach((source, i) => {
        str.push(...buildChart(source, `${id}-${i}`));
      });

      return str;
    },
    [extendedArrow, maxDepth],
  );

  const handleChange = useCallback((e: { target: { value: string } }) => {
    setMaxDepth(0);
    setHasCondenser(false);
    setHasOtherMachines(false);
    setTree(undefined);
    setResource(e.target.value);
  }, []);

  useEffect(() => {
    if (craftFlowRef.current) {
      mermaid.mermaidAPI.initialize({ startOnLoad: true });
    }
  }, []);

  useEffect(() => {
    if (tree === undefined) {
      return;
    }

    const graph = STR.concat(buildChart(tree)).join(";\n");
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

  useEffect(() => {
    setTree(generateTree({ name: resource }));
  }, [resource, generateTree]);

  return (
    <>
      <select onChange={handleChange} value={resource}>
        {Object.keys(allCraftedItems)
          .sort()
          .map((itemName) => {
            return (
              <option key={itemName} value={itemName}>
                {itemName}
              </option>
            );
          })}
      </select>

      <div ref={craftFlowRef} />

      <div>sdlihfs</div>
    </>
  );
};
