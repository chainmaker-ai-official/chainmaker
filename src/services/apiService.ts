export interface Node {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  subcategory: string;
  status: string;
  phase?: number;
  tags?: string[];
  color?: string;
}

export const fetchAvailableNodes = async (): Promise<Node[]> => {
  const response = await fetch("/api/nodes");
  if (!response.ok) {
    throw new Error("Failed to fetch available nodes");
  }
  return response.json();
};

export const saveDesignerData = async (data: any): Promise<void> => {
  const response = await fetch("/api/designer/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to save designer data");
  }
};

export const loadDesignerData = async (): Promise<any> => {
  const response = await fetch("/api/designer/load");
  if (!response.ok) {
    throw new Error("Failed to load designer data");
  }
  return response.json();
};
