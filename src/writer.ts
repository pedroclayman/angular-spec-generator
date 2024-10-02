import * as fs from 'node:fs';

export const getOutputFilePath = (inputFilePath: string, index: number = 0): string => {
    const outputFilePath = inputFilePath.replace(/\.ts$/, `.spec.ts${index > 0 ? `.${index}` : ''}`);
    if (fs.existsSync(outputFilePath)) {
        return getOutputFilePath(inputFilePath, index + 1);
    }
    return outputFilePath;
};

export const write = (inputFilePath: string, content: string) => {
    const outputFilePath = getOutputFilePath(inputFilePath);
    fs.writeFileSync(outputFilePath, content);
};
