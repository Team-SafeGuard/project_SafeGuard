import random
import datetime
import subprocess

# 설정
NUM_RECORDS = 300
START_DATE = datetime.datetime.now() - datetime.timedelta(days=365)
END_DATE = datetime.datetime.now()

# 데이터 풀
districts = [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", 
    "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", 
    "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
]

categories = ["도로/시설물", "불법주차", "환경오염", "기타", "건축/건설", "교통", "안전"]
titles = [
    "도로 파손 신고합니다", "신호등 고장", "가로등 깜빡임", "불법 주차 신고", 
    "쓰레기 무단 투기", "보도블럭 파손", "공사장 소음", "맨홀 뚜껑 열림", 
    "안전 펜스 파손", "불법 현수막 제거 요청", "도로 포트홀 발견", "하수구 막힘 신고"
]

# SQL 생성 함수
def generate_sql():
    sql_statements = []
    
    for i in range(NUM_RECORDS):
        # 날짜 랜덤 생성
        time_between_dates = END_DATE - START_DATE
        days_between_dates = time_between_dates.days
        random_number_of_days = random.randrange(days_between_dates)
        created_date = START_DATE + datetime.timedelta(days=random_number_of_days)
        
        # 날짜 포맷 (PostgreSQL TIMESTAMP)
        created_str = created_date.strftime("%Y-%m-%d %H:%M:%S")
        
        # 상태 결정 (오래된 건 완료 확률 높음)
        days_diff = (datetime.datetime.now() - created_date).days
        if days_diff > 30:
            status = "COMPLETED"
            # 완료일은 생성일로부터 1~10일 뒤
            completed_date = created_date + datetime.timedelta(days=random.randint(1, 10))
            completed_str = f"'{completed_date.strftime('%Y-%m-%d %H:%M:%S')}'"
        elif days_diff > 3: # 3일 이상 지남 -> 지연 가능성 (IN_PROGRESS or RECEIVED)
            if random.random() < 0.7: # 70%는 지연 상태로 유지
                 status = random.choice(["IN_PROGRESS", "RECEIVED"])
                 completed_str = "NULL"
            else:
                 status = "COMPLETED"
                 completed_date = created_date + datetime.timedelta(days=random.randint(1, 3))
                 completed_str = f"'{completed_date.strftime('%Y-%m-%d %H:%M:%S')}'"
        else: # 최근 3일 이내
             status = random.choice(["RECEIVED", "IN_PROGRESS"])
             completed_str = "NULL"

        # 기타 데이터
        category = random.choice(categories)
        district = random.choice(districts)
        title = f"{random.choice(titles)} ({district})"
        content = f"{created_str}에 발생한 {category} 관련 민원입니다. 조속한 처리를 부탁드립니다. (자동생성 #{i+1})"
        address = f"서울특별시 {district} 가상대로 {random.randint(1, 999)}"
        user_no = random.randint(1, 30) # 더미 유저 1~30
        
        # INSERT 문 구성
        sql = f"""
        INSERT INTO complaint (category, title, content, address, status, is_public, created_date, completed_date, user_no, latitude, longitude)
        VALUES ('{category}', '{title}', '{content}', '{address}', '{status}', true, '{created_str}', {completed_str}, {user_no}, 37.5, 127.0);
        """
        sql_statements.append(sql.strip())
        
    return sql_statements

# 실행 함수
def execute_sql(statements):
    full_sql = "BEGIN; " + " ".join(statements) + " COMMIT;"
    # 파일로 저장 후 실행 (길이 문제 방지)
    with open("temp_data.sql", "w") as f:
        f.write(full_sql)
    
    print(f"🚀 {len(statements)}개 데이터 생성 중...")
    
    # docker exec로 파일 내용 전송하여 실행
    cmd = "cat temp_data.sql | docker exec -i safeguard-db psql -U user -d safeguard"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ 데이터 생성 완료!")
    else:
        print("❌ 데이터 생성 실패:")
        print(result.stderr)
        
    # cleanup
    subprocess.run("rm temp_data.sql", shell=True)

if __name__ == "__main__":
    stmts = generate_sql()
    execute_sql(stmts)
