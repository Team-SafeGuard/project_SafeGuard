import os
import shutil
import random
import zipfile
import json
from pathlib import Path

# --- 설정 (경로 확인 완료) ---
BASE_PATH = r"C:\Users\rkdwl\Downloads\138.종합 민원 이미지 AI데이터\01.데이터"
IMAGE_ROOT = os.path.join(BASE_PATH, "1.Training", "원천데이터")
LABEL_ROOT = os.path.join(BASE_PATH, "1.Training", "라벨링데이터")
OUTPUT_DIR = r"C:\Users\rkdwl\react-run\large_dataset"

SAMPLE_COUNT = 500  # 카테고리당 500장 (총 2,500장 목표)
CLASSES = ["TS1", "TS2", "TS3", "TS4", "TS5"]
CLASS_NAMES = ["보행방해물", "현수막", "불법주정차", "공사현장", "쓰레기"]

def get_yolo_label(json_data, class_idx):
    """JSON 데이터를 YOLO 형식의 문자열로 변환 (정규화 포함)"""
    yolo_lines = []
    
    # 해상도 정보 (정규화에 필요)
    res_str = json_data.get('meta', {}).get('Resolution', '1920x1080')
    try:
        w_img, h_img = map(int, res_str.split('x'))
    except:
        w_img, h_img = 1920, 1080

    # Bbox Annotation 추출
    bbox_ann = json_data.get('annotations', {}).get('Bbox Annotation', {})
    if not bbox_ann:
        return ""

    # 실제 박스 데이터는 'Box' 리스트 안에 있음
    bbox_list = bbox_ann.get('Box', [])
    if not bbox_list:
        # 가끔 Bbox Annotation 자체가 리스트인 경우도 대비
        if isinstance(bbox_ann, list):
            bbox_list = bbox_ann
        else:
            return ""

    for bbox in bbox_list:
        try:
            # 원본 데이터는 x, y, w, h 형식
            x = float(bbox.get('x', 0))
            y = float(bbox.get('y', 0))
            w = float(bbox.get('w', 0))
            h = float(bbox.get('h', 0))

            if w == 0 or h == 0: continue

            # YOLO 형식: <class> <x_center> <y_center> <width> <height> (모두 0~1 정규화)
            x_center = (x + w / 2) / w_img
            y_center = (y + h / 2) / h_img
            w_norm = w / w_img
            h_norm = h / h_img

            # 범위 체크 (0~1 사이값인지)
            if 0 <= x_center <= 1 and 0 <= y_center <= 1 and 0 <= w_norm <= 1 and 0 <= h_norm <= 1:
                yolo_lines.append(f"{class_idx} {x_center:.6f} {y_center:.6f} {w_norm:.6f} {h_norm:.6f}")
        except Exception:
            continue
            
    return "\n".join(yolo_lines)

def create_sample():
    print(f"🚀 [단계 1] 대규모 데이터 추출 시작 (목표: 카테고리당 {SAMPLE_COUNT}장)...")
    
    if os.path.exists(OUTPUT_DIR):
        print(f"🧹 기존 폴더 삭제 중: {OUTPUT_DIR}")
        shutil.rmtree(OUTPUT_DIR)
        
    for split in ["train", "val"]:
        os.makedirs(os.path.join(OUTPUT_DIR, f"images/{split}"), exist_ok=True)
        os.makedirs(os.path.join(OUTPUT_DIR, f"labels/{split}"), exist_ok=True)

    total_extracted = 0

    for idx, ts_key in enumerate(CLASSES):
        print(f"\n📂 {CLASS_NAMES[idx]} ({ts_key}) 처리 중...")
        
        img_dir = os.path.join(IMAGE_ROOT, ts_key)
        if not os.path.exists(img_dir):
            print(f"  ❌ 폴더 없음: {img_dir}")
            continue
            
        print(f"  🔍 이미지 목록 수집 중...", end="", flush=True)
        all_images = [os.path.join(r, f) for r, d, fs in os.walk(img_dir) for f in fs if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f" ({len(all_images)}개 발견)")
        
        if not all_images:
            continue
            
        # 정답 파일(Zip) 매칭
        label_zip_path = os.path.join(LABEL_ROOT, f"TL{ts_key[2:]}.zip")
        if not os.path.exists(label_zip_path):
            print(f"  ❌ 라벨 Zip 없음: {label_zip_path}")
            continue
            
        print(f"  📦 라벨 압축파일 읽는 중...", end="", flush=True)
        with zipfile.ZipFile(label_zip_path, 'r') as zf:
            all_label_names = {os.path.basename(n): n for n in zf.namelist() if n.endswith('.json')}
            print(f" ({len(all_label_names)}개 라벨 확인)")
            
            random.shuffle(all_images)
            cnt = 0
            for img_path in all_images:
                if cnt >= SAMPLE_COUNT: break
                
                img_name = os.path.basename(img_path)
                img_base = os.path.splitext(img_name)[0]
                json_filename = img_base + ".json"
                
                if json_filename in all_label_names:
                    try:
                        # JSON 읽기
                        json_data = json.loads(zf.read(all_label_names[json_filename]).decode('utf-8'))
                        
                        # YOLO 라벨 변환
                        yolo_label = get_yolo_label(json_data, idx)
                        
                        if not yolo_label: # 탐지 객체 정보가 없는 경우 건너뜀
                            continue

                        # 8:2 비율로 데이터 나눔
                        split = "train" if cnt < int(SAMPLE_COUNT * 0.8) else "val"
                        
                        # 이미지 복사
                        shutil.copy(img_path, os.path.join(OUTPUT_DIR, f"images/{split}", img_name))
                        
                        # 라벨 텍스트 저장
                        label_path = os.path.join(OUTPUT_DIR, f"labels/{split}", img_base + ".txt")
                        with open(label_path, "w", encoding='utf-8') as f:
                            f.write(yolo_label)
                            
                        cnt += 1
                        if cnt % 100 == 0:
                            print(f"\r  ▶ 진행률: {cnt}/{SAMPLE_COUNT}장 완료...", end="", flush=True)
                    except Exception as e:
                        continue
            
            print(f"\n  ✅ {CLASS_NAMES[idx]} 추출 완료 ({cnt}장)")
            total_extracted += cnt

    # [단계 2] data.yaml 생성
    print("\n📝 [단계 2] data.yaml 생성 중...")
    data_yaml_content = f"""train: /content/dataset/images/train
val: /content/dataset/images/val
nc: {len(CLASS_NAMES)}
names: {CLASS_NAMES}
"""
    with open(os.path.join(OUTPUT_DIR, "data.yaml"), "w", encoding='utf-8') as f:
        f.write(data_yaml_content)

    # [단계 3] 압축
    print(f"🗜️ [단계 3] 압축 중 (총 {total_extracted}장)...")
    shutil.make_archive(OUTPUT_DIR, 'zip', OUTPUT_DIR)
    
    print(f"\n✨ 모든 작업이 완료되었습니다!")
    print(f"결과물 경로: {OUTPUT_DIR}.zip")
    print(f"총 이미지 수: {total_extracted}장")
    print("-" * 50)
    print("1. 생성된 'large_dataset.zip' 파일을 구글 드라이브에 업로드하세요.")
    print("2. 코랩에서 드라이브를 마운트하고 학습을 시작하세요.")

if __name__ == "__main__":
    create_sample()
