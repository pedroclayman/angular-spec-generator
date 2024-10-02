# Angular spec generator

This project represents a utility that generates Angular spec files for components, services, directives and pipes.
In addition to the standard spec files that are generated when using angular cli schematics, 
this utility also generates mocks based on the constructor parameters.
It uses the `ts-mocks` library to generate the mocks.

## Installation

```bash
npm install -g @peter.mihalik/angular-spec-generator
```

## Usage
    
```bash
asg generate -f <file_path>
```
or
```bash
asg generate --file <file_path>
```
The `file_path` is the path to the file that you want to generate the spec file for.
The file that will be generated will have the same name as the original file, but with the `.spec.ts` suffix.
Should the file already exist, an index starting at 1 will be appended to the file name.
