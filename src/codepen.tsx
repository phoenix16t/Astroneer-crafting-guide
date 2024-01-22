// const { useCallback, useEffect, useMemo, useRef, useState } = React;

// export type Resource = {
//   method?: string;
//   planets?: string[];
//   sources?: string[];
// };

// export type Resources = {
//   [key: string]: Resource;
// };

// export type ResourceCount = {
//   [key: string]: number;
// };

// export type TreeNode = {
//   name: string;
//   method?: string | undefined;
//   planets?: string[] | undefined;
//   sources?: TreeNode[] | undefined;
// };

// export enum Methods {
//   "AC" = "[/Atmospheric<br />Condenser\\]",
//   "BP" = "[[Backpack<br />Printer]]",
//   "CL" = "{{Chemistry<br />Lab}}",
//   "LP" = "[[Large<br />Printer]]",
//   "MP" = "[[Medium<br />Printer]]",
//   "SP" = "[[Small<br />Printer]]",
//   "SF" = "[(Smelting<br />Furnace)]",
// }

// const DEFAULT = "RTG";

// const STR = [
//   "classDef naturalElement fill:#0f0",
//   "classDef craftedItem fill:#f96",
//   "classDef planet fill:#6ff",
//   "classDef method fill:#ddd",
// ];

// export const Routing = ({ resources }: { resources: object }): JSX.Element => {
//   const allNaturalItems = useMemo((): Resources => {
//     return { ...atmospheric, ...natural };
//   }, []);

//   const sortedResourceList = useMemo((): string[] => {
//     return Object.keys(resources)
//       .filter((resource) => {
//         return allNaturalItems[resource].planets!.length < 7;
//       })
//       .sort((a, b) => {
//         return (
//           allNaturalItems[a].planets!.length -
//           allNaturalItems[b].planets!.length
//         );
//       });
//   }, [allNaturalItems, resources]);

//   const planetLists = useMemo((): string[][] => {
//     return Object.values(sortedResourceList).map(
//       (mineral) => allNaturalItems[mineral].planets!,
//     );
//   }, [allNaturalItems, sortedResourceList]);

//   const allCombinations = useMemo((): string[][] => {
//     const combinations: string[][] = [[]];

//     planetLists.forEach((planetList) => {
//       const currentResult: string[][] = [];
//       combinations.forEach((combo) => {
//         planetList.forEach((value) => {
//           currentResult.push([...combo, value]);
//         });
//       });

//       combinations.length = 0;
//       combinations.push(...currentResult);
//     });

//     return combinations;
//   }, [planetLists]);

//   const chosenRoute = useMemo((): string[] => {
//     return [
//       ...allCombinations
//         .map((p) => new Set(p))
//         .sort((a, b) => a.size - b.size)[0],
//     ];
//   }, [allCombinations]);

//   const routeData = useMemo((): [string, string[]][] => {
//     return Object.entries(
//       Array.from(new Set(Object.keys(resources))).reduce(
//         (storage: { [key: string]: string[] }, resource) => {
//           const planet = allNaturalItems[resource].planets?.filter((p) =>
//             chosenRoute.includes(p),
//           )[0];

//           if (planet === undefined) {
//             return storage;
//           }

//           storage[planet] =
//             storage[planet] !== undefined ? storage[planet] : [];
//           storage[planet].push(resource);
//           return storage;
//         },
//         {},
//       ),
//     ).sort((a, b) => a[0].localeCompare(b[0]));
//   }, [allNaturalItems, chosenRoute, resources]);

//   return (
//     <div className="routing">
//       <h4>Possible Planet Route</h4>
//       <ul>
//         {routeData.map((x) => {
//           return (
//             <li key={x[0]}>
//               <div className="planet">{x[0]}</div> - {x[1].join(" / ")}
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// export const ResourceList = ({
//   resources,
// }: {
//   resources: ResourceCount;
// }): JSX.Element => {
//   const sortedResourceList = useMemo((): string[] => {
//     return Object.keys(resources).sort((a, b) => a.localeCompare(b));
//   }, [resources]);

//   return (
//     <div className="resourceList">
//       <h4>Required Resources</h4>
//       <ul>
//         {sortedResourceList.map((name) => (
//           <li key={name}>
//             {name}: {resources[name as keyof typeof resources]}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// const Graph = ({
//   direction,
//   hasCondenser,
//   hasOtherMachines,
//   maxDepth,
//   tree,
// }: {
//   direction: string;
//   hasCondenser: boolean;
//   hasOtherMachines: boolean;
//   maxDepth: number;
//   tree: TreeNode | undefined;
// }): JSX.Element => {
//   const craftFlowRef = useRef<HTMLDivElement | null>(null);

//   const extendedArrow = useMemo(() => {
//     return hasCondenser && hasOtherMachines ? "--->" : "-->";
//   }, [hasCondenser, hasOtherMachines]);

//   const buildChart = useCallback(
//     ({ treeNode, id = "0" }: { treeNode: TreeNode; id?: string }): string[] => {
//       const { method, name, planets, sources } = treeNode;

//       const depth = (id.match(/-/g) || []).length;
//       const distance = maxDepth - depth;
//       const dashes = planets ? "-".repeat(distance * 2) : "";
//       const prevId = id.replace(/-\d+$/, "");
//       const methodInput = id !== "0" ? `${dashes}--> method${prevId}` : "";
//       const planetList = `planet${id}([${(planets || []).join("<br>")}])`;
//       const isAtmosphericItem =
//         atmospheric[name as keyof typeof atmospheric] !== undefined;
//       const isNaturalItem = natural[name as keyof typeof natural] !== undefined;
//       const graphSteps: string[] = [];

