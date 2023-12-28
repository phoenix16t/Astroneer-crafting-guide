import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";

import itemsJson from "./items.json";

type Item = {
  method?: string;
  planets?: string;
  sources?: string[];
};

type Items = {
  [key: string]: Item;
};

const DEFAULT = "RTG";

export const App = (): JSX.Element => {
  const [view, setView] = useState<string | undefined>(undefined);
  const items: Items = itemsJson;
  const ref = useRef<HTMLDivElement | null>(null);

  const processItem = useCallback(
    ({ id, item }: { id: string; item: Item }): string => {
      const str = [];
      // eslint-disable-next-line no-debugger
      // debugger;
      if (item.method === "Small Printer") {
        str.push(`method${id}[[Small Printer]] --> item${id}`);
      } else if (item.method === "Chemistry Lab") {
        str.push(`method${id}[/Chemistry Lab\\] --> item${id}`);
      } else if (item.method === "Smelting Furnace") {
        str.push(`method${id}[(Smelting Furnace)] --> item${id}`);
      }

      if (item.sources) {
        item.sources.forEach((source, i) => {
          const currentId = `item${id}-${i}`;
          str.push(`item${currentId}[${source}] --> method${id}`);

          if (items[source] === undefined) {
            return;
          }

          str.push(
            processItem({
              item: items[source],
              id: `${currentId}`,
            }),
          );
        });
      }

      return str.join(";");
    },
    [items],
  );

  const graph = useMemo((): string => {
    if (view === undefined) {
      return DEFAULT;
    }

    const str = [`graph TD; item0[${view}];`];

    str.push(
      processItem({
        item: items[view],
        id: "0",
      }),
    );

    return str.join("");
  }, [items, processItem, view]);

  const handleChange = useCallback((e: { target: { value: string } }) => {
    setView(e.target.value);
  }, []);

  useEffect(() => {
    if (view === undefined) {
      return;
    }

    mermaid.mermaidAPI
      .render("preview", graph, ref.current || undefined)
      .then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [graph, view]);

  useEffect(() => {
    if (ref.current) {
      mermaid.mermaidAPI.initialize({
        startOnLoad: true,
        securityLevel: "loose",
        theme: "forest",
        logLevel: 5,
      });

      setView(DEFAULT);
    }
  }, []);

  console.log("ggg", graph);
  console.log("items", items);

  return (
    <>
      <select onChange={handleChange} value={view}>
        {Object.keys(items)
          .sort()
          .map((itemName) => {
            return (
              <option key={itemName} value={itemName}>
                {itemName}
              </option>
            );
          })}
      </select>
      <div ref={ref} />
    </>
  );
};
