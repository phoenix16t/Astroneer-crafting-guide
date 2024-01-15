import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";

import { Graph } from "src";
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

const DEFAULT = "RTG";

export const App = (): JSX.Element => {
  // console.log("\n\n\n");

  const [item, setItem] = useState<string>(DEFAULT);
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

  const generateTree = useCallback(
    ({
      name,
      depth = 0,
      resources = {},
    }: {
      name: string;
      depth?: number;
      resources?: { [key: string]: number };
    }): TreeNode => {
      setMaxDepth((m) => Math.max(m, depth));
      console.log("resource", resources);
      const { method, planets, sources } = allItems[name] ?? {};

      if (planets !== undefined) {
        method === "AC" ? setHasCondenser(true) : setHasOtherMachines(true);
      }

      const sourceList = sources
        ?.sort()
        .map((s) => generateTree({ name: s, depth: depth + 1 }));

      return {
        name,
        ...(method !== undefined && { method }),
        ...(planets !== undefined && { planets }),
        ...(sources !== undefined && { sources: sourceList }),
      };
    },
    [allItems],
  );

  const handleChange = useCallback((e: { target: { value: string } }) => {
    setMaxDepth(0);
    setHasCondenser(false);
    setHasOtherMachines(false);
    setTree(undefined);

    setItem(e.target.value);
  }, []);

  useEffect(() => {
    if (craftFlowRef.current) {
      mermaid.mermaidAPI.initialize({ startOnLoad: true });
    }
  }, []);

  useEffect(() => {
    setTree(generateTree({ name: item }));
  }, [generateTree, item]);

  return (
    <>
      <select onChange={handleChange} value={item}>
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

      <Graph
        hasCondenser={hasCondenser}
        hasOtherMachines={hasOtherMachines}
        maxDepth={maxDepth}
        tree={tree}
      />

      <div>sdlihfs</div>
    </>
  );
};
