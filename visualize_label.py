import cv2
import os
import numpy as np

def visualize(image_path):
    if not os.path.exists(image_path):
        print("Image not found")
        return

    label_path = image_path.replace('images', 'labels').replace('.jpg', '.txt')
    if not os.path.exists(label_path):
        print("Label not found")
        return

    # Read image
    img = cv2.imread(image_path)
    h, w, _ = img.shape
    
    with open(label_path, 'r') as f:
        lines = f.readlines()
        
    print(f"Image: {w}x{h}")
    for line in lines:
        parts = list(map(float, line.split()))
        cls = int(parts[0])
        cx, cy, bw, bh = parts[1], parts[2], parts[3], parts[4]
        
        # Convert to pixels
        x1 = int((cx - bw/2) * w)
        y1 = int((cy - bh/2) * h)
        x2 = int((cx + bw/2) * w)
        y2 = int((cy + bh/2) * h)
        
        print(f"Class {cls}: {x1},{y1} -> {x2},{y2} (w:{x2-x1}, h:{y2-y1})")
        
        # Draw rectangle
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(img, f"Class {cls}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    output_path = "visualized_debug.jpg"
    cv2.imwrite(output_path, img)
    print(f"Saved visualization to {output_path}")

if __name__ == "__main__":
    visualize('large_dataset/images/val/17_20210804_6929-0-1300.jpg')
