# llamaparse-integration

This repo guides you to integrate LlamaParse (created by LlamaIndex) with LlamaEdge/GaiaNet to generate snapshots for you to use.

## Steps

### Set up the environment

```
git clone https://github.com/alabulei1/llamaparse-integration.git
cd llamaparse-integration
npm install llamaindex
npm install dotenv
```
### Start a Qdrant instance

```
mkdir qdrant_storage
mkdir qdrant_snapshots

nohup docker run -d -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    -v $(pwd)/qdrant_snapshots:/qdrant/snapshots:z \
    qdrant/qdrant
```

### Start running a general LLM and embedding model

You can use LlamaEdge or Gaianet to run a a general LLM and embedding model. Please to be noted, if you're using GaiaNet, the `snapshot` filed in the `config.json` folder should be empty.

### Set up the model setting

You can configure your model setting in the `.env` file. Remember to make some changes according to your model setting and file path.

```
OPENAI_BASE_URL=http://127.0.0.1:8080/v1
OPENAI_API_KEY=LLAMAEDGE
LLAMAEDGE_CHAT_MODEL=Phi-3-mini-4k-instruct
LLAMAEDGE_EMBEDDING_MODEL=Nomic-embed-text-v1.5
LLAMA_CLOUD_API_KEY=llx-XXX
FILE_PATH=XXX.pdf
COLLECTION_NAME=default
QDRANT_URL=http://127.0.0.1:6333
```

You can get the LlamaCloud key from https://cloud.llamaindex.ai

### Start a Qdrant instance

You will need to start a Qdrant instance to store the embeddings.

```
mkdir qdrant_storage
mkdir qdrant_snapshots

nohup docker run -d -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    -v $(pwd)/qdrant_snapshots:/qdrant/snapshots:z \
    qdrant/qdrant
```

### Run the LlamaParse to create embeddings

```
npx tsx pdfRender.ts
```
After it runs successfully, you can send a query via the command line.

### Generate a snapshot for the embeddings

There are two ways to generate a snapshot for the embeddings you just created.

The easiest way is to leverage Qdrant UI (http://localhost:6333/dashboard). Go to Collections and find the default collection, then go to the snapshot tab and click on Take a snapshot. Finally, you can download the snapshot.

The second way is to use the following command line to generate a snapshot

```
curl -X POST 'http://localhost:6333/collections/default/snapshots'
```

The output will be the file name of your snapshot.

After you got the snapshot, you can upload it to HuggingFace and use it when building a GaiaNet node.
