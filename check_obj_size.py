from PIL import Image
import os

path = 'large_dataset/images/val/17_20210804_6929-0-1300.jpg'
if os.path.exists(path):
    with Image.open(path) as img:
        print(f"Size: {img.size}")
        
        # Check label
        label_path = path.replace('images', 'labels').replace('.jpg', '.txt')
        if os.path.exists(label_path):
            with open(label_path, 'r') as f:
                lines = f.readlines()
                for line in lines:
                    parts = list(map(float, line.split()))
                    # parts: class x y w h
                    w_px = parts[3] * img.size[0]
                    h_px = parts[4] * img.size[1]
                    print(f"Object: {int(parts[0])} - Size: {w_px:.1f}x{h_px:.1f} pixels")
else:
    print("Image not found")
