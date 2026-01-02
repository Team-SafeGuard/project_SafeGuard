from PIL import Image
import os
import glob

# Try to find any jpg in the download folder
base_path = r"C:\Users\rkdwl\Downloads\138.종합 민원 이미지 AI데이터\01.데이터\1.Training\원천데이터"
files = glob.glob(os.path.join(base_path, "**", "*.jpg"), recursive=True)

if files:
    print(f"Found {len(files)} files.")
    p = files[0]
    print(f"Checking: {p}")
    try:
        with Image.open(p) as img:
            print(f"Size: {img.size}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No files found in source dir")
