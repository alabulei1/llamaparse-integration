import * as dotenv from "dotenv";

import {
    LlamaParseReader,
    MetadataMode,
    NodeWithScore,
    OpenAI,
    OpenAIEmbedding,
    QdrantVectorStore,
    Settings, SimpleDirectoryReader,
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
    const dir = process.env.FILE_DIR;
    let path = process.env.FILE_PATH;
    let reader
    if(dir) {
        const isDir = await rl.question("Do you want to read from the folder(Y or N)");
        if(!isDir || isDir.toUpperCase() === "Y") {
            path = dir
            reader = new SimpleDirectoryReader();
        }else {
            reader = new LlamaParseReader({resultType: "markdown"});
        }
    }else {
        reader = new LlamaParseReader({resultType: "markdown"});
    }

    if(path){
        const documents = await reader.loadData(path)

        const collectionName = process.env.COLLECTION_NAME || "default";
        const qdrantUrl = process.env.QDRANT_URL || "http://127.0.0.1:6333";
        const qdrantVs = new QdrantVectorStore({url: qdrantUrl, collectionName});
        const ctx = await storageContextFromDefaults({vectorStore: qdrantVs});

        const index = await VectorStoreIndex.fromDocuments(documents, {
            storageContext: ctx,
        });
        while (true){
            const query = await rl.question("Query: ");
            const queryEngine = index.asQueryEngine();
            const {response, sourceNodes} = await queryEngine.query({
                query
            });

            process.stdout.write("Answer:"+response);

            if (sourceNodes) {
                sourceNodes.forEach((source: NodeWithScore, index: number) => {
                    console.log(
                        `\n${index}: Score: ${source.score} - ${source.node.getContent(MetadataMode.NONE).substring(0, 50)}...\n`,
                    );
                });
            }
        }

        // rl.close();
    }
}

main().catch(console.error);