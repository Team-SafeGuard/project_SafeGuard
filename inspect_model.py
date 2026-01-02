import os
from ultralytics import YOLO

def inspect_model(model_path):
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found.")
        return
    
    print(f"--- Inspecting: {model_path} ---")
    size_mb = os.path.getsize(model_path) / (1024 * 1024)
    print(f"File Size: {size_mb:.2f} MB")
    
    try:
        model = YOLO(model_path)
        print(f"Model Names: {model.names}")
        print(f"Model Task: {model.task}")
        # print metadata if possible (YOLOv8 stores training args in model.ckpt)
        if hasattr(model, 'model') and hasattr(model.model, 'args'):
             print(f"Training Args: {model.model.args}")
    except Exception as e:
        print(f"Error loading model: {e}")

if __name__ == "__main__":
    inspect_model('server/best.pt')
    # search for others if needed
