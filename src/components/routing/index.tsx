import { useMemo } from "react";
import { Resources } from "types";
import { atmospheric, natural } from "data";

import "./style.scss";

export const Routing = ({ resources }: { resources: object }): JSX.Element => {
  const allNaturalItems = useMemo((): Resources => {
    return { ...atmospheric, ...natural };
  }, []);

  const sortedResourceList = useMemo((): string[] => {
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

  const planetLists = useMemo((): string[][] => {
    return Object.values(sortedResourceList).map(
      (mineral) => allNaturalItems[mineral].planets!,
    );
  }, [allNaturalItems, sortedResourceList]);

  const allCombinations = useMemo((): string[][] => {
    const combinations: string[][] = [[]];

    planetLists.forEach((planetList) => {
      const currentResult: string[][] = [];
      combinations.forEach((combo) => {
        planetList.forEach((value) => {
          currentResult.push([...combo, value]);
        });
      });

      combinations.length = 0;
      combinations.push(...currentResult);
    });

    return combinations;
  }, [planetLists]);

  const chosenRoute = useMemo((): string[] => {
    return [
      ...allCombinations
        .map((p) => new Set(p))
        .sort((a, b) => a.size - b.size)[0],
    ];
  }, [allCombinations]);

  const routeData = useMemo((): [string, string[]][] => {
    return Object.entries(
      Array.from(new Set(Object.keys(resources))).reduce(
        (storage: { [key: string]: string[] }, resource) => {
          const planet = allNaturalItems[resource].planets?.filter((p) =>
            chosenRoute.includes(p),
          )[0];

          if (planet === undefined) {
            return storage;
          }

          storage[planet] =
            storage[planet] !== undefined ? storage[planet] : [];
          storage[planet].push(resource);
          return storage;
        },
        {},
      ),
    ).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allNaturalItems, chosenRoute, resources]);

  return (
    <div className="routing">
      <h4>Possible Planet Route</h4>
      <ul>
        {routeData.map((x) => {
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
