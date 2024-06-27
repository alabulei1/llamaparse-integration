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


### Run the LlamaParse to create embeddings

```
npx tsx pdfRender.ts
```
After it runs successfully, you can send a query via the command line.
<img width="1462" alt="image" src="https://github.com/alabulei1/llamaparse-integration/assets/45785633/df811b58-26e4-43c8-82e2-ef4cf97114d1">


### Generate a snapshot for the embeddings

There are two ways to generate a snapshot for the embeddings you just created.

The easiest way is to leverage Qdrant UI (http://localhost:6333/dashboard). Go to Collections and find the default collection, then go to the snapshot tab and click on Take a snapshot. Finally, you can download the snapshot.

The second way is to use the following command line to generate a snapshot

```
curl -X POST 'http://localhost:6333/collections/default/snapshots'
```

The output will be the file name of your snapshot.

After you get the snapshot, you can upload it to HuggingFace and use it when building a GaiaNet node.

## Supported file formats

Supported formats include: .pdf, .602, .abw, .cgm, .cwk, .doc, .docx, .docm, .dot, .dotm, .do
tx, .hwp, .key, .lwp, .mw, .mcw, .pages, .pbd, .ppt, .pptm, .pptx, .pot, .potm, .potx, .rtf, .sda, .sdd, .sdp, .sdw, .sgl, .sti, .sxi, .sxw, .stw, .sxg, .txt, .uof, .uop, .uot, .vor, .wpd, .wps, .xml, .zabw, .epub, .jpg, .jpeg, .png, .gif, .bmp, .svg, .tiff, .webp, .htm, .html, .xlsx, .xls, .xlsm, .xlsb, .xlw, .csv, .dif, .sylk, .slk, .prn, .numbers, .et, .ods, .fods, .uos1, .uos2, .dbf, .wk1, .wk2, .wk3, .wk4, .wks, .123, .wq1, .wq2, .wb1, .wb2, .wb3, .qpw, .xlr, .eth, .tsv
