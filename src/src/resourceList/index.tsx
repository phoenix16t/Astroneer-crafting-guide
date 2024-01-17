export const ResourceList = ({
  resources,
}: {
  resources: object;
}): JSX.Element => {
  // console.log("rrr", resources);

  const sortedList = Object.keys(resources).sort((a, b) => {
    return a.localeCompare(b);
  });
  // console.log("sortedList", sortedList);

  return (
    <div className="resourceList">
      <h4>Required Resources</h4>
      <ul>
        {sortedList.map((name) => (
          <li key={name}>
            {name}: {resources[name as keyof typeof resources]}
          </li>
        ))}
      </ul>
    </div>
  );
};
