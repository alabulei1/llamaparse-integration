import * as dotenv from "dotenv";
import { promises as fs } from 'fs';

import {
    LlamaParseReader,
    MetadataMode,
    NodeWithScore,
    OpenAI,
    OpenAIEmbedding,
    QdrantVectorStore,
    Settings,
    storageContextFromDefaults,
    VectorStoreIndex,
} from "llamaindex";
import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "process";

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

    Settings.llm = new OpenAI({model: process.env.LLAMAEDGE_CHAT_MODEL, temperature: 0});
    Settings.embedModel = new OpenAIEmbedding({model: process.env.LLAMAEDGE_EMBEDDING_MODEL});

    const path = process.env.FILE_PATH;

    const reader = new LlamaParseReader({resultType: "markdown"});

    if(path){
        const documents = await reader.loadData(path)

        saveMarkdown(documents[0].text, process.env.SAVE_MARKDOWN_PATH || "./output.md")
    }
}

main().catch(console.error);