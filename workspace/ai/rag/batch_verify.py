
import sys
import os
import json

# Add current directory to path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from classification_service import classify_complaint

test_cases = [
    {"id":"HN-001","text":"여기 너무 시끄러워서 미치겠어요. 도대체 누가 책임지나요?"},
    {"id":"HN-002","text":"밤에 너무 어두워요. 무서워서 못 다니겠어요."},
    {"id":"HN-003","text":"차가 다 망가질 것 같아요. 진짜 지뢰밭입니다."},
    {"id":"HN-004","text":"민원 넣었는데 아직도 그대로예요. 확인 좀 해주세요."},
    {"id":"HN-005","text":"불법주차도 심하고 쓰레기도 많고 냄새도 나요. 전부 해결해주세요."},
    {"id":"HN-006","text":"요즘 더 불편해졌어요. 왜 이렇게 바뀐 거죠?"},
    {"id":"HN-007","text":"기사님이 너무 불친절하고 위험하게 운전해요."},
    {"id":"HN-008","text":"여기 사람들 맨날 이상한 거 붙이고 다녀요. 보기 싫어요."},
    {"id":"HN-009","text":"이 동네 도로 때문에 사고 날 것 같은데 아무도 안 해요."},
    {"id":"HN-010","text":"하수구인지 뭔지 모르겠는데 냄새가 계속 올라와요."},
    {"id":"HN-011","text":"공사인지 행사인지 새벽부터 확성기 소리가 들려요."},
    {"id":"HN-012","text":"버스가 안 와요. 근데 앱에는 온다는데요?"},
    {"id":"HN-013","text":"민원 넣으면 뭐하나요? 맨날 똑같아요."},
    {"id":"HN-014","text":"여기 주차 때문에 애들이 위험해요. 차도 못 지나가요."},
    {"id":"HN-015","text":"공원에 뭐가 부러져 있는데 관리가 너무 안 돼요."},
    {"id":"HN-016","text":"쓰레기가 많은 건지 냄새가 나는 건지 모르겠는데 주변이 너무 더러워요."},
    {"id":"HN-017","text":"도로도 파였고 표지판도 안 보이고 밤엔 어두워요."},
    {"id":"HN-018","text":"이거 어디에 신고해야 해요?"},
    {"id":"HN-019","text":"요즘 차가 너무 막혀요. 도로 공사 때문인가요?"},
    {"id":"HN-020","text":"갑자기 바퀴가 터졌는데 도로 상태가 이상했어요."}
]

print(f"{'ID':<10} | {'Query':<40} | {'Agency':<15} | {'Conf':<6}")
print("-" * 80)

for case in test_cases:
    result = classify_complaint(case['text'])
    query_display = case['text'][:37] + "..." if len(case['text']) > 37 else case['text']
    print(f"{case['id']:<10} | {query_display:<40} | {result['agency_name']:<15} | {result['confidence']:<6}")

