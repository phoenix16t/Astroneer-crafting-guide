import { useMemo } from "react";

import { atmospheric, natural } from "data";

import "./style.scss";

type Item = {
  method?: string;
  planets?: string[];
  sources?: string[];
};

type Items = {
  [key: string]: Item;
};

export const Routing = ({ resources }: { resources: object }): JSX.Element => {
  const allNaturalItems = useMemo((): Items => {
    return { ...atmospheric, ...natural };
  }, []);

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

  const blah2 = [
    ...combinations.map((p) => new Set(p)).sort((a, b) => a.size - b.size)[0],
  ];

  const z = Array.from(new Set(Object.keys(resources))).reduce(
    (storage: { [key: string]: string[] }, r) => {
      const planet = allNaturalItems[r].planets?.filter((p) =>
        blah2.includes(p),
      )[0];

      if (planet === undefined) {
        return storage;
      }

      storage[planet] = storage[planet] !== undefined ? storage[planet] : [];
      storage[planet].push(r);
      return storage;
    },
    {},
  );

  console.log("z", z);

  return (
    <div className="routing">
      <h4>Possible Planet Route</h4>
      <ul>
        {Object.entries(z)
          .sort((a, b) => {
            return a[0].localeCompare(b[0]);
          })
          .map((x) => {
            return (
              <li key={x[0]}>
                <div className="planet">{x[0]}</div> - {x[1].join(" / ")}
              </li>
            );
          })}
      </ul>
    </div>
  );
};
