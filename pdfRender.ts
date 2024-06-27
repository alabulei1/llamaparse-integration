import * as dotenv from "dotenv";

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

async function main() {
    dotenv.config();

    const rl = readline.createInterface({ input, output });
    Settings.llm = new OpenAI({model: process.env.LLAMAEDGE_CHAT_MODEL, temperature: 0});
    Settings.embedModel = new OpenAIEmbedding({model: process.env.LLAMAEDGE_EMBEDDING_MODEL});

    const path = process.env.FILE_PATH;

    const reader = new LlamaParseReader({resultType: "markdown"});

    if(path){
        const documents = await reader.loadData(path)

        const collectionName = process.env.COLLECTION_NAME || "default";
        const qdrantUrl = process.env.QDRANT_URL || "http://127.0.0.1:6333";
        const qdrantVs = new QdrantVectorStore({url: qdrantUrl, collectionName});
        const ctx = await storageContextFromDefaults({vectorStore: qdrantVs});

        const index = await VectorStoreIndex.fromDocuments(documents, {
            storageContext: ctx,
        });
        const query = await rl.question("Query: ");
        const queryEngine = index.asQueryEngine();
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