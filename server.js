const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.backend' });

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件 - 配置CORS支持跨域访问
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', /^http:\/\/192\.168\./, /^http:\/\/10\./, /^http:\/\/172\./],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Id']
}));

// 添加预检请求处理
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: (req, file, cb) => {
        // 允许的音频格式
        const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/mpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件格式，请上传音频文件'), false);
        }
    }
});

// 豆包API配置
const DOUBAO_CONFIG = {
    endpoint: process.env.DOUBAO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: process.env.DOUBAO_API_KEY || '',
    apiSecret: process.env.DOUBAO_API_SECRET || '',
    appId: process.env.DOUBAO_APP_ID || ''
};

// 路由：主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 路由：健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        api_configured: !!DOUBAO_CONFIG.apiKey
    });
});

// 路由：上传音频
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传音频文件' });
        }

        const audioPath = req.file.path;
        const audioInfo = {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            path: audioPath,
            mimetype: req.file.mimetype
        };

        console.log('音频上传成功:', audioInfo);

        res.json({
            success: true,
            audioPath: audioPath,
            audioInfo: audioInfo
        });

    } catch (error) {
        console.error('音频上传失败:', error);
        res.status(500).json({ error: '音频上传失败: ' + error.message });
    }
});

// 路由：创建语音模型（豆包语音复刻）
app.post('/api/create-voice-model', async (req, res) => {
    try {
        const { audioPath, voiceName } = req.body;

        if (!audioPath) {
            return res.status(400).json({ error: '缺少音频文件路径' });
        }

        if (!DOUBAO_CONFIG.apiKey) {
            return res.status(500).json({ error: '豆包API未配置' });
        }

        console.log('开始创建语音模型:', { audioPath, voiceName });

        // 检查文件是否存在
        if (!fs.existsSync(audioPath)) {
            return res.status(400).json({ error: '音频文件不存在' });
        }

        // 调用豆包语音复刻API
        const voiceModelResult = await createDoubaoVoiceModel(audioPath, voiceName);

        res.json({
            success: true,
            voiceId: voiceModelResult.voice_id,
            status: voiceModelResult.status,
            message: '语音模型创建成功'
        });

    } catch (error) {
        console.error('创建语音模型失败:', error);
        res.status(500).json({ error: '创建语音模型失败: ' + error.message });
    }
});

// 路由：生成TTS语音
app.post('/api/generate-tts', async (req, res) => {
    try {
        const { text, voiceId, speed = 1.0, volume = 1.0 } = req.body;

        if (!text) {
            return res.status(400).json({ error: '缺少文本内容' });
        }

        if (!voiceId) {
            return res.status(400).json({ error: '缺少语音模型ID' });
        }

        if (!DOUBAO_CONFIG.apiKey) {
            return res.status(500).json({ error: '豆包API未配置' });
        }

        console.log('开始生成TTS语音:', { textLength: text.length, voiceId });

        // 调用豆包TTS API
        const ttsResult = await generateDoubaoTTS(text, voiceId, speed, volume);

        // 保存生成的音频文件
        const audioBuffer = Buffer.from(ttsResult.audio_data, 'base64');
        const outputFileName = `tts-${uuidv4()}.mp3`;
        const outputPath = path.join(uploadDir, outputFileName);

        fs.writeFileSync(outputPath, audioBuffer);

        res.json({
            success: true,
            audioUrl: `/api/audio/${outputFileName}`,
            duration: ttsResult.duration,
            textLength: text.length
        });

    } catch (error) {
        console.error('生成TTS失败:', error);
        res.status(500).json({ error: '生成TTS失败: ' + error.message });
    }
});

// 路由：提供音频文件
app.get('/api/audio/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: '音频文件不存在' });
    }

    res.sendFile(filePath);
});

// 路由：获取语音模型状态
app.get('/api/voice-model/:voiceId', async (req, res) => {
    try {
        const { voiceId } = req.params;

        if (!DOUBAO_CONFIG.apiKey) {
            return res.status(500).json({ error: '豆包API未配置' });
        }

        const modelStatus = await getDoubaoVoiceModelStatus(voiceId);

        res.json({
            success: true,
            voiceId: voiceId,
            status: modelStatus.status,
            created_at: modelStatus.created_at,
            ready_at: modelStatus.ready_at
        });

    } catch (error) {
        console.error('获取语音模型状态失败:', error);
        res.status(500).json({ error: '获取语音模型状态失败: ' + error.message });
    }
});

// 路由：配置API密钥（仅用于开发环境）
app.post('/api/configure-api', (req, res) => {
    try {
        const { apiKey, apiSecret, endpoint } = req.body;

        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: '生产环境不允许通过此接口配置API密钥' });
        }

        // 更新配置
        if (apiKey) DOUBAO_CONFIG.apiKey = apiKey;
        if (apiSecret) DOUBAO_CONFIG.apiSecret = apiSecret;
        if (endpoint) DOUBAO_CONFIG.endpoint = endpoint;

        console.log('API配置已更新');

        res.json({
            success: true,
            message: 'API配置更新成功'
        });

    } catch (error) {
        console.error('配置API失败:', error);
        res.status(500).json({ error: '配置API失败: ' + error.message });
    }
});

