import fitz
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex, Document
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from transformers import AutoModelForCausalLM, AutoTokenizer
from llama_index.core.node_parser import SentenceSplitter


# Function to read PDF content
def parse_pdf(file_path):
    pdf_document = fitz.open(file_path)
    text = ""

    # Extract text from each page
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        text += page.get_text()

    pdf_document.close()
    return text


pdf_path = "/Users/simon/Documents/perso/repos/versare/test_folders/folder 2/mesicic4_hti_CNMP_trav-col.pdf"  # Replace with your PDF file
pdf_text = parse_pdf(pdf_path)
print("document parsed")
model_embedder_name = "Alibaba-NLP/gte-large-en-v1.5"

Settings.embed_model = HuggingFaceEmbedding(
    model_name=model_embedder_name, trust_remote_code=True
)
Settings.text_splitter = SentenceSplitter(chunk_size=256)
document = Document(text=pdf_text)

index = VectorStoreIndex.from_documents(documents=[document])
print("index created")

# Persist index to disk
index.storage_context.persist("ccap_index")
print("index saved")
