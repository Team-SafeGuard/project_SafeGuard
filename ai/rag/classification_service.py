from query import ask
from collections import Counter

import unicodedata

# 문서 출처 기반 기관 매핑 규칙
# 기관 코드 정의 (STT 서비스와 동기화)
AGENCY_CODES = {
    "국토교통부": 1,
    "행정안전부": 2,
    "경찰청": 3,
    "소방청": 4,
    "환경부": 5,
    "고용노동부": 6,
    "보건복지부": 7,
    "교육부": 8,
    "법무부": 9,
    "국민권익위원회": 10,
    "개인정보보호위원회": 11,
    "기타": 99
}

# 키워드 → 담당 기관 매핑
KEYWORD_TO_AGENCY = {
    "도로교통법": "경찰청",
    "주차장법": "국토교통부",
    "건축법": "국토교통부",
    "환경": "환경부",
    "물환경": "환경부",
    "자연": "환경부",
    "폐기물": "환경부",
    "하수도": "환경부",
    "개인정보": "개인정보보호위원회",
    "민원": "국민권익위원회",
    "형법": "법무부",
    "행정": "행정안전부",
    "근로기준": "고용노동부"
}

def classify_complaint(user_query):
    """
    사용자의 민원 내용을 분석하여 담당 기관을 분류합니다.
    하이브리드 검색(Vector + BM25)을 통해 관련 법령을 찾고, 
    검색된 문서의 출처(파일명)를 기반으로 담당 기관을 추론합니다.

    Args:
        user_query (str): 사용자 민원 내용

    Returns:
        dict: {
            "agency_code": int,
            "agency_name": str,
            "reasoning": str,   # 판단 근거
            "sources": list     # 검색된 법령 및 유사도 정보 리스트
        }
    """
    print(f"\n 질문: {user_query}")
    
    # 1. 관련 문서 검색
    results = ask(user_query, top_k=5)
    
    if not results:
        return {
            "agency_code": 99,
            "agency_name": "기타",
            "reasoning": "관련 법령을 찾을 수 없습니다.",
            "sources": []
        }

    # 2. 출처 분석
    agency_counts = Counter()
    
    print(" 검색된 법령 근거:")
    for r in results:
        source_nfc = unicodedata.normalize('NFC', r['source'])
        
        # 점수 로깅
        score_val = r.get('score', 0)
        rtype = r.get('type', 'unknown')
        if rtype == 'vector':
            score_desc = f"Vector: {score_val:.4f}"
        else:
            score_desc = f"{rtype.upper()}: {score_val:.2f}"
        print(f" - {source_nfc} ({score_desc})")

        # 키워드 매칭
        matched_agency = "기타"
        for key, agency in KEYWORD_TO_AGENCY.items():
            if key in source_nfc:
                matched_agency = agency
                break
        
        agency_counts[matched_agency] += 1

    # 3. 최적 기관 결정
    if not agency_counts:
        best_agency_name = "기타"
        best_count = 0
    else:
        best_agency_name = agency_counts.most_common(1)[0][0]
        best_count = agency_counts.most_common(1)[0][1]

    total_docs = len(results)
    best_agency_code = AGENCY_CODES.get(best_agency_name, 99)
    
    # 근거 텍스트 생성
    reasoning = f"검색된 연관 법령 {total_docs}건 중 {best_count}건이 '{best_agency_name}' 소관으로 식별됨."
    
    print(f"\n 판단 근거: {reasoning}")
    print(f" 추천 담당 기관: {best_agency_name} (Code: {best_agency_code})")

    # 상세 분석 결과 구성
    source_details = []
    for r in results:
        score_val = r.get('score', 0)
        rtype = r.get('type', 'unknown')
        if rtype == 'vector':
            score_desc = f"Vector: {score_val:.4f}"
        else:
            score_desc = f"{rtype.upper()}: {score_val:.4f}"
        
        source_details.append(f"{r['source']} ({score_desc})")

    return {
        "agency_code": best_agency_code,
        "agency_name": best_agency_name,
        "reasoning": reasoning,
        "sources": source_details
    }

if __name__ == "__main__":
    # Test Cases
    test_queries = [
        "집 앞에 불법주차된 차 때문에 통행이 불편해요.",
        "공장에서 폐수를 하천으로 무단 방류하고 있습니다.",
        "웹사이트에서 제 주민등록번호가 노출되었어요. 처벌 가능한가요?",
        "시청 직원이 불친절하게 민원을 처리했습니다."
    ]
    
    for q in test_queries:
        classify_complaint(q)
        print("="*60)
