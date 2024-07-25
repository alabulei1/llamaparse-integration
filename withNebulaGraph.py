import os
from dotenv import load_dotenv
from llama_index.llms.openai_like import OpenAILike
from llama_index.llms.openai import OpenAI
from llama_index.core import Settings

from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.core import SimpleDirectoryReader,StorageContext,KnowledgeGraphIndex

from llama_index.graph_stores.neo4j import Neo4jGraphStore
from embeddings.llamaedge import OpenAILikeEmbedding

import logging
import sys

load_dotenv()

logging.basicConfig(
    stream=sys.stdout, level=logging.INFO
)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))

apiBase = os.getenv('OPENAI_BASE_URL')
chatModel = os.getenv('LLAMAEDGE_CHAT_MODEL')
embeddedModel = os.getenv('LLAMAEDGE_EMBEDDING_MODEL')
apiKey = os.getenv("OPENAI_API_KEY")
fileDir = os.getenv("FILE_DIR")

username = "neo4j"
password = "0413Jyc!"
url = "bolt://localhost:7687"
database = "neo4j"

# llm = OpenAI(api_key=apiKey)
#
# embedding_model = OpenAIEmbedding(
#     api_key=apiKey
# )

llm = OpenAILike(model=chatModel, api_base=apiBase, api_key=apiKey)

embedding_model = OpenAILikeEmbedding(
    model=embeddedModel,
    api_base=apiBase
)

Settings.llm = llm
Settings.embed_model = embedding_model

documents = SimpleDirectoryReader(fileDir).load_data()

graph_store = Neo4jGraphStore(
    username=username,
    password=password,
    url=url,
    database=database,
)

storage_context = StorageContext.from_defaults(graph_store=graph_store)

index = KnowledgeGraphIndex.from_documents(
    documents,
    storage_context=storage_context,
    max_triplets_per_chunk=2,
    include_embeddings=True
)

query_engine = index.as_query_engine(
    include_text=True,
    response_mode="tree_summarize",
    embedding_mode="hybrid",
    similarity_top_k=5
)

response = query_engine.query(
    "Tell me more about what the author worked on at RACG"
)