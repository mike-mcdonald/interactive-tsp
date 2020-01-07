export interface TextSection {
  id: string;
  name: string;
  number: number;
  tree: number[];
  depth: number;
  content: string;
  sections?: TextSection[];
}

export interface TextState {
  sections?: TextSection[];
  index?: lunr.Index;
  candidates?: TextSection[];
}
