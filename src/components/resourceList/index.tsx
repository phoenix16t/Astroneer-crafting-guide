import { useMemo } from "react";
import { ResourceCount } from "types";

import "./style.scss";

export const ResourceList = ({
  resources,
}: {
  resources: ResourceCount;
}): JSX.Element => {
  const sortedResourceList = useMemo((): string[] => {
    return Object.keys(resources).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  return (
    <div className="resourceList">
      <h4>Required Resources</h4>
      <ul>
        {sortedResourceList.map((name) => (
          <li key={name}>
            {name}: {resources[name as keyof typeof resources]}
          </li>
        ))}
      </ul>
    </div>
  );
};
