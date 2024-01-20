import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";
import { Graph, ResourceList, Routing } from "src";
import { ResourceCount, Resources, TreeNode } from "types";
import {
  atmospheric,
  natural,
  refined,
  tier1,
  tier2,
  tier3,
  tier4,
} from "data";

import "./style.scss";

const DEFAULT = "RTG";

export const App = ({
  direction = "TB",
}: {
  direction: string;
}): JSX.Element => {
  const [item, setItem] = useState<string>(DEFAULT);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [tree, setTree] = useState<TreeNode | undefined>(undefined);
  const [hasCondenser, setHasCondenser] = useState<boolean>(false);
  const [hasOtherMachines, setHasOtherMachines] = useState<boolean>(false);
  const [currentResources, setCurrentResources] = useState<ResourceCount>({});
  const craftFlowRef = useRef<HTMLDivElement | null>(null);

  const allCraftedItems = useMemo((): Resources => {
    return { ...refined, ...tier1, ...tier2, ...tier3, ...tier4 };
  }, []);

  const allItems = useMemo((): Resources => {
    return { ...allCraftedItems, ...atmospheric, ...natural };
  }, [allCraftedItems]);

  const getBranch = useCallback(
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

      const { method, planets, sources } = allItems[name] ?? {};

      if (planets !== undefined) {
        method === "AC" ? setHasCondenser(true) : setHasOtherMachines(true);
        resources[name] =
          resources[name] === undefined ? 1 : resources[name] + 1;
      }

      const sourceList = sources?.sort().map((name) => {
        return getBranch({
          name,
          depth: depth + 1,
          resources,
        });
      });

      return {
        name,
        ...(method !== undefined && { method }),
        ...(planets !== undefined && { planets }),
        ...(sources !== undefined && { sources: sourceList }),
      };
    },
    [allItems],
  );

  const handleChange = useCallback((e: { target: { value: string } }): void => {
    setMaxDepth(0);
    setHasCondenser(false);
    setHasOtherMachines(false);
    setTree(undefined);

    setItem(e.target.value);
  }, []);

  // initialize mermaid
  useEffect(() => {
    if (craftFlowRef.current) {
      mermaid.mermaidAPI.initialize({ startOnLoad: true });
    }
  }, []);

  // generate tree data
  useEffect(() => {
    const resources = {}; // closure
    const treeData = getBranch({ name: item, resources });

    setCurrentResources(resources);
    setTree(treeData);
  }, [getBranch, item]);

  return (
    <div className="app">
      <div className="selection">
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
      </div>

      <div className="graph">
        <Graph
          direction={direction}
          hasCondenser={hasCondenser}
          hasOtherMachines={hasOtherMachines}
          maxDepth={maxDepth}
          tree={tree}
        />
      </div>

      <div className="informationPanel">
        <ResourceList resources={currentResources} />
        <Routing resources={currentResources} />
      </div>
    </div>
  );
};
