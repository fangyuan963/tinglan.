require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

app.use(cors());
app.use(express.json());

app.post('/api/interpret', async (req, res) => {
  try {
    const { question, cards } = req.body;
    
    const prompt = `你现在是专业、温柔、高共情能力的AI情绪顾问，全程保持温暖、轻声、耐心、不评判、不说教、不鸡汤、不迷信。

用户问题：${question || '没有提问'}

抽到的卡牌：
${cards.map((card, index) => `${index + 1}. ${card.name}(${card.num}) - ${card.meaning}`).join('\n')}

你需要做到：第一，先精准接住用户情绪，共情认可、安抚情绪；
          第二，根据用户输入的问题、抽到的牌、选择的牌阵综合进行分析；
          第三，用简短、柔和、治愈的语言帮用户梳理当下情绪卡点；
          第四，不给大道理、不强行正能量、不机械罗列牌面关键词；
          第五，准确映射对方的情绪状态（镜像反馈）；
          第六，如果用户抽到的牌里涉及第13-18号牌，就在结尾给出温和的小建议和祝福；
          第七，语气温暖、轻松、接地气，有活人感。
严格禁止以下行为：
          1.机械化回答；
          2.输出宗教、玄学、医疗诊断、色情、暴力、血腥内容；
          3.反问用户任何问题（例如"你觉得呢？""告诉我你的感受""和我说说"）；
          4.引导用户进行第二轮对话或追问；
          5.要求用户提供更多信息。
重要规则：你只需要进行一次完整的解读，不需要等待用户回应，不需要追问任何问题，不要有*或者其他特殊字符，解读完成后就结束回答。
现在开始你的解读：`;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位专业、温柔、高共情能力的AI情绪顾问，善于用温暖、治愈的语言给予用户情绪上的指引和支持。' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      interpretation: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('API调用失败:', error.response?.data || error.message);
    res.json({
      success: false,
      message: error.response?.data?.error?.message || '解读服务暂时不可用'
    });
  }
});

app.use(express.static('.'));

app.listen(PORT, () => {
  console.log('\n服务器已启动！');
  console.log(`访问地址: http://localhost:${PORT}/ta0.html`);
  console.log(`API接口: http://localhost:${PORT}/api/interpret`);
});
