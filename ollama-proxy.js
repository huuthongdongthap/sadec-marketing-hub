#!/usr/bin/env node
/**
 * Ollama Bridge Proxy for Claude Code CLI
 * Translates OpenAI API format → Ollama native API (with think:false)
 * Then translates Ollama response back → OpenAI format
 * 
 * Listens on port 11435, forwards to Ollama native on 11434
 */

const http = require('http');

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const PROXY_PORT = 11435;

function forwardToOllama(path, method, headers, body, res) {
    const options = {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: path,
        method: method,
        headers: { ...headers, host: `${OLLAMA_HOST}:${OLLAMA_PORT}` },
    };
    if (body) options.headers['content-length'] = Buffer.byteLength(body);

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Bad Gateway: ' + err.message }));
    });
    if (body) proxyReq.write(body);
    proxyReq.end();
}

function handleOpenAIChatCompletion(body, res) {
    let parsed;
    try {
        parsed = JSON.parse(body);
    } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
    }

    const isStreaming = parsed.stream === true;

    // Map Anthropic model names → Ollama
    const MODEL_MAP = {
        'claude-sonnet-4-20250514': 'qwen3.5-fast',
        'claude-3-5-sonnet-20241022': 'qwen3.5-fast',
        'claude-3-haiku-20240307': 'qwen3.5-fast',
        'claude-3-opus-20240229': 'qwen3.5-fast',
    };
    const requestedModel = parsed.model || 'qwen3.5-fast';
    const ollamaModel = MODEL_MAP[requestedModel] || requestedModel;

    // Convert OpenAI format → Ollama native
    const ollamaReq = {
        model: ollamaModel,
        messages: parsed.messages || [],
        stream: isStreaming,
        think: false,  // KEY: disable thinking!
        options: {
            num_predict: parsed.max_tokens || 4096,
        },
    };

    if (parsed.temperature !== undefined) ollamaReq.options.temperature = parsed.temperature;
    if (parsed.top_p !== undefined) ollamaReq.options.top_p = parsed.top_p;
    if (parsed.stop) ollamaReq.options.stop = parsed.stop;

    const ollamaBody = JSON.stringify(ollamaReq);

    const options = {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/chat',
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(ollamaBody),
        },
    };

    if (isStreaming) {
        // Streaming mode
        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(200, {
                'content-type': 'text/event-stream',
                'cache-control': 'no-cache',
                'connection': 'keep-alive',
            });

            let buffer = '';
            proxyRes.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const ollamaChunk = JSON.parse(line);
                        const content = ollamaChunk.message?.content || '';
                        const done = ollamaChunk.done || false;

                        if (done) {
                            const finishChunk = {
                                id: 'chatcmpl-proxy',
                                object: 'chat.completion.chunk',
                                created: Math.floor(Date.now() / 1000),
                                model: ollamaChunk.model || parsed.model,
                                choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
                            };
                            res.write(`data: ${JSON.stringify(finishChunk)}\n\n`);
                            res.write('data: [DONE]\n\n');
                        } else if (content) {
                            const sseChunk = {
                                id: 'chatcmpl-proxy',
                                object: 'chat.completion.chunk',
                                created: Math.floor(Date.now() / 1000),
                                model: ollamaChunk.model || parsed.model,
                                choices: [{ index: 0, delta: { content: content }, finish_reason: null }],
                            };
                            res.write(`data: ${JSON.stringify(sseChunk)}\n\n`);
                        }
                    } catch (e) {
                        // skip unparseable lines
                    }
                }
            });

            proxyRes.on('end', () => {
                res.end();
            });
        });

        proxyReq.on('error', (err) => {
            console.error('Stream proxy error:', err.message);
            res.writeHead(502);
            res.end(JSON.stringify({ error: err.message }));
        });
        proxyReq.write(ollamaBody);
        proxyReq.end();

    } else {
        // Non-streaming mode
        const proxyReq = http.request(options, (proxyRes) => {
            let responseBody = '';
            proxyRes.on('data', chunk => { responseBody += chunk; });
            proxyRes.on('end', () => {
                try {
                    const ollamaRes = JSON.parse(responseBody);
                    const content = ollamaRes.message?.content || '';
                    const openaiRes = {
                        id: 'chatcmpl-proxy-' + Date.now(),
                        object: 'chat.completion',
                        created: Math.floor(Date.now() / 1000),
                        model: ollamaRes.model || parsed.model,
                        system_fingerprint: 'fp_ollama_proxy',
                        choices: [{
                            index: 0,
                            message: { role: 'assistant', content: content },
                            finish_reason: ollamaRes.done_reason === 'length' ? 'length' : 'stop',
                        }],
                        usage: {
                            prompt_tokens: ollamaRes.prompt_eval_count || 0,
                            completion_tokens: ollamaRes.eval_count || 0,
                            total_tokens: (ollamaRes.prompt_eval_count || 0) + (ollamaRes.eval_count || 0),
                        },
                    };

                    const body = JSON.stringify(openaiRes);
                    res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) });
                    res.end(body);
                } catch (e) {
                    console.error('Parse error:', e.message);
                    res.writeHead(502);
                    res.end(JSON.stringify({ error: 'Failed to parse Ollama response' }));
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.error('Proxy error:', err.message);
            res.writeHead(502);
            res.end(JSON.stringify({ error: err.message }));
        });
        proxyReq.write(ollamaBody);
        proxyReq.end();
    }
}

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        // Intercept OpenAI chat completions endpoint
        if (req.url === '/v1/chat/completions' && req.method === 'POST') {
            handleOpenAIChatCompletion(body, res);
            return;
        }

        // Handle /v1/models — CC CLI validates model existence via this endpoint
        if (req.url === '/v1/models' && req.method === 'GET') {
            const tagReq = http.request({
                hostname: OLLAMA_HOST, port: OLLAMA_PORT,
                path: '/api/tags', method: 'GET',
            }, (tagRes) => {
                let tagBody = '';
                tagRes.on('data', c => { tagBody += c; });
                tagRes.on('end', () => {
                    try {
                        const tags = JSON.parse(tagBody);
                        const models = [];
                        for (const m of (tags.models || [])) {
                            models.push({ id: m.name, object: 'model', created: Math.floor(Date.now() / 1000), owned_by: 'ollama' });
                            // Also add without :latest suffix
                            const bare = m.name.replace(/:latest$/, '');
                            if (bare !== m.name) {
                                models.push({ id: bare, object: 'model', created: Math.floor(Date.now() / 1000), owned_by: 'ollama' });
                            }
                        }
                        // Add Anthropic model aliases that CC CLI might look for
                        for (const alias of ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']) {
                            models.push({ id: alias, object: 'model', created: Math.floor(Date.now() / 1000), owned_by: 'ollama-proxy' });
                        }
                        const resp = JSON.stringify({ object: 'list', data: models });
                        res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(resp) });
                        res.end(resp);
                    } catch (e) {
                        res.writeHead(502);
                        res.end(JSON.stringify({ error: 'Failed to parse Ollama tags' }));
                    }
                });
            });
            tagReq.on('error', (err) => { res.writeHead(502); res.end(JSON.stringify({ error: err.message })); });
            tagReq.end();
            return;
        }

        // Pass everything else directly to Ollama
        forwardToOllama(req.url, req.method, req.headers, body, res);
    });
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
    console.log(`🚀 Ollama Bridge Proxy running on http://127.0.0.1:${PROXY_PORT}`);
    console.log(`   OpenAI /v1/chat/completions → Ollama /api/chat (think:false)`);
    console.log(`   All other routes → Ollama passthrough`);
});
