import sys
import os

# ai/rag 경로를 모듈 검색 경로에 추가
sys.path.append(os.path.join(os.getcwd(), 'ai', 'rag'))

from classification_service import classify_complaint

def main():
    print("="*60)
    print("🚀 RAG 민원 분류 대화형 테스트 모드")
    print("민원 내용을 입력하면 담당 기관을 분석합니다.")
    print("종료하려면 'exit', 'q', 또는 '종료'를 입력하세요.")
    print("="*60)

    while True:
        try:
            user_input = input("\n[질문 입력] > ").strip()
            
            if user_input.lower() in ['exit', 'q', 'quit', '종료', 'x']:
                print("\n👋 테스트를 종료합니다. 감사합니다!")
                break
                
            if not user_input:
                continue

            # 분류 서비스 호출
            res = classify_complaint(user_input)
            
            print("\n" + "─"*40)
            print(f"🏢 담당 기관 : {res['agency_name']} (코드: {res['agency_code']})")
            print(f"📂 카테고리  : {res['category']}")
            print(f"🎯 신뢰도    : {res['confidence']}")
            print(f"📝 판단 근거 : {res['reasoning']}")
            
            if res['sources']:
                print(f"\n📚 참고 데이터 (상위 {len(res['sources'][:3])}개):")
                for src in res['sources'][:3]:
                    print(f"   - {src}")
            else:
                print("\n📚 참고 데이터 : 없음 (이미 저장된 로직에 의해 분류됨)")
            print("─"*40)
                
        except KeyboardInterrupt:
            print("\n\n👋 테스트를 강제 종료합니다.")
            break
        except Exception as e:
            print(f"\n❌ 분석 중 오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main()
