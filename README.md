# llamaparse-integration

This repo guides you to integrate LlamaParse (created by LlamaIndex) with LlamaEdge/GaiaNet to create embeddings/convert file formats for you to use.

## Setups

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

You can use LlamaEdge or Gaianet to run a general LLM and embedding model. Please to be noted, if you're using GaiaNet, the `snapshot` filed in the `config.json` folder should be empty.

### Set up the model setting

You can configure your model setting in the `.env` file. Remember to make some changes according to your model setting and file path.

```
OPENAI_BASE_URL=http://127.0.0.1:8080/v1
OPENAI_API_KEY=LLAMAEDGE
LLAMAEDGE_CHAT_MODEL=Phi-3-mini-4k-instruct
LLAMAEDGE_EMBEDDING_MODEL=nomic-embed-text-v1.5.f16
LLAMA_CLOUD_API_KEY=llx-XXX
FILE_PATH=2406.14497v1.pdf
COLLECTION_NAME=default
QDRANT_URL=http://127.0.0.1:6333
```

You can get the LlamaCloud key from https://cloud.llamaindex.ai


## Run the LlamaParse to create embeddings based on PDF files

```
npx tsx pdfRender.ts
```
Then, the terminal will pop up a question to ask for running with one PDF file or multiple PDF files. If you enter Y, the program will create a RAG app for the pdf files from the `/pdf_dir` folder, which can include multiple files. If you enter N, the program will create an RAG app for the PDF file specified by the `.env` file.

```
Do you want to read from the folder(Y or N)
```
After it runs successfully, you can send a query via the command line.
<img width="1462" alt="image" src="https://github.com/alabulei1/llamaparse-integration/assets/45785633/df811b58-26e4-43c8-82e2-ef4cf97114d1">

## Run the LlamaParse to convert a PDF file to an MD file

```
npx tsx transMd.ts
```
In this case, you don't need to set up the LLM model-related parameters. The output MD file will be located in this folder named `output.md` by default. You can change the path in the `.env` file.

## Run the Llamaparse to convert multiple PDF files to one MD file

Upload your pdf files to the `/pdf_dir` folder.

```
npx tsx transMdFromDir.ts
```
In this case, you don't need to set up the LLM model-related parameters. The output MD file will be located in this folder named `output.md` by default. You can change the path in the `.env` file.

## Supported file formats

Supported formats include: .pdf, .602, .abw, .cgm, .cwk, .doc, .docx, .docm, .dot, .dotm, .do
tx, .hwp, .key, .lwp, .mw, .mcw, .pages, .pbd, .ppt, .pptm, .pptx, .pot, .potm, .potx, .rtf, .sda, .sdd, .sdp, .sdw, .sgl, .sti, .sxi, .sxw, .stw, .sxg, .txt, .uof, .uop, .uot, .vor, .wpd, .wps, .xml, .zabw, .epub, .jpg, .jpeg, .png, .gif, .bmp, .svg, .tiff, .webp, .htm, .html, .xlsx, .xls, .xlsm, .xlsb, .xlw, .csv, .dif, .sylk, .slk, .prn, .numbers, .et, .ods, .fods, .uos1, .uos2, .dbf, .wk1, .wk2, .wk3, .wk4, .wks, .123, .wq1, .wq2, .wb1, .wb2, .wb3, .qpw, .xlr, .eth, .tsv
