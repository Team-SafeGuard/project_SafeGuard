import os
from ultralytics import YOLO

def deep_inspect():
    model_path = 'server/best.pt'
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found.")
        # Try to find any other weights
        return

    print(f"--- Model: {model_path} ---")
    print(f"Size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
    
    try:
        model = YOLO(model_path)
        print("Classes (NC={}): {}".format(len(model.names), model.names))
        
        # Check if the model is just the base n/s/m/l/x weights or has been trained
        # Trained models usually have a 'dataset' key in their metadata
        if hasattr(model, 'ckpt'):
            ckpt = model.ckpt
            if 'epoch' in ckpt:
                print(f"Trained for {ckpt['epoch']} epochs")
            if 'best_fitness' in ckpt:
                print(f"Best Fitness: {ckpt['best_fitness']}")
        
        # Run a test inference with EXTREME low threshold to see raw noise
        test_img = 'large_dataset/images/val/17_20210804_6929-0-1300.jpg'
        if os.path.exists(test_img):
            print(f"\n--- Testing on {test_img} with confidence 0.01 ---")
            results = model(test_img, conf=0.01, verbose=False)
            print(f"Total objects seen at 1% threshold: {len(results[0].boxes)}")
            for i, box in enumerate(results[0].boxes[:5]): # Show top 5
                 print(f"  [{i}] {model.names[int(box.cls[0])]} - {float(box.conf[0])*100:.2f}%")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    deep_inspect()
