import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";

import { Graph } from "src";
import { ResourceList, Routing } from "src";
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
  const [currentResources, setCurrentResources] = useState<object>({});
  const craftFlowRef = useRef<HTMLDivElement | null>(null);

  const allCraftedItems = useMemo((): Items => {
    return { ...refined, ...tier1, ...tier2, ...tier3, ...tier4 };
  }, []);

  const allItems = useMemo((): Items => {
    return { ...allCraftedItems, ...atmospheric, ...natural };
  }, [allCraftedItems]);

  const generateTreeData = useCallback(
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
        return generateTreeData({
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

  const generateTreeData2 = useMemo((): {
    resources: object;
    treeData: TreeNode;
  } => {
    // console.log("tttt2", name);
    const resources = {}; // closure
    // const treeData = generateTreeData({ name: item, resources });
    // console.log("treeData", treeData);
    // console.log("resources", resources);

    return {
      resources,
      treeData: generateTreeData({ name: item, resources }),
    };
  }, [generateTreeData, item]);

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
    // console.log("generateTreeData2", generateTreeData2);
    setTree(generateTreeData2.treeData);
    setCurrentResources(generateTreeData2.resources);
  }, [generateTreeData2, item]);

  // console.log("resources", resources);
  // console.log("currentResources", currentResources);

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
