import "lucide-react";
import "./types";

declare module "lucide-react" {
  export const Github: typeof import("lucide-react")["GitBranch"];
}

declare module "./types" {
  export interface ForgeHealth {
    status: string;
    service: string;
    version: string;
    capabilities: string[];
    aiProvider: {
      configured: boolean;
      provider: string;
      model: string | null;
      baseUrl: string | null;
      reason?: string;
    };
    developer?: import("./types").ForgeDeveloperStatus;
    timestamp: string;
  }
}