//       // add planet info
//       if (isAtmosphericItem) {
//         graphSteps.push(`${planetList} --> method${id}`);
//       } else if (isNaturalItem) {
//         graphSteps.push(`${planetList} ${extendedArrow} item${id}`);
//       }

//       // add method info
//       if (!isNaturalItem) {
//         const methodName = Methods[method as keyof typeof Methods];
//         graphSteps.push(`method${id}${methodName} --> item${id}`);
//       }

//       // add item info
//       graphSteps.push(`item${id}(${name})${methodInput}`);

//       // add styling
//       if (planets) {
//         graphSteps.push(`class planet${id} planet`);
//         graphSteps.push(`class item${id} naturalElement`);
//       } else {
//         graphSteps.push(`class item${id} craftedItem`);
//       }
//       if (!isNaturalItem) {
//         graphSteps.push(`class method${id} method`);
//       }

//       (sources || []).forEach((source, i) => {
//         graphSteps.push(...buildChart({ treeNode: source, id: `${id}-${i}` }));
//       });

//       return graphSteps;
//     },
//     [extendedArrow, maxDepth],
//   );

//   useEffect(() => {
//     if (tree === undefined) {
//       return;
//     }

//     const graph = [`graph ${direction}`, ...STR]
//       .concat(buildChart({ treeNode: tree }))
//       .join(";\n");

//     mermaid.mermaidAPI
//       .render("flow", graph, craftFlowRef.current || undefined)
//       .then((result) => {
//         if (craftFlowRef.current) {
//           craftFlowRef.current.innerHTML = result.svg;
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }, [buildChart, direction, tree]);

//   return <div ref={craftFlowRef} />;
// };

// const Astroneer = ({
//   direction = "TB",
// }: {
//   direction: string;
// }): JSX.Element => {
//   const [item, setItem] = useState<string>(DEFAULT);
//   const [maxDepth, setMaxDepth] = useState<number>(0);
//   const [tree, setTree] = useState<TreeNode | undefined>(undefined);
//   const [hasCondenser, setHasCondenser] = useState<boolean>(false);
//   const [hasOtherMachines, setHasOtherMachines] = useState<boolean>(false);
//   const [currentResources, setCurrentResources] = useState<ResourceCount>({});
//   const craftFlowRef = useRef<HTMLDivElement | null>(null);

//   const allCraftedItems = useMemo((): Resources => {
//     return { ...refined, ...tier1, ...tier2, ...tier3, ...tier4 };
//   }, []);

//   const allItems = useMemo((): Resources => {
//     return { ...allCraftedItems, ...atmospheric, ...natural };
//   }, [allCraftedItems]);

//   const getBranch = useCallback(
//     ({
//       name,
//       depth = 0,
//       resources = {},
//     }: {
//       name: string;
//       depth?: number;
//       resources?: { [key: string]: number };
//     }): TreeNode => {
//       setMaxDepth((m) => Math.max(m, depth));

//       const { method, planets, sources } = allItems[name] ?? {};

//       if (planets !== undefined) {
//         method === "AC" ? setHasCondenser(true) : setHasOtherMachines(true);
//         resources[name] =
//           resources[name] === undefined ? 1 : resources[name] + 1;
//       }

//       const sourceList = sources?.sort().map((name) => {
//         return getBranch({
//           name,
//           depth: depth + 1,
//           resources,
//         });
//       });

//       return {
//         name,
//         ...(method !== undefined && { method }),
//         ...(planets !== undefined && { planets }),
//         ...(sources !== undefined && { sources: sourceList }),
//       };
//     },
//     [allItems],
//   );

//   const handleChange = useCallback((e: { target: { value: string } }): void => {
//     setMaxDepth(0);
//     setHasCondenser(false);
//     setHasOtherMachines(false);
//     setTree(undefined);

//     setItem(e.target.value);
//   }, []);

//   // initialize mermaid
//   useEffect(() => {
//     if (craftFlowRef.current) {
//       mermaid.mermaidAPI.initialize({ startOnLoad: true });
//     }
//   }, []);

//   // generate tree data
//   useEffect(() => {
//     const resources = {}; // closure
//     const treeData = getBranch({ name: item, resources });

//     setCurrentResources(resources);
//     setTree(treeData);
//   }, [getBranch, item]);

//   return (
//     <div className="app">
//       <div className="selection">
//         <select onChange={handleChange} value={item}>
//           {Object.keys(allCraftedItems)
//             .sort()
//             .map((itemName) => {
//               return (
//                 <option key={itemName} value={itemName}>
//                   {itemName}
//                 </option>
//               );
//             })}
//         </select>
//       </div>

//       <div className="graph">
//         <Graph
//           direction={direction}
//           hasCondenser={hasCondenser}
//           hasOtherMachines={hasOtherMachines}
//           maxDepth={maxDepth}
//           tree={tree}
//         />
//       </div>

//       <div className="informationPanel">
//         <ResourceList resources={currentResources} />
//         <Routing resources={currentResources} />
//       </div>
//     </div>
//   );
// };

// const App = (): JSX.Element => {
//   const [direction, setDirection] = useState('LR');

//   const directions = [
//     { value: "TB", name: "top bottom" },
//     { value: "BT", name: "bottom top" },
//     { value: "LR", name: "left right" },
//     { value: "RL", name: "right left" },
//   ];

//   const menus = useMemo(() => {
//     return [
//       {
//         label: "Controls",
//         items: [
//           {
//             label: "graph direction",
//             state: direction,
//             control: setDirection,
//             type: "select",
//             options: directions
//           }
//         ]
//       }
//     ];
//   }, [direction]);

//   return (
//     <>
//       <Astroneer direction={direction} />

//       <EdjMenu menus={menus} />
//     </>
//   );
// };

// ReactDOM.render(<App />, document.getElementById("root"));
