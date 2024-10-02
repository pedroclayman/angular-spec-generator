export interface ParsedOutput {
    unitName: string;
    fileName: string;
    standalone: boolean;
    dependencies: Dependency[];
}

export interface Dependency {
    name: string;
    path: string;
}
