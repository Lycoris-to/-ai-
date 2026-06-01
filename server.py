"""
数据结构学习网站 - Flask 后端
提供静态文件服务和 AI 代码分析/对话 API
"""
import json
import os
import sys
import io
import requests as req

# 修复 Windows GBK 编码问题
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

# --------------- 配置 ---------------
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
API_MODEL = os.environ.get('CLAUDE_MODEL', 'claude-sonnet-4-6')

import hashlib
import hmac
import time

def _resolve_api_key(request_data=None):
    """解析 API Key 优先级：request body > env var"""
    if request_data:
        req_key = request_data.get('_api_key', '')
        if req_key:
            return req_key
    return ANTHROPIC_API_KEY

def _resolve_model(request_data=None):
    """解析模型名称"""
    if request_data and request_data.get('_model', ''):
        return request_data['_model']
    return API_MODEL

def _resolve_base_url(request_data=None):
    """解析 API Base URL"""
    if request_data and request_data.get('_api_base', ''):
        return request_data['_api_base']
    return None  # None = 使用 Anthropic SDK 默认

# --------------- 静态文件 ---------------

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# --------------- AI 代码分析 API ---------------

SYSTEM_PROMPT = """你是一位资深数据结构与算法教学专家。你的任务是分析学生提交的代码，帮助他们发现并理解问题。

## 你的分析要求：
1. 仔细阅读代码，理解其意图
2. 从以下维度进行检查：
   - 概念理解：数据结构选型是否正确，算法思想是否正确
   - 逻辑推理：算法步骤是否完整，边界条件是否正确，递归逻辑是否正确
   - 代码实现：指针操作、循环条件、内存管理是否有错误
   - 复杂度分析：时间复杂度、空间复杂度是否合理
3. 用中文给出分析结果

## 输出格式（严格JSON）：
{
  "overall_assessment": "对代码的总体评价，100-200字",
  "issues": [
    {
      "severity": "error|warning|info",
      "line": 行号（如果可以确定）,
      "description": "问题描述",
      "fix": "具体的修正建议"
    }
  ],
  "corrected_code": "修正后的完整代码（如果需要修正的话）"
}

## 注意：
- severity 为 "error" 表示会导致程序崩溃或结果错误的严重问题
- severity 为 "warning" 表示逻辑缺陷、边界遗漏等潜在问题
- severity 为 "info" 表示优化建议
- 如果代码非常完善，issues 可以为空数组
- 只输出JSON，不要输出其他内容"""


@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    """AI 代码分析接口"""
    data = request.get_json()

    api_key = _resolve_api_key(data)
    if not api_key:
        return jsonify({
            'error': '未配置 API Key',
            'message': '请在设置中配置 API Key，或在环境变量中设置 ANTHROPIC_API_KEY'
        }), 500
    if not data or 'code' not in data:
        return jsonify({'error': '请提供代码内容'}), 400

    code = data['code'].strip()
    language = data.get('language', 'cpp')

    if len(code) < 10:
        return jsonify({'error': '代码太短，请提供更完整的代码片段'}), 400

    user_message = f"""请分析以下{language}代码：

```{language}
{code}
```

请严格按照 JSON 格式输出分析结果。"""

    model = _resolve_model(data)
    api_base = _resolve_base_url(data)

    try:
        if api_base:
            import requests as req
            headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
            chat_url = api_base.rstrip('/') + '/chat/completions'
            payload = {
                'model': model,
                'messages': [
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': user_message}
                ],
                'max_tokens': 4096
            }
            resp = req.post(chat_url, headers=headers, json=payload, timeout=120)
            if resp.status_code != 200:
                return jsonify({'error': f'API 返回错误 ({resp.status_code})：{resp.text[:300]}'}), 500
            data_resp = resp.json()
            response_text = data_resp['choices'][0]['message']['content']
        else:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
            message = client.messages.create(
                model=model,
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                messages=[{'role': 'user', 'content': user_message}]
            )
            response_text = message.content[0].text

        response_text = message.content[0].text
        json_str = response_text.strip()
        if json_str.startswith('```'):
            lines = json_str.split('\n')
            json_str = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])

        result = json.loads(json_str)
        return jsonify(result)

    except json.JSONDecodeError as e:
        return jsonify({
            'error': 'AI 返回格式解析失败',
            'message': str(e),
            'raw_response': response_text[:500] if 'response_text' in dir() else ''
        }), 500
    except ImportError:
        return jsonify({
            'error': '缺少依赖库',
            'message': '请安装 anthropic: pip install anthropic'
        }), 500
    except Exception as e:
        error_msg = str(e)
        if '401' in error_msg or 'Unauthorized' in error_msg:
            return jsonify({'error': 'API Key 无效', 'message': '请检查 ANTHROPIC_API_KEY 是否正确'}), 500
        if '429' in error_msg:
            return jsonify({'error': 'API 请求频率过高', 'message': '请稍后重试'}), 500
        return jsonify({'error': '分析失败', 'message': error_msg}), 500


