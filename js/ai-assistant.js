/* ============================================
   数据结构学习中心 - AI 助手
   浮动按钮 + 聊天面板 + 状态追踪 + API配置
   ============================================ */

// ==================== 全局上下文 ====================
window._dsContext = {
  moduleTitle: '',
  topicTitle: '',
  topicContent: '',
  topicErrors: ''
};

// ==================== API 配置管理 ====================
const ApiConfig = {
  _key: 'ds_api_config',

  defaults() {
    return {
      apiKey: '',
      provider: 'anthropic',     // anthropic | openai | custom
      apiBase: 'https://api.anthropic.com',
      model: 'claude-sonnet-4-6',
      customProvider: ''
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return this.defaults();
      return { ...this.defaults(), ...JSON.parse(raw) };
    } catch { return this.defaults(); }
  },

  save(config) {
    try {
      localStorage.setItem(this._key, JSON.stringify(config));
    } catch { /* quota exceeded */ }
  },

  isConfigured() {
    return !!this.load().apiKey;
  },

  /** 预设提供商模板 */
  providers: {
    anthropic: {
      name: 'Anthropic (Claude)',
      base: 'https://api.anthropic.com',
      models: ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5'],
      keyHint: 'sk-ant-api03-...'
    },
    openai: {
      name: 'OpenAI (GPT)',
      base: 'https://api.openai.com/v1',
      models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
      keyHint: 'sk-proj-...'
    },
    deepseek: {
      name: 'DeepSeek',
      base: 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      keyHint: 'sk-...'
    },
    zhipu: {
      name: '智谱AI (GLM)',
      base: 'https://open.bigmodel.cn/api/paas/v4',
      models: ['glm-4-plus', 'glm-4-flash'],
      keyHint: '...'
    },
    custom: {
      name: '自定义 (OpenAI兼容)',
      base: 'https://your-api-endpoint.com/v1',
      models: ['your-model-name'],
      keyHint: 'your-api-key'
    }
  }
};

// ==================== 状态管理 ====================
const StateTracker = {
  _key: 'ds_learning_state',

  defaultState() {
    return {
      chatHistory: [],
      visitedTopics: {},
      analyzeHistory: [],
      sessionsCount: 0,
      totalChats: 0,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return this.defaultState();
      return { ...this.defaultState(), ...JSON.parse(raw) };
    } catch { return this.defaultState(); }
  },

  save(state) {
    try {
      state.lastVisit = new Date().toISOString();
      localStorage.setItem(this._key, JSON.stringify(state));
    } catch {}
  },

  recordVisit(moduleTitle, topicTitle) {
    const state = this.load();
    const key = `${moduleTitle}/${topicTitle}`;
    if (!state.visitedTopics[key]) {
      state.visitedTopics[key] = { count: 0, firstVisit: new Date().toISOString() };
    }
    state.visitedTopics[key].count++;
    state.visitedTopics[key].lastVisit = new Date().toISOString();
    this.save(state);
  },

  getProgress() {
    const state = this.load();
    const totalTopics = DS_DATA.modules.reduce((sum, m) => sum + m.topics.length, 0);
    const visited = Object.keys(state.visitedTopics).length;
    return { visited, total: totalTopics, percent: Math.round((visited / totalTopics) * 100) };
  },

  addChatMessage(role, content) {
    const state = this.load();
    state.chatHistory.push({ role, content, time: new Date().toISOString() });
    if (state.chatHistory.length > 200) {
      state.chatHistory = state.chatHistory.slice(-200);
    }
    state.totalChats++;
    if (state.sessionsCount === 0) state.sessionsCount = 1;
    this.save(state);
  },

  getRecentHistory(n) {
    return this.load().chatHistory.slice(-n);
  },

  clearHistory() {
    const state = this.load();
    state.chatHistory = [];
    this.save(state);
  }
};

