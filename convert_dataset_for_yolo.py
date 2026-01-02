import os
import json
import zipfile
from pathlib import Path

# ==========================================
# ⚙️ 설정 (Configuration)
# ==========================================

# 1. 라벨링 데이터(Zip 파일들)가 있는 폴더 경로
SOURCE_DIR = r"C:\Users\rkdwl\Downloads\138.종합 민원 이미지 AI데이터\01.데이터\1.Training\라벨링데이터"

# 2. 변환된 라벨(.txt)을 저장할 경로
OUTPUT_DIR = r"C:\Users\rkdwl\react-run\converted_labels"

# 3. 클래스 정의 (0: 불법주정차, 1: 보행방해물)
CLASS_MAPPING = {
    # [불법 주정차 관련 키워드] -> 0
    "불법": 0, "주정차": 0, "차량": 0, "승용차": 0, "트럭": 0, "버스": 0, "오토바이": 0,
    
    # [보행 방해물 관련 키워드] -> 1
    "방해": 1, "펜스": 1, "현수막": 1, "의자": 1, "벤치": 1, "화분": 1, "쓰레기": 1, 
    "자전거": 1, "킥보드": 1, "공사": 1, "입간판": 1, "라바콘": 1, "볼라드": 1
}

# ==========================================
# 🛠️ 함수 정의
# ==========================================

def convert_bbox_to_yolo(box, img_width, img_height):
    """
    JSON의 절대좌표(x, y, w, h)를 YOLO 정규화 좌표(cx, cy, w, h)로 변환
    """
    x = float(box['x'])
    y = float(box['y'])
    w = float(box['w'])
    h = float(box['h'])

    # 중심 좌표 계산
    center_x = x + (w / 2)
    center_y = y + (h / 2)

    # 정규화 (0.0 ~ 1.0)
    norm_cx = center_x / img_width
    norm_cy = center_y / img_height
    norm_w = w / img_width
    norm_h = h / img_height

    return norm_cx, norm_cy, norm_w, norm_h

def get_class_id(category_name):
    """
    카테고리 이름에서 키워드를 찾아 0(불법) 또는 1(방해물)로 매핑
    """
    for keyword, class_id in CLASS_MAPPING.items():
        if keyword in category_name:
            return class_id
    return -1 # 매핑 실패 시 무시

def process_labels():
    if not os.path.exists(SOURCE_DIR):
        print(f"❌ 오류: 소스 경로를 찾을 수 없습니다: {SOURCE_DIR}")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"🚀 라벨 변환 시작... (저장 위치: {OUTPUT_DIR})")

    zip_files = [f for f in os.listdir(SOURCE_DIR) if f.endswith('.zip') and f.startswith('TS')]
    
    total_converted = 0

    for zip_name in zip_files:
        zip_path = os.path.join(SOURCE_DIR, zip_name)
        print(f"📂 처리 중: {zip_name} ...")

        try:
            with zipfile.ZipFile(zip_path, 'r') as z:
                json_files = [f for f in z.namelist() if f.endswith('.json')]
                
                for json_file in json_files:
                    try:
                        with z.open(json_file) as f:
                            data = json.load(f)
                            
                        # 1. 이미지 해상도 파싱
                        # 예: "Resolution": "1920x1080"
                        res_str = data['meta']['Resolution']
                        img_w, img_h = map(int, res_str.split('x'))

                        # 2. 어노테이션 정보 추출
                        annotations = data['annotations']
                        # 구조가 조금씩 다를 수 있어 유연하게 처리
                        bbox_info = annotations.get('Bbox Annotation') or annotations.get('Bbox_Annotation')
                        
                        if not bbox_info:
                            continue

                        # 파일명 결정 (이미지 파일명과 동일하게 .txt로)
                        # 예: "atchFileName": "15_20210729_7244-0-0600.jpg"
                        img_filename = bbox_info['atchFileName']
                        txt_filename = os.path.splitext(img_filename)[0] + ".txt"
                        
                        folder_name = os.path.splitext(zip_name)[0] # TS1, TS2...
                        save_path = os.path.join(OUTPUT_DIR, folder_name)
                        os.makedirs(save_path, exist_ok=True)
                        
                        full_txt_path = os.path.join(save_path, txt_filename)
                        
                        yolo_lines = []
                        boxes = bbox_info['Box']
                        
                        for box in boxes:
                            category_name = box['category_name']
                            class_id = get_class_id(category_name)
                            
                            if class_id != -1:
                                cx, cy, w, h = convert_bbox_to_yolo(box, img_w, img_h)
                                # YOLO line format: class_id cx cy w h
                                line = f"{class_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}"
                                yolo_lines.append(line)
                        
                        # 라벨 파일 쓰기 (유효한 라벨이 있는 경우만)
                        if yolo_lines:
                            with open(full_txt_path, 'w', encoding='utf-8') as out_f:
                                out_f.write('\n'.join(yolo_lines))
                            total_converted += 1

                    except Exception as e:
                        # 개별 파일 에러는 무시하고 계속 진행
                        continue

        except Exception as e:
            print(f"❌ {zip_name} 처리 중 오류 발생: {e}")

    print(f"\n✅ 변환 완료! 총 {total_converted}개의 라벨 파일이 생성되었습니다.")
    print(f"경로: {OUTPUT_DIR}")

if __name__ == "__main__":
    process_labels()
