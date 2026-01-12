import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

function request(endpoint, method, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + endpoint);
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 400) {
                        console.error(`Error ${res.statusCode}: ${body}`);
                        resolve(null);
                    } else {
                        resolve(JSON.parse(body));
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Request error: ${e.message}`);
            resolve(null);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function main() {
    console.log("🚀 기관 관리 시스템 시드 데이터 생성 시작...\n");

    // 1) 데이터 초기화
    console.log("1️⃣ 기존 데이터 초기화...");
    await request('/seed/reset', 'POST');
    console.log("   ✅ 데이터 초기화 완료\n");

    // 2) 기관 데이터 시드
    console.log("2️⃣ 기관(Agency) 데이터 시드...");
    const agencyResult = await request('/seed/agencies', 'POST');
    if (agencyResult) {
        console.log(`   ✅ ${agencyResult.count}개 기관 생성 완료\n`);
    }

    // 3) 기관 목록 조회
    console.log("3️⃣ 기관 목록 조회...");
    const agencies = await request('/seed/agencies', 'GET');
    if (!agencies || agencies.length === 0) {
        console.error("   ❌ 기관 목록 조회 실패!");
        return;
    }
    console.log(`   ✅ ${agencies.length}개 기관 로드 완료\n`);

    // 4) 기관 관리자 계정 생성
    console.log("4️⃣ 기관 관리자 계정 생성...");
    const adminResult = await request('/seed/agency-admins', 'POST');
    if (adminResult) {
        console.log(`   ✅ ${adminResult.count}개 관리자 계정 생성 완료`);
        console.log("   📝 기관 관리자 계정 예시:");
        console.log("      - 서울특별시: admin_1 / admin123");
        console.log("      - 경찰청: admin_18 / admin123");
        console.log("      (각 기관의 agency_no에 따라 ID가 생성됩니다)\n");
    }

    // 5) 더미 민원 생성 (랜덤 기관 할당)
    const categories = ["교통", "행정·안전", "도로", "산업·통상", "주택·건축", "교육", "경찰·검찰", "환경", "보건", "관광", "기타"];
    const titles = [
        "도로 파손 신고합니다", "신호등이 고장났어요", "횡단보도 페인트가 지워졌어요",
        "가로등이 깜빡거립니다", "불법 주차 차량 신고", "쓰레기 무단 투기 목격",
        "보도블럭 교체 요청", "공원 벤치 파손", "소음 민원입니다", "안전 펜스 설치 요청",
        "맨홀 뚜껑 열림", "가로수 가지치기 요청", "불법 현수막 철거 요청"
    ];
    const contents = [
        "빠른 조치 부탁드립니다.", "위험해 보입니다. 확인해주세요.",
        "오랫동안 방치되어 있습니다.", "지나가다가 발견해서 신고합니다.",
        "아이들이 다니는 길이라 위험합니다.", "정확한 위치는 지도에 표시했습니다.",
        "비가 오면 물이 고입니다.", "악취가 납니다."
    ];
    const addresses = [
        "서울시 강남구 테헤란로 123", "부산시 해운대구 센텀로 45",
        "대구시 수성구 범어로 78", "인천시 연수구 송도대로 234",
        "광주시 서구 상무대로 567", "대전시 유성구 대덕대로 890",
        "울산시 남구 삼산로 111", "경기도 수원시 영통구 광교로 222",
        "강원도 춘천시 중앙로 333", "제주시 연동 노연로 444"
    ];

    console.log("5️⃣ 80개 더미 민원 생성 (랜덤 기관 할당)...");

    for (let i = 0; i < 80; i++) {
        // 랜덤 날짜 (최근 30일 이내)
        const randomDays = Math.floor(Math.random() * 30);
        const randomHours = Math.floor(Math.random() * 24);
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - randomDays);
        createdDate.setHours(createdDate.getHours() - randomHours);

        // 랜덤 기관 선택
        const randomAgency = agencies[Math.floor(Math.random() * agencies.length)];

        const data = {
            title: `${titles[Math.floor(Math.random() * titles.length)]}`,
            description: `${contents[Math.floor(Math.random() * contents.length)]} (자동 생성된 민원 #${i + 1})`,
            category: categories[Math.floor(Math.random() * categories.length)],
            address: addresses[Math.floor(Math.random() * addresses.length)],
            latitude: 37.5000 + (Math.random() * 0.1 - 0.05),
            longitude: 127.0300 + (Math.random() * 0.1 - 0.05),
            imagePath: "/uploads/dummy.jpg",
            analysisResult: JSON.stringify({ label: "Auto-classified", confidence: Math.random() * 0.3 + 0.7 }),
            status: "RECEIVED",
            likeCount: Math.floor(Math.random() * 100),
            createdDate: createdDate.toISOString(),
            agencyNo: randomAgency.agencyNo  // 랜덤 기관 할당
        };

        // 상태 랜덤화
        if (i % 5 === 0) data.status = "IN_PROGRESS";
        if (i % 10 === 0) data.status = "COMPLETED";

        const res = await request('/seed/complaints', 'POST', data);
        if (res) {
            const agencyInfo = randomAgency.agencyName.substring(0, 8);
            console.log(`   [${String(i + 1).padStart(2, '0')}/80] ✅ ${data.title.substring(0, 15)}... → ${agencyInfo}`);
        } else {
            console.log(`   [${String(i + 1).padStart(2, '0')}/80] ❌ 실패`);
        }

        // 딜레이
        await new Promise(r => setTimeout(r, 20));
    }

    console.log("\n🎉 모든 데이터 생성 완료!");
    console.log("\n📋 요약:");
    console.log(`   - 기관: ${agencies.length}개`);
    console.log(`   - 기관 관리자: ${adminResult?.count || 0}개`);
    console.log("   - 민원: 80개");
    console.log("\n🔑 테스트 계정:");
    console.log("   - 일반 사용자: testuser / testuser123");
    console.log("   - 기관 관리자: admin_1 ~ admin_38 / admin123");
    console.log("     (각 기관별로 하나씩 생성됨)");
}

main();
