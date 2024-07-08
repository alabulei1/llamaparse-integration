import * as dotenv from "dotenv";
import {promises as fs} from 'fs';

import {LlamaParseReader, SimpleDirectoryReader} from "llamaindex";

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


    let path = process.env.FILE_PATH;
    const dir = process.env.FILE_DIR;
    let reader
    if (path) {
        reader = new LlamaParseReader({resultType: "markdown"});
    } else {
        path = dir
        reader = new SimpleDirectoryReader();
    }

    if (path) {
        const documents = await reader.loadData(path)

        await saveMarkdown(documents[0].text, process.env.SAVE_MARKDOWN_PATH || "./output.md")
    }
}

main().catch(console.error);