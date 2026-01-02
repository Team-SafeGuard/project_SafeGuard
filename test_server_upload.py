import requests
import os

# 서버 분석 API URL
url = 'http://localhost:5000/api/analyze-image'

# 테스트할 이미지 파일 경로 (실제 존재하는 경로여야 함)
image_path = r'c:\Users\rkdwl\react-run\large_dataset\images\val\15_20211007_13808-0-1400.jpg'

if not os.path.exists(image_path):
    print(f"Error: File not found at {image_path}")
    exit(1)

# 파일 업로드 및 요청 전송
try:
    with open(image_path, 'rb') as img:
        files = {'image': img}
        print(f"Sending request to {url} with image {image_path}...")
        response = requests.post(url, files=files)

        # 결과 출력
        print(f"Status Code: {response.status_code}")
        try:
            print("Response JSON:")
            print(response.json())
        except Exception as e:
            print("Response Text:", response.text)

except Exception as e:
    print(f"Request failed: {e}")
