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
// import { gasItem, item1, item2, item3, item4, rootItem } from "data";

type Item = {
  method?: string;
  planets?: string[];
  sources?: string[];
};

type Items = {
  [key: string]: Item;
};

// TODO: change to enum
type MethodsType = {
  [key: string]: string;
};

type SomeThing = {
  sources?: SomeThing[] | undefined;
  planets?: string[] | undefined;
  name: string;
  method?: string | undefined;
};

const DEFAULT = "RTG";

export const App = (): JSX.Element => {
  const [element, setElement] = useState<string | undefined>(undefined);
  const [hasCondenser, setHasCondenser] = useState<boolean>(false);
  const [hasOtherMachines, setHasOtherMachines] = useState<boolean>(false);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const craftFlowRef = useRef<HTMLDivElement | null>(null);

  const allCraftedItems = useMemo((): Items => {
    return { ...refined, ...tier1, ...tier2, ...tier3, ...tier4 };
  }, []);
  const allItems = useMemo((): Items => {
    return { ...allCraftedItems, ...atmospheric, ...natural };
  }, [allCraftedItems]);

  // TODO: move to const
  const methods = useMemo((): MethodsType => {
    return {
      "Atmospheric Condenser": "[/Atmospheric Condenser\\]",
      "Backpack Printer": "[[Backpack Printer]]",
      "Chemistry Lab": "[/Chemistry Lab\\]",
      "Large Printer": "[[Large Printer]]",
      "Medium Printer": "[[Medium Printer]]",
      "Small Printer": "[[Small Printer]]",
      "Smelting Furnace": "[(Smelting Furnace)]",
    };
  }, []);

  const bleh = useCallback(
    ({ depth, name }: { depth: number; name: string }): SomeThing => {
      // console.log("bleh", depth);
      setMaxDepth((m) => Math.max(m, depth));
      // console.log("asdfwet");

      const { method, planets, sources } = allItems[name] ?? {};

      if (planets !== undefined) {
        // if (method === "Atmospheric Condenser") {
        //   setHasCondenser(true);
        // }
        method === "Atmospheric Condenser"
          ? setHasCondenser(true)
          : setHasOtherMachines(true);
      }

      const sourceList = sources
        ?.sort()
        .map((s) => bleh({ depth: depth + 1, name: s }));

      return {
        name,
        ...(method !== undefined && { method }),
        ...(planets !== undefined && { planets }),
        ...(sources !== undefined && { sources: sourceList }),
      };
    },
    [allItems],
  );

  console.log("outside maxdepth", maxDepth);
  const buildChart = useCallback(
    (asdf: SomeThing, id = "0"): string[] => {
      const { method, planets, sources } = asdf;
      // console.log("buildchart maxdepth", maxDepth);
      const prevId = id.replace(/-\d+$/, "");
      const depth = (id.match(/-/g) || []).length;
      // const dash = "-".repeat((maxDepth - depth) * 2);
      console.log("asdf", maxDepth, depth);
      // const dash = "--";
      const str: string[] = [];

      const calc = Math.max(maxDepth - depth, 0);
      const dash = maxDepth === 0 ? "--" : "-".repeat(calc * 2);

      if (planets !== undefined) {
        if (method !== undefined) {
          str.push(`planet${id}([${planets.join("<br>")}]) --> method${id}`);
          str.push(`method${id}${methods[method]} --> item${id}`);
        } else {
          const dash = hasCondenser && hasOtherMachines ? "-" : "";
          str.push(
            `planet${id}([${planets.join("<br>")}]) ${dash}--> item${id}`,
          );
        }
        str.push(`class planet${id} planettt`);

        str.push(`item${id}[${asdf.name}] ${dash}--> method${prevId}`);
        str.push(`class item${id} compoundElement`);
      } else if (sources !== undefined) {
        const methodStr = id !== "0" ? ` --> method${prevId}` : "";
        str.push(`item${id}[${asdf.name}] ${methodStr}`);
        str.push(`class item${id} compoundElement`);
        str.push(`method${id}${methods[method!]} --> item${id}`);
      }

      if (sources !== undefined) {
        sources.forEach((source, i) => {
          const nextId = `${id}-${i}`;
          str.push(...buildChart(source, nextId));
        });
      }

      return str;
    },
    [hasCondenser, hasOtherMachines, maxDepth, methods],
  );

  const processItem2 = useCallback(
    (name: string): string => {
      // let maxDepth = 0;

      const asdf = bleh({ depth: 0, name });
      // console.log("max", maxDepth);
      console.log("asdf", asdf);

      const str = [
        "graph TD",
        "classDef rootElement fill:#6f9",
        "classDef compoundElement fill:#f96",
        "classDef planettt fill:#6f9",
      ];

      return str.concat(buildChart(asdf)).join(";\n");
    },
    [bleh, buildChart],
  );

  const graph = useMemo((): string => {
    if (element === undefined) {
      return DEFAULT;
    }

    setMaxDepth(0);
    setHasCondenser(false);
    setHasOtherMachines(false);
    const blah = processItem2(element);

    // console.log("processItem2", blah);

    return blah;
  }, [element, processItem2]);

  const handleChange = useCallback((e: { target: { value: string } }) => {
    setElement(e.target.value);
  }, []);

  useEffect(() => {
    if (element === undefined) {
      return;
    }

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
  }, [element, graph]);

  useEffect(() => {
    if (craftFlowRef.current) {
      mermaid.mermaidAPI.initialize({ startOnLoad: true });
      setElement(DEFAULT);
    }
  }, []);

  console.log("\n\n\n");

  return (
    <>
      <select onChange={handleChange} value={element}>
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
