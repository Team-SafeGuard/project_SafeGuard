
from pymilvus import connections, Collection, utility
import os

MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = "19530"
COLLECTION_NAME = "law_rag"

try:
    connections.connect(host=MILVUS_HOST, port=MILVUS_PORT)
    print(f"Connected to Milvus at {MILVUS_HOST}:{MILVUS_PORT}")

    if utility.has_collection(COLLECTION_NAME):
        collection = Collection(COLLECTION_NAME)
        print(f"Collection '{COLLECTION_NAME}' exists.")
        print(f"Current entity count: {collection.num_entities}")
    else:
        print(f"Collection '{COLLECTION_NAME}' does not exist.")

except Exception as e:
    print(f"Error checking Milvus status: {e}")
