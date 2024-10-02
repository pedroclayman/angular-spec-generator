import * as ts from 'typescript';
import { Dependency, ParsedOutput } from './model.js';
import * as path from 'path';

const decorators = ['Component', 'Directive', 'Pipe', 'Service'];

const classHasDecorator = (classNode: ts.ClassDeclaration, sourceFile: ts.SourceFile) => {
    return (classNode.modifiers ?? []).some(
        (modifier: ts.ModifierLike) =>
            modifier.kind === ts.SyntaxKind.Decorator &&
            decorators.some(decorator => modifier.getText(sourceFile).indexOf(`@${decorator}`) === 0),
    );
};

const createImportMap = (sourceFile: ts.SourceFile) => {
    const importMap = new Map<string, string>();

    ts.forEachChild(sourceFile, node => {
        if (ts.isImportDeclaration(node) && node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
            node.importClause.namedBindings.elements.forEach(importSpecifier => {
                importMap.set(importSpecifier.name.text, node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, ''));
            });
        }
    });
    return importMap;
};

const getConstructorParams = (classNode: ts.Node, sourceFile: ts.SourceFile, params: string[] = []) => {
    classNode.getChildren(sourceFile).forEach(classDirectChildNode => {
        if (ts.isConstructorDeclaration(classDirectChildNode)) {
            classDirectChildNode.parameters.forEach(param => {
                const type = param.type?.getText(sourceFile);
                if (type) {
                    params.push(type);
                }
            });
        } else {
            getConstructorParams(classDirectChildNode, sourceFile, params);
        }
    });
    return params;
};

const getClassName = (classNode: ts.ClassDeclaration) => {
    return classNode.name?.text ?? 'unknown';
};

const getTopLevelClassNodes = (sourceFile: ts.SourceFile) => {
    const classNodes: ts.ClassDeclaration[] = [];

    ts.forEachChild(sourceFile, node => {
        if (ts.isClassDeclaration(node) && classHasDecorator(node, sourceFile)) {
            classNodes.push(node);
        }
    });
    return classNodes;
};

const isStandalone = (classDeclaration: ts.ClassDeclaration, sourceFile: ts.SourceFile) => {
    const decoratorModifier = (classDeclaration.modifiers ?? []).find(
        modifier =>
            ts.isDecorator(modifier) &&
            decorators.some(decorator => modifier.getText(sourceFile).indexOf(`@${decorator}`) === 0),
    ) as ts.Decorator;

    // this is a shortcut solution that should be good enough for now
    const decoratorAsString = decoratorModifier.expression.getText(sourceFile);
    return /standalone\s?:\s?true/.test(decoratorAsString);
};

export const parse = (filePath: string): ParsedOutput => {
    const fullFilePath = path.join(process.cwd(), filePath);

    const program = ts.createProgram([fullFilePath], { allowJs: true });
    const sourceFile = program.getSourceFile(fullFilePath);

    if (!sourceFile) {
        throw new Error('Source file could not be used');
    }

    const importMap = createImportMap(sourceFile);

    const classNodes = getTopLevelClassNodes(sourceFile);

    if (classNodes?.length !== 1) {
        throw new Error('Only one class with a decorator is allowed in the file');
    }

    const constructorParams = getConstructorParams(classNodes[0], sourceFile);
    const unitName = getClassName(classNodes[0]);
    const standalone = isStandalone(classNodes[0], sourceFile);
    const fileName = path.basename(fullFilePath, path.extname(fullFilePath));

    const dependencies = constructorParams.reduce((acc, item) => {
        let match = importMap.get(item);
        if (match) {
            acc.push({
                name: item,
                path: match,
            });
        }
        return acc;
    }, [] as Dependency[]);

    return {
        unitName,
        fileName,
        standalone,
        dependencies,
    };
};