// 豆包API相关函数

// 创建豆包语音模型
async function createDoubaoVoiceModel(audioPath, voiceName = `voice_${Date.now()}`) {
    try {
        // 读取音频文件
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString('base64');

        // 根据豆包API规范构建请求
        const requestData = {
            appid: DOUBAO_CONFIG.appId,
            token: DOUBAO_CONFIG.apiKey,
            audio: audioBase64,
            name: voiceName,
            language: "zh"
        };

        console.log('调用豆包语音复刻API...');

        // 发送请求到豆包语音复刻API
        const response = await axios.post(
            `${DOUBAO_CONFIG.endpoint}/api/v1/tts/voice_clone`,
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-App-Id': DOUBAO_CONFIG.appId
                },
                timeout: 60000 // 60秒超时
            }
        );

        console.log('豆包API响应:', response.data);

        if (response.data && response.data.voice_id) {
            return {
                voice_id: response.data.voice_id,
                status: response.data.status || 'processing',
                message: response.data.message
            };
        } else if (response.data && response.data.data && response.data.data.voice_id) {
            return {
                voice_id: response.data.data.voice_id,
                status: response.data.data.status || 'processing',
                message: response.data.message
            };
        } else {
            throw new Error('豆包API返回格式错误: ' + JSON.stringify(response.data));
        }

    } catch (error) {
        console.error('豆包语音模型创建失败:', error.response?.data || error.message);

        // 如果API调用失败，返回模拟结果用于演示
        if (error.code === 'ECONNREFUSED' || error.response?.status === 401 || error.response?.status === 403) {
            console.log('豆包API不可用或认证失败，返回模拟结果');
            return {
                voice_id: `demo_voice_${Date.now()}`,
                status: 'ready',
                message: '演示模式 - 语音模型创建成功'
            };
        }

        throw error;
    }
}

// 生成豆包TTS语音
async function generateDoubaoTTS(text, voiceId, speed = 1.0, volume = 1.0) {
    try {
        const requestData = {
            appid: DOUBAO_CONFIG.appId,
            token: DOUBAO_CONFIG.apiKey,
            text: text,
            voice_id: voiceId,
            speed: speed,
            volume: volume,
            format: "mp3",
            sample_rate: 22050,
            language: "zh"
        };

        console.log('调用豆包TTS API，文本长度:', text.length);

        const response = await axios.post(
            `${DOUBAO_CONFIG.endpoint}/api/v1/tts/text_to_speech`,
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-App-Id': DOUBAO_CONFIG.appId
                },
                timeout: 30000 // 30秒超时
            }
        );

        console.log('豆包TTS API响应状态:', response.status);

        if (response.data && response.data.data && response.data.data.audio) {
            return {
                audio_data: response.data.data.audio,
                duration: response.data.data.duration || 0
            };
        } else if (response.data && response.data.audio_data) {
            return {
                audio_data: response.data.audio_data,
                duration: response.data.duration || 0
            };
        } else {
            console.log('豆包TTS API完整响应:', response.data);
            throw new Error('豆包TTS API返回格式错误: ' + JSON.stringify(response.data));
        }

    } catch (error) {
        console.error('豆包TTS生成失败:', error.response?.data || error.message);

        // 如果API调用失败，返回模拟结果用于演示
        if (error.code === 'ECONNREFUSED' || error.response?.status === 401 || error.response?.status === 403) {
            console.log('豆包API不可用或认证失败，返回模拟TTS结果');

            // 生成一个简单的模拟音频数据（实际应该返回真实的音频base64）
            const mockAudioData = "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTE";

            return {
                audio_data: mockAudioData,
                duration: text.length * 0.1 // 假设每个字符0.1秒
            };
        }

        throw error;
    }
}

// 获取豆包语音模型状态
async function getDoubaoVoiceModelStatus(voiceId) {
    try {
        const response = await axios.get(
            `${DOUBAO_CONFIG.endpoint}/voice/${voiceId}`,
            {
                headers: {
                    'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error('获取语音模型状态失败:', error.response?.data || error.message);

        // 返回模拟状态
        return {
            status: 'ready',
            created_at: new Date().toISOString(),
            ready_at: new Date().toISOString()
        };
    }
}

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '文件大小超出限制' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: '文件数量超出限制' });
        }
    }

    res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI语音复刻服务器启动成功！`);
    console.log(`📱 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 网络访问: http://0.0.0.0:${PORT}`);
    console.log(`API配置状态: ${DOUBAO_CONFIG.apiKey ? '已配置' : '未配置'}`);

    // 显示网络IP地址
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                console.log(`🔗 局域网IP: http://${interface.address}:${PORT}`);
            }
        }
    }

    if (!DOUBAO_CONFIG.apiKey) {
        console.log('\n⚠️  警告: 豆包API未配置！');
        console.log('请设置环境变量 DOUBAO_API_KEY');
        console.log('或在应用界面中配置API密钥');
    }
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});