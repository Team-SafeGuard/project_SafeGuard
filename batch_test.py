import os
import sys
import json
from ultralytics import YOLO

def batch_test(image_paths):
    model_path = 'server/best.pt'
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        return

    print(f"Loading model: {model_path}...")
    model = YOLO(model_path)
    
    results_summary = []
    
    for path in image_paths:
        if not os.path.exists(path):
            print(f"File not found: {path}")
            continue
            
        print(f"Analyzing: {path}")
        # Use a lower threshold to see what the model actually detects
        results = model(path, conf=0.1, verbose=False)
        
        detections = []
        for box in results[0].boxes:
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            confidence = float(box.conf[0])
            detections.append({
                "class": class_name,
                "confidence": confidence
            })
            
        results_summary.append({
            "file": os.path.basename(path),
            "detections": detections
        })
        
    print("\n=== Performance Report ===")
    for res in results_summary:
        print(f"File: {res['file']}")
        if res['detections']:
            for d in res['detections']:
                print(f"  - Detected: {d['class']} ({d['confidence']*100:.1f}%)")
        else:
            print("  - No detections found (even at 10% confidence)")
    print("==========================")

if __name__ == "__main__":
    test_images = [
        'large_dataset/images/val/13_20210717_9457-0-0600.jpg',
        'large_dataset/images/val/15_20210812_10092-0-1300.jpg',
        'large_dataset/images/val/17_20210804_6929-0-1300.jpg',
        'large_dataset/images/val/21_20210730_11301-0-0600.jpg',
        'large_dataset/images/val/35_20210801_10822-0-1000.jpg'
    ]
    batch_test(test_images)
