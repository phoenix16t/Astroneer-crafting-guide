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

export enum Methods {
  "AC" = "[/Atmospheric<br />Condenser\\]",
  "BP" = "[[Backpack<br />Printer]]",
  "CL" = "{{Chemistry<br />Lab}}",
  "LP" = "[[Large<br />Printer]]",
  "MP" = "[[Medium<br />Printer]]",
  "SP" = "[[Small<br />Printer]]",
  "SF" = "[(Smelting<br />Furnace)]",
}
