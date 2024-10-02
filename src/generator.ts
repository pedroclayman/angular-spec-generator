import { compile } from 'handlebars';
import { ParsedOutput } from './model.js';
import * as fs from 'fs';
import * as path from 'path';

const readTemplate = async () => {
    const templatePath = path.join(__dirname, '../templates/test.template.handlebars');
    return (await fs.promises.readFile(templatePath, 'utf8')).toString();
};

export const generate = async (model: ParsedOutput) => {
    const fileContents = await readTemplate();
    const compiledTemplate = compile(fileContents);
    return compiledTemplate(model);
};
