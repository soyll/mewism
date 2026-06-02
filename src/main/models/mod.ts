export type ModMetadata = Record<string, unknown>;

export type ModData = {
  name: string;
  path: string;
  enabled: boolean;
  missing: boolean;
  metadata: ModMetadata;
  preview_path: string | null;
  has_unmet_requirements: boolean;
  has_dlls?: boolean;
};

export class Mod {
  name: string;
  path: string;
  enabled: boolean;
  missing: boolean;
  metadata: ModMetadata;
  preview_path: string | null;
  has_unmet_requirements: boolean;
  has_dlls = false;

  constructor(params: {
    name: string;
    path: string;
    enabled?: boolean;
    missing?: boolean;
    metadata?: ModMetadata;
    preview_path?: string | null;
    has_unmet_requirements?: boolean;
    has_dlls?: boolean;
  }) {
    this.name = params.name;
    this.path = params.path;
    this.enabled = params.enabled ?? false;
    this.missing = params.missing ?? false;
    this.metadata = params.metadata ?? {};
    this.preview_path = params.preview_path ?? null;
    this.has_unmet_requirements = params.has_unmet_requirements ?? false;
    this.has_dlls = params.has_dlls ?? false;
  }

  get title(): string {
    const meta = this.metadata;
    return (
      (meta.title as string) ||
      (meta.name as string) ||
      this.name
    );
  }

  get author(): string {
    return (this.metadata.author as string) ?? "Unknown";
  }

  get version(): string {
    return (this.metadata.version as string) ?? "Unknown";
  }

  get description(): string {
    return (this.metadata.description as string) ?? "";
  }

  get url(): string {
    return (this.metadata.url as string) ?? "";
  }

  get requirements(): unknown[] {
    const reqs = this.metadata.requirements;
    return Array.isArray(reqs) ? reqs : [];
  }

  get dll_order(): string[] | null {
    const order = this.metadata.dll_order;
    if (!Array.isArray(order) || order.length === 0) {
      return null;
    }
    return order as string[];
  }

  toDict(): ModData {
    return {
      name: this.name,
      path: this.path,
      enabled: this.enabled,
      missing: this.missing,
      metadata: this.metadata,
      preview_path: this.preview_path,
      has_unmet_requirements: this.has_unmet_requirements,
      has_dlls: this.has_dlls,
    };
  }
}
