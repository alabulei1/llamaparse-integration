import * as dotenv from "dotenv";
import {promises as fs} from 'fs';

import {LlamaParseReader} from "llamaindex";

async function saveMarkdown(mdContent: string, filePath: string) {
    try {
        await fs.writeFile(filePath, mdContent, 'utf8');
        console.log(`Markdown file has been saved to: ${filePath}`);
    } catch (error) {
        console.error('Error saving Markdown file:', error);
    }
}

async function main() {
    dotenv.config();


    const path = process.env.FILE_PATH;

    const reader = new LlamaParseReader({resultType: "markdown"});

    if (path) {
        const documents = await reader.loadData(path)

        saveMarkdown(documents[0].text, process.env.SAVE_MARKDOWN_PATH || "./output.md")
    }
}

main().catch(console.error);