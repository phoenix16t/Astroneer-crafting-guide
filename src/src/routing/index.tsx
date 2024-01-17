import { atmospheric, natural } from "data";
// import { useCallback, useEffect, useMemo } from "react";
import { useMemo } from "react";

type Item = {
  method?: string;
  planets?: string[];
  sources?: string[];
};

type Items = {
  [key: string]: Item;
};

export const Routing = ({ resources }: { resources: object }): JSX.Element => {
  // console.log("fff", resources);

  const allNaturalItems = useMemo((): Items => {
    return { ...atmospheric, ...natural };
  }, []);

  // Object.keys(resources).forEach((resource) => {
  //   console.log("zzzz", resource, allNaturalItems[resource]);
  // });

  const sortedList = useMemo(() => {
    return Object.keys(resources)
      .filter((resource) => {
        return allNaturalItems[resource].planets!.length < 7;
      })
      .sort((a, b) => {
        return (
          allNaturalItems[a].planets!.length -
          allNaturalItems[b].planets!.length
        );
      });
  }, [allNaturalItems, resources]);

  // console.log("allNaturalItems", allNaturalItems);
  // console.log("sortedList", sortedList);

  const cartesianProduct = (arrays: string[][]): string[][] => {
    const result: string[][] = [[]];

    arrays.forEach((array) => {
      const currentResult: string[][] = [];
      result.forEach((element) => {
        array.forEach((value) => {
          currentResult.push([...element, value]);
        });
      });

      result.length = 0;
      result.push(...currentResult);
    });

    return result;
  };

  const mineralArrays: string[][] = Object.values(sortedList).map(
    (mineral) => allNaturalItems[mineral].planets!,
  );
  const combinations = cartesianProduct(mineralArrays);

  console.log("combinations", combinations);

  const blah = combinations.map((p) => {
    return new Set(p);
  });

  console.log(
    "blah",
    [...blah.sort((a, b) => a.size - b.size)[0]].map((planet) => {
      return planet;
    }),
  );

  // useEffect(() => {
  //   // const blah = cartesianProduct(sortedList);
  //   console.log("blah", blah);
  // }, [cartesianProduct, sortedList]);

  return (
    <div className="routing">
      <h4>Possible Route</h4>
      <ul>
        {[...blah.sort((a, b) => a.size - b.size)[0]].map((planet) => {
          return <li key={planet}>{planet}</li>;
        })}
      </ul>
    </div>
  );
};
