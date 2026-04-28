export interface BoardWidgetDocument {
  id: string;
  title: string;
  date: string;
  summary: string;
  category?: string;
}

export interface BoardWidgetItem {
  mid: string;
  moduleTitle: string;
  document?: BoardWidgetDocument;
}

export interface BoardWidgetResponse {
  items: BoardWidgetItem[];
}
