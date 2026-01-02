from PIL import Image
import os

path = r"c:\Users\rkdwl\Downloads\138.종합 민원 이미지 AI데이터\01.데이터\1.Training\원천데이터\TS1\보행방해물\간이의자(낮)\29_20210702_10278-0-0600.jpg"

print(f"Checking: {path}")
if os.path.exists(path):
    try:
        with Image.open(path) as img:
            print(f"RESOLUTION: {img.size}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("File not found")
