// Raw shape as it may come from the backend (old/new fields)
export type RawPrediction = {
  label?: string;                 // e.g., "overripe"
  label_pretty?: string;          // e.g., "Overripe Banana: 2 days..."
  predicted_class_name?: string;  // legacy pretty label
  confidence?: number;            // could be 0..1 OR 0..100
  confidence_percent?: number;    // legacy percent
  timings_ms?: { total?: number };
  probs?: Record<string, number>;
};

// Normalized shape your UI will use
export type Prediction = {
  label: string;                 // pretty if available, else raw, else "—"
  confidence01: number | null;   // always 0..1 (null if missing)
  timingsMs: number | null;      // latency in ms (null if missing)
  probs?: Record<string, number>;
};
