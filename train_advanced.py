from ultralytics import YOLO
import torch

def train_advanced():
    # 1. Load Model (Use 's' or 'm' for better feature extraction)
    # Note: To use P2 layer, you need a specific 'yolov8s-p2.yaml' config file.
    # If unavailable, standard 'yolov8s.pt' with 'imgsz=640' is next best.
    print("Loading YOLOv8s model...")
    model = YOLO('yolov8s.pt') 

    # 2. Train with Optimized Hyperparameters
    print("Starting Training with Optimized Strategy...")
    results = model.train(
        data='dataset.yaml',  # Ensure this points to your data.yaml
        
        # --- System ---
        epochs=300,
        patience=100,
        batch=16,
        imgsz=640,  # Upscaling 416->640 adds interpolation, helps Conv layers slightly
        
        # --- Optimizer ---
        optimizer='AdamW',
        lr0=0.001,
        warmup_epochs=5.0,
        
        # --- Loss Emphasis (Recall Focus) ---
        box=5.0,    # Reduced strictness on box precision
        cls=2.0,    # Increased focus on "Is there an object?"
        
        # --- Augmentation (Small Object Safe) ---
        mosaic=1.0,      # Good for context
        mixup=0.0,       # DISABLE: Destroys small objects
        copy_paste=0.0,  # DISABLE: Unrealistic context
        scale=0.2,       # Limit zoom-out (don't shrink objects further)
        degrees=10.0,    # Rotation
        hsv_h=0.015,     # Color jitter
        hsv_s=0.7,
        hsv_v=0.4,
        
        # --- Stabilization ---
        close_mosaic=20, # Turn off mosaic for last 20 epochs to fine-tune on real images
        name='yolov8s_recall_optimized'
    )
    
    print("Training Completed.")

if __name__ == '__main__':
    # Ensure CUDA is available
    if torch.cuda.is_available():
        print(f"CUDA Available: {torch.cuda.get_device_name(0)}")
        train_advanced()
    else:
        print("WARNING: CUDA not available. Training will be extremely slow.")
