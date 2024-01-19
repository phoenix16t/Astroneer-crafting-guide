export type Resource = {
  method?: string;
  planets?: string[];
  sources?: string[];
};

export type Resources = {
  [key: string]: Resource;
};

export type ResourceCount = {
  [key: string]: number;
};

export type TreeNode = {
  name: string;
  method?: string | undefined;
  planets?: string[] | undefined;
  sources?: TreeNode[] | undefined;
};
