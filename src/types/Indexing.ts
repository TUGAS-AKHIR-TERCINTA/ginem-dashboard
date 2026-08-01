import { IRoot } from "./Root";

export type IndexingSourceType = "pdf" | "json";

export interface IIndexing extends IRoot {
  indexingId: number;
  content: string;
  source: string | null;
  sourceType: IndexingSourceType | null;
}
