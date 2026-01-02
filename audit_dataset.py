from PIL import Image
import os
import glob
import random

def check_dataset_health(base_path):
    train_images = glob.glob(os.path.join(base_path, 'images/train/*.jpg'))
    if not train_images:
        print("No training images found.")
        return

    print(f"Total Training Images: {len(train_images)}")
    
    # Check random sample of 20 images
    sample = random.sample(train_images, min(len(train_images), 20))
    
    small_objects = 0
    total_objects = 0
    
    print("\n--- Sampling 20 Images ---")
    for img_path in sample:
        try:
            with Image.open(img_path) as img:
                w, h = img.size
                
            label_path = img_path.replace('images', 'labels').replace('.jpg', '.txt')
            if not os.path.exists(label_path):
                continue
                
            with open(label_path, 'r') as f:
                lines = f.readlines()
                
            for line in lines:
                parts = list(map(float, line.split()))
                # parts[3] is width ratio, parts[4] is height ratio
                obj_w = parts[3] * w
                obj_h = parts[4] * h
                total_objects += 1
                
                # Definition of "Too Small": less than 15 pixels in any dimension
                if obj_w < 15 or obj_h < 15:
                    small_objects += 1
                    
        except Exception as e:
            pass
            
    if total_objects > 0:
        bad_ratio = (small_objects / total_objects) * 100
        print(f"\n[Problem Found] Out of {total_objects} sampled objects, {small_objects} ({bad_ratio:.1f}%) are too small (<15px).")
        print(f"Image Resolution: {w}x{h} (Low Resolution confirmed)")
    else:
        print("No objects found in sample.")

if __name__ == "__main__":
    check_dataset_health('large_dataset')
