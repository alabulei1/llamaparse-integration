import * as dotenv from "dotenv";
import fs from "node:fs/promises";

import {
    Document,
    MetadataMode,
    NodeWithScore,
    OpenAI,
    OpenAIEmbedding,
    Settings,
    VectorStoreIndex,
} from "llamaindex";
import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "process";

dotenv.config();

async function main() {
    Settings.llm = new OpenAI({model: process.env.LLAMAEDGE_CHAT_MODEL, temperature: 0});
    Settings.embedModel = new OpenAIEmbedding({model: process.env.LLAMAEDGE_EMBEDDING_MODEL});
    const rl = readline.createInterface({ input, output });
    const path = process.env.FILE_PATH;
    if(path){
        const essay = await fs.readFile(path, "utf-8");

        const document = new Document({text: essay, id_: path});

        const index = await VectorStoreIndex.fromDocuments([document]);

        const queryEngine = index.asQueryEngine();
        const query = await rl.question("Query: ");
        const {response, sourceNodes} = await queryEngine.query({
            query
        });

        process.stdout.write(response);
        rl.close();

        if (sourceNodes) {
            sourceNodes.forEach((source: NodeWithScore, index: number) => {
                console.log(
                    `\n${index}: Score: ${source.score} - ${source.node.getContent(MetadataMode.NONE).substring(0, 50)}...\n`,
                );
            });
        }
    }
}

main().catch(console.error);