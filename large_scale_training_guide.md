# 대규모 데이터(1만 장) 학습 가이드

이제 5가지 카테고리별로 각 2,000장씩, 총 **10,000장**의 이미지를 사용하여 실제 서비스 수준의 AI 모델을 만듭니다. 데이터가 커진 만큼 효율적인 관리가 필요합니다.

## 1. 로컬 데이터 생성
1.  업그레이드된 **`create_sample.py`**를 실행합니다.
2.  `C:\Users\rkdwl\react-run\large_dataset.zip` 파일이 생성되기를 기다립니다. (약 1만 장의 이미지와 정답지 파싱이 진행되므로 시간이 몇 분 소요될 수 있습니다.)

## 2. 구글 드라이브 업로드
데이터 용량이 크기 때문에(약 1GB~2GB 예상), 코랩에 직접 올리는 것보다 **구글 드라이브**를 통해 가져오는 것이 중단 위험이 적고 안전합니다.

1.  본인의 구글 드라이브에 `AI_PROJECT` 폴더를 만듭니다.
2.  그 안에 **`large_dataset.zip`** 파일을 업로드합니다.

## 3. 구글 코랩(Colab) 학습 설정
기존 노트북의 코드를 아래 흐름으로 수정하여 실행하세요.

### 드라이브 연결 및 압축 해제
```python
# ==========================================
# 🚀 1. 핵심 라이브러리 설치 (가장 먼저 실행!)
# ==========================================
!pip install ultralytics

# ==========================================
# 📂 2. 구글 드라이브 마운트 및 데이터 준비
# ==========================================
from google.colab import drive
import os

# 드라이브 마운트
drive.mount('/content/drive')

# 기존 데이터가 있다면 삭제 (깨끗한 환경 유지)
if os.path.exists('/content/dataset'):
    !rm -rf /content/dataset

# 드라이브에서 데이터 복사 및 압축 해제
# (주의: large_dataset.zip이 /AI_PROJECT/ 폴더 안에 있어야 합니다)
!cp /content/drive/MyDrive/AI_PROJECT/large_dataset.zip /content/
!unzip -qo /content/large_dataset.zip -d /content/dataset

print("✅ 데이터 준비 완료!")

# ==========================================
# 🧠 3. AI 모델 학습 시작 (최적화 전략 적용)
# ==========================================
from ultralytics import YOLO

# 모델 로드 (성능을 위해 s 모델 사용)
print("Loading YOLOv8s model...")
model = YOLO('yolov8s.pt') 

# 최적화된 하이퍼파라미터로 학습 시작
results = model.train(
    data='/content/dataset/data.yaml',
    
    # --- 시스템 설정 ---
    epochs=100,        # 300은 너무 기니까 일단 100회로 테스트 (빠른 확인용)
    patience=30,       # 30번 동안 성능 안 오면 조기 종료
    batch=16,          # VRAM 허용 범위 내 최대
    imgsz=640,         # 416 -> 640 업스케일링 효과
    device=0,
    
    # --- 최적화 (Optimizer) ---
    optimizer='AdamW', # 복잡한 패턴 학습에 유리
    lr0=0.001,         # 학습률 낮춰서 섬세하게 학습
    warmup_epochs=3.0, # 워밍업
    
    # --- Recall 중심 손실 함수 ---
    box=5.0,           # 박스 정확도보다는
    cls=2.0,           # "객체가 있다"는 사실(Recall)에 2배 가중치
    
    # --- 데이터 증강 (작은 객체 보호) ---
    mosaic=1.0,        # 전체 맥락 학습
    mixup=0.0,         # 끄기 (작은 객체 파괴 방지)
    copy_paste=0.0,    # 끄기 (비현실적 학습 방지)
    degrees=10.0,      # 약간의 회전 허용
    
    name='yolov8s_final_run'
)
```

## 4. 주의 사항
- **학습 시간**: 데이터 1만 장의 경우, 코랩 무료 버전(T4 L4 GPU) 기준 약 1~2시간 정도 소요될 수 있습니다.
- **런타임 유지**: 코랩 탭을 끄지 마시고, 가끔 마우스를 움직여 런타임 연결이 끊어지지 않게 해주세요.
- **데이터 용량**: 구글 드라이브의 용량이 충분한지 미리 확인해 주세요.

모든 준비가 되었습니다. `create_sample.py`를 실행해서 1만 장의 데이터를 먼저 뽑아보세요! 🚀
