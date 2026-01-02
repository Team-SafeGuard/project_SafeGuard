import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
// import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
// const prisma = new PrismaClient({});

app.use(cors());
app.use(express.json());

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// uploads 폴더 생성 (없을 경우)
import fs from 'fs';
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 헬퍼 함수: 기본 테스트 유저 가져오기/생성하기
async function getOrCreateDefaultUser() {
    // 이메일로 간단히 조회
    const TEST_EMAIL = 'test_user@example.com';
    let user = await prisma.user.findUnique({
        where: { email: TEST_EMAIL }
    });

    if (!user) {
        console.log('[서버 로그] 테스트 유저가 없어 새로 생성합니다.');
        user = await prisma.user.create({
            data: {
                email: TEST_EMAIL,
                password: 'password123', // 실제론 해싱해야 함
                name: '테스트 유저',
                role: 'USER'
            }
        });
    }
    return user;
}

// 민원 목록 API
app.get('/api/reports', async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true } // 작성자 정보 포함
        });
        res.json(complaints);
    } catch (error) {
        console.error('[서버 에러] 민원 목록 조회 실패:', error);
        res.status(500).json({ error: '민원 목록을 불러오지 못했습니다.' });
    }
});

// 이미지 분석 API
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '이미지가 업로드되지 않았습니다.' });
    }

    const imagePath = req.file.path;
    console.log(`[서버 로그] 이미지 수신 완료: ${imagePath}`);
    console.log(`[서버 로그] AI 분석 프로세스를 시작합니다...`);

    const pythonCmd = process.platform === 'win32' ? 'py' : 'python';
    // const pythonCmd = 'python3'; // Mac/Linux의 경우

    const pythonProcess = spawn(pythonCmd, [path.join(__dirname, 'analyze_image.py'), imagePath]);

    let resultData = '';
    let errorLog = '';

    pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        const output = data.toString();
        errorLog += output;
        process.stdout.write(output);
    });

    pythonProcess.on('close', async (code) => {
        console.log(`[서버 로그] AI 분석 프로세스 종료 (코드: ${code})`);

        if (code !== 0) {
            console.error(`[서버 로그] AI 프로세스 비정상 종료. 에러: ${errorLog}`);
            return res.status(500).json({ error: 'AI 분석 프로세스가 비정상 종료되었습니다.', details: errorLog });
        }

        try {
            const jsonMatch = resultData.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('결과 데이터에서 JSON 형식을 찾을 수 없습니다.');
            }
            const jsonString = jsonMatch[0];
            const resultJson = JSON.parse(jsonString);

            console.log(`[서버 로그] 분석 성공: ${jsonString}`);

            // DB 저장 로직 (임시 비활성화)
            /*
            const user = await getOrCreateDefaultUser();
            const savedComplaint = await prisma.complaint.create({
                data: {
                    imagePath: imagePath,
                    description: 'AI 자동 분석 민원',
                    analysisResult: resultJson,
                    status: 'COMPLETED',
                    userId: user.id
                }
            });
            console.log(`[DB 저장] 민원 ID ${savedComplaint.id}번으로 저장 완료.`);
            */

            res.json({
                ...resultJson,
                // db_id: savedComplaint.id,
                message: '분석 결과입니다. (DB 저장은 현재 비활성화됨)'
            });

        } catch (e) {
            console.error(`[서버 로그] 결과 처리 중 오류: ${e.message}`);
            // 분석은 성공했으나 저장이 실패했을 수도 있으니 500 에러 처리
            res.status(500).json({ error: '결과 처리 중 오류가 발생했습니다.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`[서버 로그] 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`[서버 로그] http://localhost:${PORT}`);
});
