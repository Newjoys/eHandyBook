
export type NodeType = 
  | 'envelope' 
  | 'drawer' 
  | 'flipbox' 
  | 'news' 
  | 'accordion' 
  | 'wanted' 
  | 'suit' 
  | 'window' 
  | 'polaroid'
  | 'record'
  | 'filmroll'
  | 'text'
  | 'sticker'
  | 'custom';

export type ScrapbookStyle = 'classic' | 'spiral_accordion';

export interface UserSticker {
  id: string;
  url: string;
  name: string;
  tags?: string[];
}

export interface PropDefinition {
  key: string;
  label: string;
  type: 'range' | 'color' | 'text' | 'select' | 'audio';
  options?: { label: string, value: string | number }[]; 
  min?: number;
  max?: number;
  def: string | number;
  unit?: string;
}

export interface Template {
  type: NodeType;
  name: string;
  icon: string;
  props: PropDefinition[];
}

export interface NodeData {
  id: number;
  type: NodeType;
  x: number;
  y: number;
  props: Record<string, any>;
  imgBg: string;
  imgTop?: string;
  isOpen: boolean;
}

export interface Connection {
  from: number;
  to: number;
}

export interface ScrapbookCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ScrapbookPage {
  id: number;
  nodes: NodeData[];
  connections: Connection[];
}

export interface Scrapbook {
  id: number;
  title: string;
  cover: string;
  categoryId: string;
  style: ScrapbookStyle;
  pages: ScrapbookPage[];
  lastModified: number;
}

export type ViewState = 'home' | 'projects' | 'templates' | 'editor' | 'preview';
