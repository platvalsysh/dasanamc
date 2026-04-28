import type { User } from "@repo/auth/types";
import type { comments, documents, modules } from "@repo/database";
import type { BoardExtraVarsShape } from "../../BoardExtraVars";
import type { PostExtraVarsShape } from "../../PostExtraVars";

// Define compatible types for skins
export type Board = Omit<modules, "extra_vars"> & {
  extra_vars?: BoardExtraVarsShape | null;
};

export type Post = Omit<documents, "extra_vars"> & {
  extra_vars?: PostExtraVarsShape | null;
  users?: User | null;
};

export type Comment = comments & {
  users?: User | null;
  children?: Comment[]; // For threaded recursive rendering if needed in future
};

export type Category = {
  id: string;
  module_id: string;
  seq: number;
  name: string;
  path: string | null;
  depth: number;
  parent_id: string | null;
  list_order: number;
  document_count: number;
};