# --------------- AI 对话 API ---------------

CHAT_SYSTEM_PROMPT = """你是一位资深的《数据结构与算法》教学专家，兼 AI 学习助手。你的任务是用通俗易懂、有亲和力的方式帮助学生理解数据结构知识。

## 你的风格
- 用通俗的语言解释复杂概念，善用生活中的类比
- 对学生的代码问题，先指出问题根源，再给出修正方案
- 回答结构化：先给结论，再展开细节，最后给出总结或延伸思考
- 如果学生问了与当前学习章节相关的问题，优先结合该章节内容回答

## 你的能力
- 解释任何数据结构概念（线性表、树、图、排序、查找等）
- 分析代码问题并给出修正（时间复杂度、逻辑错误、边界条件等）
- 生成针对性练习题
- 对比不同数据结构的适用场景和优劣

## 回复格式
- 使用 Markdown 格式
- 代码放在 ``` 代码块中并标注语言
- 重要概念用 **粗体** 标注
- 用简单列表组织信息

## 当前学习上下文
{context}

请根据以上上下文，针对性地回答学生的问题。如果学生没有指定上下文，就当做一般的数据结构问题回答。"""


@app.route('/api/chat', methods=['POST'])
def chat():
    """AI 对话接口 - 支持多种 API 提供商"""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': '请提供消息内容'}), 400

    api_key = _resolve_api_key(data)
    if not api_key:
        return jsonify({
            'error': '未配置 API Key',
            'message': '请在设置中配置 API Key，或在环境变量中设置 ANTHROPIC_API_KEY'
        }), 500

    message = data['message'].strip()
    context = data.get('context', '')
    history = data.get('history', [])
    model = _resolve_model(data)
    api_base = _resolve_base_url(data)

    if len(message) < 2:
        return jsonify({'error': '消息太短'}), 400

    system_prompt = CHAT_SYSTEM_PROMPT.format(
        context=context if context else '学生当前未在浏览特定知识点，请一般性地回答问题。'
    )

    messages = []
    for h in history[-20:]:
        role = h.get('role', 'user')
        content = h.get('content', '')
        if content:
            messages.append({'role': role, 'content': content})
    messages.append({'role': 'user', 'content': message})

    try:
        if api_base:
            # OpenAI 兼容 API（支持 DeepSeek, 智谱, 自定义等）
            import requests as req
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            chat_url = api_base.rstrip('/') + '/chat/completions'
            payload = {
                'model': model,
                'messages': [
                    {'role': 'system', 'content': system_prompt}
                ] + messages,
                'max_tokens': 4096,
                'temperature': 0.7
            }
            resp = req.post(chat_url, headers=headers, json=payload, timeout=120)
            if resp.status_code != 200:
                return jsonify({'error': f'API 返回错误 ({resp.status_code})：{resp.text[:300]}'}), 500
            data_resp = resp.json()
            reply = data_resp['choices'][0]['message']['content']
        else:
            # Anthropic SDK 原生调用
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
            response = client.messages.create(
                model=model,
                max_tokens=4096,
                system=system_prompt,
                messages=messages
            )
            reply = response.content[0].text

        return jsonify({'reply': reply})

    except ImportError:
        return jsonify({
            'error': '缺少依赖库',
            'message': '请安装 anthropic: pip install anthropic'
        }), 500
    except Exception as e:
        error_msg = str(e)
        if '401' in error_msg or 'Unauthorized' in error_msg:
            return jsonify({'error': 'API Key 无效，请检查配置'}), 500
        if '429' in error_msg:
            return jsonify({'error': 'API 请求频率过高，请稍后重试'}), 500
        return jsonify({'error': f'AI 响应失败：{error_msg}'}), 500


# --------------- 启动 ---------------

if __name__ == '__main__':
    if not ANTHROPIC_API_KEY:
        print("=" * 60)
        print("WARNING: ANTHROPIC_API_KEY not set")
        print("AI features require API Key from https://console.anthropic.com/")
        print("Set with: set ANTHROPIC_API_KEY=sk-ant-xxx")
        print("=" * 60)
    else:
        print(f"API Key configured (model: {API_MODEL})")

    print("\nServer starting...")
    print("Open http://localhost:5000 in your browser")
    print("Press Ctrl+C to stop\n")

    app.run(host='127.0.0.1', port=5000, debug=True)
