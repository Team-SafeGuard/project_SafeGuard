
import sys
import os

# Add current directory to path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from classification_service import classify_complaint

query = "여기 주차 때문에 애들이 위험해요. 차도 못지나가요"
print(f"Testing query: {query}")
result = classify_complaint(query)

print("\n[Result]")
print(f"Agency: {result['agency_name']}")
print(f"Confidence: {result['confidence']}")
print(f"Reasoning: {result['reasoning']}")
print("Sources:")
for src in result['sources']:
    print(f"- {src}")
