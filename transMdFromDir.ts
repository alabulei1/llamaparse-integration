import * as dotenv from "dotenv";
import {promises as fs} from 'fs';
import {SimpleDirectoryReader} from "llamaindex";

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

    const dir = process.env.FILE_DIR;

    const reader = new SimpleDirectoryReader();

    if (dir) {
        const documents = await reader.loadData(dir)

        documents.forEach(data => {
            saveMarkdown(data.text, process.env.SAVE_MARKDOWN_PATH || "./output.md")

        })
    }
}

main().catch(console.error);