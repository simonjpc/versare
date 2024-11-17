from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    StorageContext,
    load_index_from_storage,
)
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter


# set number of docs to retreive
def get_most_similar_chunks(query, top_k: int = 3):

    # Rebuild storage context
    storage_context = StorageContext.from_defaults(persist_dir="ccap_index")

    model_embedder_name = "Alibaba-NLP/gte-large-en-v1.5"
    Settings.embed_model = HuggingFaceEmbedding(
        model_name=model_embedder_name, trust_remote_code=True
    )
    Settings.llm = None
    Settings.text_splitter = SentenceSplitter(chunk_size=256)
    # Load index from the storage context
    index = load_index_from_storage(storage_context)
    # index = VectorStoreIndex.load_from_disk("ccap_index")

    # configure retriever
    retriever = VectorIndexRetriever(
        index=index,
        similarity_top_k=top_k,
    )

    # assemble query engine
    query_engine = RetrieverQueryEngine(
        retriever=retriever,
        node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.2)],
    )

    # query documents - testing

    response = query_engine.query(query)
    context = ""
    for i in range(top_k):
        context = context + response.source_nodes[i].text + "\n\n"
    print("retrieval output: \n", context)
    return context
