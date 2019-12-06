export interface TextSection {
  id: String;
  name: String;
  number: number;
  tree: number[];
  depth: number;
  content: String;
  sections?: TextSection[];
}

export interface TextState {
  sections?: TextSection[];
}
