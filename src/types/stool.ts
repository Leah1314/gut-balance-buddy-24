
export interface StoolEntry {
  id?: string;
  date: Date;
  bristolType: number;
  consistency: string;
  color: string;
  notes?: string;
  photos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StoolAnalysis {
  bristolType: number;
  consistency: string;
  color: string;
  healthScore: number;
  insights: string[];
  recommendations: string[];
}
