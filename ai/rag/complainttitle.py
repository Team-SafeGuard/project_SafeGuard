import re
from kiwipiepy import Kiwi

# Kiwi 인스턴스 전역 생성 (비용 절약)
kiwi = Kiwi()

# 우선순위 키워드 정의
LOCATION_KEYWORDS = ["역", "사거리", "교차로", "학교", "아파트", "공원", "시장", "마트", "주차장", "병원", "센터", "도서관", "입구", "출구"]
COMPLAINT_KEYWORDS = ["주정차", "주차", "쓰레기", "악취", "소음", "도로", "가로등", "보수", "신고", "단속", "파손", "공사", "흡연"]

def normalize_text(text: str) -> str:
    """
    텍스트 정규화 및 전처리
    """
    if not text:
        return ""
    
    # 1. 붙임말 보정 (예: 역앞 -> 역 앞)
    # 주요 장소 접미사 + '앞', '뒤', '옆' 등
    text = re.sub(r'([가-힣]+)(앞|뒤|옆)(?=[에은는이가을를]|\s|$)', r'\1 \2', text)
    text = re.sub(r'앞에', '앞', text)
    
    # 2. 다중 공백 제거
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def summarize_text(text: str, max_length: int = 15) -> str:
    """
    민원 내용을 요약합니다. (우선순위 로직 적용)
    1. 장소 키워드
    2. 민원 행위 키워드
    3. 단순 요약
    """
    if not text:
        return "민원 내용"
        
    normalized_text = normalize_text(text)
    
    # 문장 분리 (첫 문장 사용)
    first_sentence = re.split(r'[.!?\n]', normalized_text)[0].strip()
    if not first_sentence:
        first_sentence = normalized_text[:30]

    try:
        # 형태소 분석
        tokens = kiwi.tokenize(first_sentence)
        nouns = [t.form for t in tokens if t.tag in ('NNG', 'NNP')]
        
        # Priority 1: 장소 키워드 탐색
        for noun in nouns:
            for loc in LOCATION_KEYWORDS:
                if loc in noun:
                    # 장소 키워드 발견 시
                    summary = noun
                    # 문맥상 뒤에 '앞', '뒤', '옆' 등이 있으면 붙여줌
                    # 예: "사릉역 앞"
                    if f"{noun} 앞" in first_sentence:
                        summary += " 앞"
                    elif f"{noun} 뒤" in first_sentence:
                        summary += " 뒤"
                    elif f"{noun} 옆" in first_sentence:
                        summary += " 옆"
                    return summary

        # Priority 2: 민원 행위/대상 키워드 탐색
        for noun in nouns:
            for comp in COMPLAINT_KEYWORDS:
                if comp in noun:
                    # "불법주차" -> "불법주차"
                    # 만약 "불법"과 "주차"가 떨어져 있다면?
                    # 일단 명사 그대로 반환
                    return noun
        
        # Priority 3: 단순 요약
        # 첫 문장을 적절히 자름
        if len(first_sentence) > 12:
            return first_sentence[:12].strip()
        else:
            return first_sentence

    except Exception as e:
        print(f"Kiwi analysis failed: {e}")
        return normalized_text[:12]

def parse_address(address: str) -> str:
    """
    전체 주소에서 '시/도 시/군/구' 까지만 추출합니다.
    """
    if not address:
        return ""
    
    # 주소 문자열 정리
    address = address.strip()
    parts = address.split()
    
    if len(parts) >= 2:
        city = parts[0]
        district = parts[1]
        
        # 시/도 정규화
        if city == "서울특별시": city = "서울시"
        elif city == "제주특별자치도": city = "제주도"
        elif city == "세종특별자치시": city = "세종시"
        elif city.endswith("광역시"): pass # 부산광역시 등은 그대로 쓰거나 줄이거나
        
        return f"{city} {district}"
        
    return address

def generate_complaint_title(text: str, address: str, type: str) -> str:
    """
    민원 제목을 생성합니다.
    형식: [유형] 요약 / 주소
    """
    summary = summarize_text(text)
    short_address = parse_address(address)
    
    if not summary:
        summary = "민원 내용"
        
    if short_address:
        return f"[{type}] {summary} / {short_address}"
    else:
        return f"[{type}] {summary}"