// ==================== AI 助手 ====================
const AIAssistant = (function() {
  let panel = null;
  let messagesContainer = null;
  let inputField = null;
  let sendBtn = null;
  let contextBar = null;
  let settingsOverlay = null;
  let isOpen = false;
  let isWaiting = false;

  // ---------- 初始化 ----------
  function init() {
    createToggleButton();
    createChatPanel();
    const state = StateTracker.load();
    state.sessionsCount++;
    StateTracker.save(state);
    console.log('[AI助手] 初始化完成, API配置:', ApiConfig.isConfigured() ? '已设置' : '未设置');
  }

  // ---------- 浮动按钮 ----------
  function createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'ai-toggle-btn';
    btn.title = 'AI 学习助手';
    btn.innerHTML = `
      <span class="ai-btn-pulse"></span>
      <span class="ai-btn-icon">🤖</span>
      <span class="ai-badge">1</span>
    `;
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
  }

  // ---------- 聊天面板 ----------
  function createChatPanel() {
    panel = document.createElement('div');
    panel.id = 'ai-chat-panel';
    panel.innerHTML = `
      <div class="ai-chat-header">
        <h3><span class="dot"></span>AI 学习助手</h3>
        <div class="header-actions">
          <button class="header-btn" title="API设置" id="ai-settings-btn">⚙️</button>
          <button class="header-btn" title="清空对话" id="ai-clear-btn">🗑️</button>
          <button class="header-btn" title="关闭" id="ai-close-btn">✕</button>
        </div>
      </div>
      <div class="ai-context-bar" id="ai-context-bar" style="display:none;">
        <span class="context-icon">📖</span>
        <span class="context-text">当前：未选择知识点</span>
      </div>
      <div class="ai-quick-actions">
        <button class="ai-quick-btn" data-action="explain">📝 解释当前知识点</button>
        <button class="ai-quick-btn" data-action="practice">✏️ 生成练习题</button>
        <button class="ai-quick-btn" data-action="debug">🐛 帮我调试代码</button>
      </div>
      <div class="ai-chat-messages" id="ai-messages"></div>
      <div class="ai-chat-input">
        <input type="text" id="ai-input" placeholder="输入你的问题..."
               autocomplete="off" />
        <button id="ai-send-btn" disabled title="发送 (Enter)">➤</button>
      </div>
    `;
    document.body.appendChild(panel);

    messagesContainer = panel.querySelector('#ai-messages');
    inputField = panel.querySelector('#ai-input');
    sendBtn = panel.querySelector('#ai-send-btn');
    contextBar = panel.querySelector('#ai-context-bar');

    // 事件绑定
    panel.querySelector('#ai-close-btn').addEventListener('click', () => close());
    panel.querySelector('#ai-clear-btn').addEventListener('click', () => clearChat());
    panel.querySelector('#ai-settings-btn').addEventListener('click', () => showSettings());

    inputField.addEventListener('input', () => {
      sendBtn.disabled = !inputField.value.trim() || isWaiting;
    });
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    sendBtn.addEventListener('click', sendMessage);

    panel.querySelector('.ai-quick-actions').addEventListener('click', (e) => {
      const btn = e.target.closest('.ai-quick-btn');
      if (!btn || isWaiting) return;
      switch (btn.dataset.action) {
        case 'explain': quickExplain(); break;
        case 'practice': quickPractice(); break;
        case 'debug': quickDebug(); break;
      }
    });

    restoreHistory();
  }

  // ---------- 开关面板 ----------
  function toggle() { isOpen ? close() : open(); }

  function open() {
    // 如果没配置 API Key，自动弹出设置
    if (!ApiConfig.isConfigured() && !StateTracker.load().chatHistory.length) {
      panel.classList.add('open');
      isOpen = true;
      updateContextBar();
      setTimeout(() => showSettings(), 400);
      return;
    }
    panel.classList.add('open');
    isOpen = true;
    updateContextBar();
    inputField.focus();
    scrollToBottom();
  }

  function close() {
    panel.classList.remove('open');
    isOpen = false;
  }

  // ---------- 上下文更新 ----------
  function updateContextBar() {
    const ctx = window._dsContext;
    if (ctx && ctx.topicTitle) {
      contextBar.style.display = 'flex';
      contextBar.querySelector('.context-text').textContent =
        `当前：${ctx.moduleTitle} / ${ctx.topicTitle}`;
    } else {
      contextBar.style.display = 'none';
    }
  }

  function getContextSummary() {
    const ctx = window._dsContext;
    if (!ctx || !ctx.topicTitle) return '';
    let text = `【当前学习内容】\n模块：${ctx.moduleTitle}\n知识点：${ctx.topicTitle}\n`;
    if (ctx.topicContent) {
      const plain = ctx.topicContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      text += `内容摘要：${plain.substring(0, 500)}\n`;
    }
    if (ctx.topicErrors) {
      text += `常见错误：${ctx.topicErrors}\n`;
    }
    return text;
  }

  // ---------- API 请求辅助 ----------
  function buildRequestBody(extra) {
    const cfg = ApiConfig.load();
    const body = { ...extra };
    // 如果用户在本地配置了 API key，传给后端
    if (cfg.apiKey) {
      body._api_key = cfg.apiKey;
    }
    if (cfg.apiBase && cfg.provider === 'custom') {
      body._api_base = cfg.apiBase;
    }
    if (cfg.model) {
      body._model = cfg.model;
    }
    return body;
  }

  // ---------- 消息管理 ----------
  function addMessage(role, content, extraClass) {
    const div = document.createElement('div');
    div.className = `ai-message ${role}${extraClass ? ' ' + extraClass : ''}`;
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <div class="msg-body">${renderContent(content)}</div>
      <div class="msg-time">${time}</div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
    if (typeof hljs !== 'undefined') {
      div.querySelectorAll('pre code').forEach(block => { hljs.highlightElement(block); });
    }
    return div;
  }

  function renderContent(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
    html = html.replace(/```(\w*)\s*([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/<br>/g, '\n');
      return `<pre><code class="language-${lang || 'cpp'}">${escaped}</code></pre>`;
    });
    html = html.replace(/(?:^|<br>)- (.+?)(?=<br>|$)/g, '<br>• $1');
    return html;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    setTimeout(() => { messagesContainer.scrollTop = messagesContainer.scrollHeight; }, 50);
  }

  // ---------- 发送消息 ----------
  async function sendMessage() {
    const text = inputField.value.trim();
    if (!text || isWaiting) return;

    // 检查 API Key
    if (!ApiConfig.isConfigured()) {
      showSettings();
      inputField.value = text.length < 100 ? text : text.substring(0, 100) + '...';
      sendBtn.disabled = false;
      return;
    }

    inputField.value = '';
    sendBtn.disabled = true;
    isWaiting = true;
    addMessage('user', text);
    StateTracker.addChatMessage('user', text);
    showTyping();

    try {
      const context = getContextSummary();
      const history = StateTracker.getRecentHistory(10)
        .filter(h => h.role === 'user' || h.role === 'assistant')
        .map(h => ({ role: h.role, content: h.content }));

      const body = buildRequestBody({ message: text, context, history });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      hideTyping();
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        addMessage('assistant', err.error || err.message || `请求失败 (${response.status})`);
      } else {
        const data = await response.json();
        addMessage('assistant', data.reply || 'AI 没有返回内容');
        StateTracker.addChatMessage('assistant', data.reply || '');
      }
    } catch (err) {
      hideTyping();
      addMessage('assistant', `❌ 连接失败：${err.message}\n\n请确认后端服务已启动。`);
    } finally {
      isWaiting = false;
      sendBtn.disabled = !inputField.value.trim();
      inputField.focus();
    }
  }

  // ---------- 快速操作 ----------
  function quickExplain() {
    const ctx = window._dsContext;
    if (!ctx || !ctx.topicTitle) {
      inputField.value = '请介绍一下数据结构的主要分类';
      sendMessage();
      return;
    }
    const question = `请详细解释【${ctx.topicTitle}】这个数据结构知识点，包括：
1. 核心概念和原理
2. 关键操作和实现要点
3. 常见错误和注意事项
4. 与其他数据结构的对比

请用通俗易懂的语言，配合具体的例子说明。`;
    sendPreset(question);
  }

  function quickPractice() {
    const ctx = window._dsContext;
    const topic = ctx && ctx.topicTitle ? ctx.topicTitle : '数据结构';
    const question = `请为【${topic}】生成2道练习题：
1. 一道基础题（考察基本概念和操作）
2. 一道进阶题（考察综合运用）
每道题请给出题目描述、解题思路提示，以及参考答案。`;
    sendPreset(question);
  }

  function quickDebug() {
    if (!isOpen) open();
    inputField.value = '请帮我检查这段代码的问题：\n\n```\n\n```';
    inputField.focus();
    sendBtn.disabled = false;
  }

  async function sendPreset(question) {
    if (!ApiConfig.isConfigured()) { open(); showSettings(); return; }
    if (!isOpen) open();
    isWaiting = true;
    sendBtn.disabled = true;
    addMessage('user', question);
    StateTracker.addChatMessage('user', question);
    showTyping();

    try {
      const context = getContextSummary();
      const history = StateTracker.getRecentHistory(10)
        .filter(h => h.role === 'user' || h.role === 'assistant')
        .map(h => ({ role: h.role, content: h.content }));

      const body = buildRequestBody({ message: question, context, history });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      hideTyping();
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        addMessage('assistant', err.error || err.message || `请求失败 (${response.status})`);
      } else {
        const data = await response.json();
        addMessage('assistant', data.reply || 'AI 没有返回内容');
        StateTracker.addChatMessage('assistant', data.reply || '');
      }
    } catch (err) {
      hideTyping();
      addMessage('assistant', `❌ 连接失败：${err.message}`);
    } finally {
      isWaiting = false;
      sendBtn.disabled = !inputField.value.trim();
    }
  }

  // ==================== API 设置弹窗 ====================
  function showSettings() {
    if (settingsOverlay) settingsOverlay.remove();

    const cfg = ApiConfig.load();
    const providerNames = Object.keys(ApiConfig.providers);

    settingsOverlay = document.createElement('div');
    settingsOverlay.className = 'ai-settings-overlay';
    settingsOverlay.innerHTML = `
      <div class="ai-settings-dialog">
        <h3>⚙️ API 设置</h3>
        <p style="color:var(--ai-text-muted);font-size:0.78rem;margin-bottom:16px;">
          配置你的 API Key 来使用 AI 功能。支持多种 AI 服务商。
          Key 仅存储在本地浏览器中，不会上传到服务器。
        </p>

        <label>AI 服务商</label>
        <select id="s-provider" style="width:100%;padding:10px 14px;border-radius:8px;border:1px
          solid var(--ai-border);background:var(--ai-bg-base);color:var(--ai-text-bright);
          font-size:0.85rem;margin-bottom:12px;outline:none;">
          ${providerNames.map(k => {
            const p = ApiConfig.providers[k];
            return `<option value="${k}" ${cfg.provider === k ? 'selected' : ''}>${p.name}</option>`;
          }).join('')}
        </select>

        <label>API Key <span style="color:var(--ai-rose);">*</span></label>
        <input type="password" id="s-apikey" value="${escapeHtml(cfg.apiKey)}"
               placeholder="${ApiConfig.providers[cfg.provider]?.keyHint || '输入你的 API Key'}"
               style="margin-bottom:8px;" />
        <p style="color:var(--ai-text-muted);font-size:0.7rem;margin-bottom:12px;">
          🔒 Key 仅保存在浏览器 localStorage 中
        </p>

        <label>API 地址 (Base URL)</label>
        <input type="text" id="s-apibase" value="${escapeHtml(cfg.apiBase)}"
               placeholder="${ApiConfig.providers[cfg.provider]?.base || ''}" />

        <label>模型名称</label>
        <div style="display:flex;gap:6px;align-items:center;">
          <select id="s-model-select" style="flex:1;padding:10px 14px;border-radius:8px;border:1px
            solid var(--ai-border);background:var(--ai-bg-base);color:var(--ai-text-bright);
            font-size:0.85rem;outline:none;">
            ${(ApiConfig.providers[cfg.provider]?.models || ['custom-model']).map(m =>
              `<option value="${m}" ${cfg.model === m ? 'selected' : ''}>${m}</option>`
            ).join('')}
          </select>
          <input type="text" id="s-model" value="${escapeHtml(cfg.model)}"
                 style="flex:1;"
                 placeholder="或手动输入模型名" />
        </div>

        <div class="ai-settings-actions" style="margin-top:20px;">
          <button class="btn-cancel" id="s-cancel">取消</button>
          <button class="btn-save" id="s-save">💾 保存设置</button>
        </div>
      </div>
    `;
    document.body.appendChild(settingsOverlay);

    // --- 事件绑定 ---
    const providerSelect = settingsOverlay.querySelector('#s-provider');
    const modelSelect = settingsOverlay.querySelector('#s-model-select');
    const modelInput = settingsOverlay.querySelector('#s-model');
    const apiBaseInput = settingsOverlay.querySelector('#s-apibase');
    const apiKeyInput = settingsOverlay.querySelector('#s-apikey');

    // 切换提供商时更新模型列表和默认地址
    providerSelect.addEventListener('change', () => {
      const p = ApiConfig.providers[providerSelect.value];
      modelSelect.innerHTML = (p.models || ['custom-model']).map(m =>
        `<option value="${m}">${m}</option>`
      ).join('');
      modelInput.value = p.models?.[0] || '';
      apiBaseInput.value = p.base || '';
      apiKeyInput.placeholder = p.keyHint || '';
    });

    // 模型下拉框同步到输入框
    modelSelect.addEventListener('change', () => {
      modelInput.value = modelSelect.value;
    });

    // 保存
    settingsOverlay.querySelector('#s-save').addEventListener('click', () => {
      const newCfg = {
        apiKey: apiKeyInput.value.trim(),
        provider: providerSelect.value,
        apiBase: apiBaseInput.value.trim(),
        model: modelInput.value.trim() || modelSelect.value,
        customProvider: providerSelect.value === 'custom' ? 'custom' : ''
      };
      ApiConfig.save(newCfg);
      settingsOverlay.remove();
      settingsOverlay = null;
      addMessage('assistant', `✅ **API 设置已保存！**

服务商：**${ApiConfig.providers[newCfg.provider]?.name || '自定义'}**
模型：**${newCfg.model}**

现在可以开始提问了！试试点击上方的快捷按钮 👆`);
      updateToggleBadge();
    });

    // 取消
    settingsOverlay.querySelector('#s-cancel').addEventListener('click', () => {
      settingsOverlay.remove();
      settingsOverlay = null;
    });

    // 点击遮罩关闭
    settingsOverlay.addEventListener('click', (e) => {
      if (e.target === settingsOverlay) {
        settingsOverlay.remove();
        settingsOverlay = null;
      }
    });

    apiKeyInput.focus();
  }

  function updateToggleBadge() {
    const badge = document.querySelector('#ai-toggle-btn .ai-badge');
    if (!badge) return;
    if (ApiConfig.isConfigured()) {
      badge.style.display = 'none';
    } else {
      badge.style.display = 'flex';
      badge.textContent = '!';
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ---------- 历史恢复 ----------
  function restoreHistory() {
    const state = StateTracker.load();
    if (state.chatHistory.length === 0) {
      addMessage('assistant', `
**👋 你好！我是 AI 学习助手**

在使用之前，请先点击 ⚙️ 按钮配置你的 API Key：

- **Anthropic Claude** — 最强代码分析能力
- **OpenAI GPT** — 通用对话
- **DeepSeek** — 高性价比国产模型
- **智谱 GLM** — 国产大模型
- **自定义** — 任何 OpenAI 兼容接口

你也可以在环境变量中设置服务器端的 Key（ANTHROPIC_API_KEY）。

当前学习进度：还未开始。在数据结构页面浏览内容时，我会自动感知你正在学习的章节。
      `.trim(), 'welcome');
      return;
    }

    const recent = state.chatHistory.slice(-20);
    recent.forEach(msg => { addMessage(msg.role, msg.content); });
    updateToggleBadge();
  }

  function clearChat() {
    messagesContainer.innerHTML = '';
    StateTracker.clearHistory();
    addMessage('assistant', '对话已清空。有什么可以帮你的？');
  }

  // ---------- 公共 API ----------
  return {
    init,
    toggle,
    open,
    close,
    updateContext() { updateContextBar(); },
    getProgress() { return StateTracker.getProgress(); },
    isOpen() { return isOpen; },
    isConfigured() { return ApiConfig.isConfigured(); },
    showSettings
  };
})();

// === 自动初始化 ===
(function() {
  function autoInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', AIAssistant.init);
    } else {
      AIAssistant.init();
    }
  }
  if (typeof window !== 'undefined') autoInit();
})();
