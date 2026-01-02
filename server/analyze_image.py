import os
import sys
import json

# YOLO 관련 잡다한 로그 억제 (최상단 배치)
os.environ['ULTRALYTICS_VERBOSE'] = 'False'
os.environ['YOLO_VERBOSE'] = 'False'

from ultralytics import YOLO

# 한글 로그 출력용 함수 (stderr 사용)
def log_korean(message):
    sys.stderr.write(f"[AI 분석 로그] {message}\n")
    sys.stderr.flush()

def analyze_image(image_path):
    log_korean(f"이미지 분석을 시작합니다. 대상 파일: {image_path}")
    
    # 1. 모델 로드 (표준/Pre-trained 모델 사용)
    # 데이터 품질 문제로 인해 Fine-tuning 모델 대신 표준 모델(yolov8n.pt)을 사용합니다.
    model_path = os.path.join(os.path.dirname(__file__), 'yolov8n.pt')
    if not os.path.exists(model_path):
        # 만약 server/yolov8n.pt가 없으면 자동 다운로드를 위해 그냥 'yolov8n.pt'로 로드 시도
        model_path = 'yolov8n.pt'
    
    log_korean("표준 YOLOv8 모델(COCO Pre-trained)을 로드 중입니다...")
    model = YOLO(model_path)
    
    # 2. 이미지 분석 (Inference)
    log_korean("이미지 분석을 수행 중입니다 (Standard Model)...")
    # 표준 모델은 성능이 좋으므로 신뢰도 0.25 정도면 충분합니다.
    results = model(image_path, conf=0.25) 
    
    # 디버깅: 모델이 인식한 모든 객체 로그 출력
    if len(results[0].boxes) == 0:
        log_korean("탐지된 객체가 없습니다.")
        return {
            "type": "탐지 불가",
            "agency": "지자체 민원실 (수동 확인 필요)",
            "confidence": 0.0
        }

    log_korean(f"탐지된 객체 수: {len(results[0].boxes)}")
    
    # COCO Class ID Mapping (Standard YOLOv8)
    # 0: person -> 보행 안전 위협 (노숙자 등) or 그냥 '보행자'
    # 2: car, 3: motorcycle, 5: bus, 7: truck -> 불법주정차 의심
    # 13: bench, 56: chair, 58: potted plant -> 보행방해물
    # 그 외 -> 기타 시설물
    
    detected_types = []
    max_conf = 0.0
    primary_type = "기타"
    primary_agency = "지자체 민원실"

    for box in results[0].boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        coco_name = model.names[cls]
        
        log_korean(f"  - [DEBUG] 객체: {coco_name} (신뢰도: {conf*100:.1f}%)")
        
        # 맵핑 로직
        mapped_type = "기타 물체"
        mapped_agency = "지자체 민원실"
        
        if cls in [2, 3, 5, 7]: # 탈것
            mapped_type = "불법주정차 의심 차량"
            mapped_agency = "지자체 교통과"
        elif cls == 0: # 사람
            mapped_type = "보행자/인물"
            mapped_agency = "지자체 복지과/안전과"
        elif cls in [13, 56, 58, 62]: # 벤치, 의자, 화분, TV/모니터 -> 적치물
            mapped_type = "보행방해 적치물"
            mapped_agency = "지자체 건설과"
        
        detected_types.append(mapped_type)
        
        if conf > max_conf:
            max_conf = conf
            primary_type = mapped_type
            primary_agency = mapped_agency

    log_korean(f"분석 완료: {primary_type} (원천: {model.names[int(results[0].boxes[0].cls[0])]})")
    log_korean(f"추천 처리 기관: {primary_agency}")
    
    return {
        "type": primary_type,
        "agency": primary_agency,
        "confidence": max_conf
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write(json.dumps({"error": "No image path provided"}) + "\n")
        sys.exit(1)
        
    image_path = sys.argv[1]
    try:
        analysis_result = analyze_image(image_path)
        # 최종 JSON 결과만 stdout에 출력
        print(json.dumps(analysis_result, ensure_ascii=False))
    except Exception as e:
        log_korean(f"오류 발생: {str(e)}")
        # 에러 발생 시에도 JSON 형태로 에러 정보 반환
        sys.stderr.write(json.dumps({"error": str(e)}) + "\n")
        sys.exit(1)
