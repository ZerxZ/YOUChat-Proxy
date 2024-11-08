import express from "express";
import { createEvent, getGitRevision } from "./utils.js";
import YouProvider from "./provider.js";
import localtunnel from "localtunnel";
import ngrok from 'ngrok';
import { v4 as uuidv4 } from "uuid";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import path from "node:path";
import './proxyAgent.js';
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 8080;
const validApiKey = process.env.PASSWORD;
const availableModels = [
    "openai_o1",
    "gpt_4o",
    "gpt_4_turbo",
    "gpt_4",
    "claude_3_5_sonnet",
    "claude_3_opus",
    "claude_3_sonnet",
    "claude_3_haiku",
    "claude_2",
    "llama3",
    "gemini_pro",
    "gemini_1_5_pro",
    "gemini_1_5_flash",
    "databricks_dbrx_instruct",
    "command_r",
    "command_r_plus",
    "zephyr",
];
const modelMappping = {
    "claude-3-5-sonnet-latest": "claude_3_5_sonnet",
    "claude-3-5-sonnet-20241022": "claude_3_5_sonnet",
    "claude-3-5-sonnet-20240620": "claude_3_5_sonnet",
    "claude-3-20240229": "claude_3_opus",
    "claude-3-opus-20240229": "claude_3_opus",
    "claude-3-sonnet-20240229": "claude_3_sonnet",
    "claude-3-haiku-20240307": "claude_3_haiku",
    "claude-2.1": "claude_2",
    "claude-2.0": "claude_2",
    "gpt-4": "gpt_4",
    "gpt-4o": "gpt_4o",
    "gpt-4-turbo": "gpt_4_turbo",
    "openai-o1": "openai_o1",
};

const getConfig = (cookies) => {
    return {
        sessions: cookies.map(cookie => {
            return {
                cookie
            }
        })
    }
}
export let youConfig = {};
// 判断文件是否存在 config.js 或者 you.config.json esm
if (existsSync(path.join(process.cwd(), "config.js"))) {
    youConfig = await import(path.join(process.cwd(), "config.js"));
} else if (existsSync(path.join(process.cwd(), "config.mjs"))) {
    youConfig = await import(path.join(process.cwd(), "config.mjs"));
}
else if (existsSync(path.join(process.cwd(), "you.config.json"))) {
    youConfig = JSON.parse(readFileSync(path.join(process.cwd(), "you.config.json"), "utf-8"));
} else {
    // import config.js

    const cookie = process.env.YOU_COOKIE?.split(/;|,|；|，/) || []
    if (cookie.length === 0) {
        console.warn("请配置 YOU_COOKIE 环境变量在 .env 文件中，多个 cookie 用逗号或分号分隔。如果没有请重新命名 .env.example 为 .env 并填写。");
        console.log("手动退出进程请安 Ctrl+C");
    }
    youConfig = getConfig(cookie);
}
let perplexityConfig = {}
if (existsSync(path.join(process.cwd(), "perplexityConfig.js"))) {
    perplexityConfig = await import(path.join(process.cwd(), "perplexityConfig.js"));
} else if (existsSync(path.join(process.cwd(), "perplexityConfig.mjs"))) {
    perplexityConfig = await import(path.join(process.cwd(), "perplexityConfig.mjs"));
} else {
    const perplexityCookie = process.env.PERPLEXITY_COOKIE?.split(/;|,|；|，/) || [];
    perplexityConfig = getConfig(perplexityCookie);
}
const provider = new YouProvider({
    youConfig, perplexityConfig
});
await provider.init();

// handle preflight request
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Access-Control-Max-Age", "86400");
        res.status(200).end();
    } else {
        next();
    }
});

// openai format model request
app.get("/v1/models", OpenAIApiKeyAuth, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const models = availableModels.map((model) => {
        return {
            id: model,
            object: "model",
            created: 1700000000,
            owned_by: "closeai",
            name: model,
        };
    });
    res.json({ object: "list", data: models });
});
// handle openai format model request
app.post("/v1/chat/completions", OpenAIApiKeyAuth, (req, res) => {
    // 用于存储请求体
    req.rawBody = "";
    req.setEncoding("utf8");

    // 接收数据
    req.on("data", function (chunk) {
        req.rawBody += chunk;
    });

    // 数据接收完毕后处理请求
    req.on("end", async () => {
        console.log("处理 OpenAI 格式的请求");
        res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        let jsonBody = JSON.parse(req.rawBody);

        // 规范化消息
        jsonBody.messages = openaiNormalizeMessages(jsonBody.messages);

        console.log("message length:" + jsonBody.messages.length);

        // 获取当前 Provider 实例
        const currentProvider = provider.provider;

        // 获取会话列表
        const sessions = currentProvider.sessions;

        // 检查是否有可用的会话
        if (!sessions || Object.keys(sessions).length === 0) {
            console.error('没有可用的会话，请检查 Provider 的初始化是否成功，或检查配置文件。');
            res.write(JSON.stringify({
                error: 'No available sessions.',
            }));
            res.end();
            return;
        }

        // 随机选择一个会话
        let randomSession = Object.keys(sessions)[Math.floor(Math.random() * Object.keys(sessions).length)];
        console.log("Using session " + randomSession);

        // 尝试映射模型
        if (jsonBody.model && modelMappping[jsonBody.model]) {
            jsonBody.model = modelMappping[jsonBody.model];
        }
        if (jsonBody.model && !availableModels.includes(jsonBody.model)) {
            res.json({ error: { code: 404, message: "Invalid Model" } });
            return;
        }
        console.log("Using model " + jsonBody.model);

        // 调用 provider 获取回复
        try {
            const { completion, cancel } = await provider.getCompletion({
                username: randomSession,
                messages: jsonBody.messages,
                stream: !!jsonBody.stream,
                proxyModel: jsonBody.model,
                useCustomMode: process.env.USE_CUSTOM_MODE === "true"
            });

            // 监听开始事件
            completion.on("start", (id) => {
                if (jsonBody.stream) {
                    // 发送消息开始
                    res.write(createEvent(":", "queue heartbeat 114514"));
                    res.write(
                        createEvent("data", {
                            id: id,
                            object: "chat.completion.chunk",
                            created: Math.floor(new Date().getTime() / 1000),
                            model: jsonBody.model,
                            system_fingerprint: "114514",
                            choices: [{
                                index: 0,
                                delta: { role: "assistant", content: "" },
                                logprobs: null,
                                finish_reason: null
                            }],
                        })
                    );
                }
            });

            // 监听完成事件
            completion.on("completion", (id, text) => {
                if (jsonBody.stream) {
                    // 发送消息增量
                    res.write(
                        createEvent("data", {
                            choices: [
                                {
                                    content_filter_results: {
                                        hate: { filtered: false, severity: "safe" },
                                        self_harm: { filtered: false, severity: "safe" },
                                        sexual: { filtered: false, severity: "safe" },
                                        violence: { filtered: false, severity: "safe" },
                                    },
                                    delta: { content: text },
                                    finish_reason: null,
                                    index: 0,
                                },
                            ],
                            created: Math.floor(new Date().getTime() / 1000),
                            id: id,
                            model: jsonBody.model,
                            object: "chat.completion.chunk",
                            system_fingerprint: "114514",
                        })
                    );
                } else {
                    // 只发送一次，发送最终响应
                    res.write(
                        JSON.stringify({
                            id: id,
                            object: "chat.completion",
                            created: Math.floor(new Date().getTime() / 1000),
                            model: jsonBody.model,
                            system_fingerprint: "114514",
                            choices: [
                                {
                                    index: 0,
                                    message: {
                                        role: "assistant",
                                        content: text,
                                    },
                                    logprobs: null,
                                    finish_reason: "stop",
                                },
                            ],
                            usage: {
                                prompt_tokens: 1,
                                completion_tokens: 1,
                                total_tokens: 1,
                            },
                        })
                    );
                    res.end();
                }
            });

            // 监听结束事件
            completion.on("end", () => {
                if (jsonBody.stream) {
                    res.write(createEvent("data", "[DONE]"));
                    res.end();
                }
            });

            // 监听客户端关闭事件
            res.on("close", () => {
                console.log(" > [Client closed]");
                completion.removeAllListeners();
                cancel();
            });
        } catch (error) {
            console.error(error);
            const errorMessage = "Error occurred, please check the log.\n\n出现错误，请检查日志：<pre>" + (error.stack || error) + "</pre>";
            if (jsonBody.stream) {
                res.write(
                    createEvent("data", {
                        choices: [
                            {
                                content_filter_results: {
                                    hate: { filtered: false, severity: "safe" },
                                    self_harm: { filtered: false, severity: "safe" },
                                    sexual: { filtered: false, severity: "safe" },
                                    violence: { filtered: false, severity: "safe" },
                                },
                                delta: { content: errorMessage },
                                finish_reason: null,
                                index: 0,
                            },
                        ],
                        created: Math.floor(new Date().getTime() / 1000),
                        id: uuidv4(),
                        model: jsonBody.model,
                        object: "chat.completion.chunk",
                        system_fingerprint: "114514",
                    })
                );
            } else {
                res.write(
                    JSON.stringify({
                        id: uuidv4(),
                        object: "chat.completion",
                        created: Math.floor(new Date().getTime() / 1000),
                        model: jsonBody.model,
                        system_fingerprint: "114514",
                        choices: [
                            {
                                index: 0,
                                message: {
                                    role: "assistant",
                                    content: errorMessage,
                                },
                                logprobs: null,
                                finish_reason: "stop",
                            },
                        ],
                        usage: {
                            prompt_tokens: 1,
                            completion_tokens: 1,
                            total_tokens: 1,
                        },
                    })
                );
            }
            res.end();
        }
    });
});

// Helper function: Normalize messages
function openaiNormalizeMessages(messages) {
    let normalizedMessages = [];
    let currentSystemMessage = "";

    for (let message of messages) {
        if (message.role === 'system') {
            if (currentSystemMessage) {
                currentSystemMessage += "\n" + message.content;
            } else {
                currentSystemMessage = message.content;
            }
        } else {
            if (currentSystemMessage) {
                normalizedMessages.push({ role: 'system', content: currentSystemMessage });
                currentSystemMessage = "";
            }
            normalizedMessages.push(message);
        }
    }

    if (currentSystemMessage) {
        normalizedMessages.push({ role: 'system', content: currentSystemMessage });
    }

    return normalizedMessages;
}


// handle anthropic format model request
app.post("/v1/messages", AnthropicApiKeyAuth, (req, res) => {
    req.rawBody = "";
    req.setEncoding("utf8");

    req.on("data", function (chunk) {
        req.rawBody += chunk;
    });

    req.on("end", async () => {
        console.log("处理 Anthropic 格式的请求");
        res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        let jsonBody = JSON.parse(req.rawBody);

        // 处理消息格式
        jsonBody.messages = anthropicNormalizeMessages(jsonBody.messages);

        if (jsonBody.system) {
            // 把系统消息加入 messages 的首条
            jsonBody.messages.unshift({ role: "system", content: jsonBody.system });
        }
        console.log("message length:" + jsonBody.messages.length);

        // 获取当前 Provider 实例
        const currentProvider = provider.provider;

        // 获取会话列表
        const sessions = currentProvider.sessions;

        // 检查是否有可用的会话
        if (!sessions || Object.keys(sessions).length === 0) {
            console.error('没有可用的会话，请检查 Provider 的初始化是否成功，或检查配置文件。');
            res.write(JSON.stringify({
                error: 'No available sessions.',
            }));
            res.end();
            return;
        }

        // 随机选择一个会话
        let randomSession = Object.keys(sessions)[Math.floor(Math.random() * Object.keys(sessions).length)];
        console.log("Using session " + randomSession);

        // decide which model to use
        let proxyModel;
        if (process.env.AI_MODEL) {
            proxyModel = process.env.AI_MODEL;
        } else if (jsonBody.model && modelMappping[jsonBody.model]) {
            proxyModel = modelMappping[jsonBody.model];
        } else {
            proxyModel = "claude_3_opus";
        }
        console.log(`Using model ${proxyModel}`);

        // call provider to get completion
        try {
            const { completion, cancel } = await provider.getCompletion({
                username: randomSession,
                messages: jsonBody.messages,
                stream: !!jsonBody.stream,
                proxyModel: proxyModel,
                useCustomMode: process.env.USE_CUSTOM_MODE === "true"
            });

            completion.on("start", (id) => {
                if (jsonBody.stream) {
                    // send message start
                    res.write(createEvent("message_start", {
                        type: "message_start",
                        message: {
                            id: `${id}`,
                            type: "message",
                            role: "assistant",
                            content: [],
                            model: proxyModel,
                            stop_reason: null,
                            stop_sequence: null,
                            usage: { input_tokens: 8, output_tokens: 1 },
                        },
                    }));
                    res.write(createEvent("content_block_start", {
                        type: "content_block_start",
                        index: 0,
                        content_block: { type: "text", text: "" }
                    }));
                    res.write(createEvent("ping", { type: "ping" }));
                }
            });

            completion.on("completion", (id, text) => {
                if (jsonBody.stream) {
                    // send message delta
                    res.write(createEvent("content_block_delta", {
                        type: "content_block_delta",
                        index: 0,
                        delta: { type: "text_delta", text: text },
                    }));
                } else {
                    // 只会发一次，发送final response
                    res.write(JSON.stringify({
                        id: id,
                        content: [
                            { text: text },
                            { id: "string", name: "string", input: {} },
                        ],
                        model: proxyModel,
                        stop_reason: "end_turn",
                        stop_sequence: null,
                        usage: { input_tokens: 0, output_tokens: 0 },
                    }));
                    res.end();
                }
            });

            completion.on("end", () => {
                if (jsonBody.stream) {
                    res.write(createEvent("content_block_stop", { type: "content_block_stop", index: 0 }));
                    res.write(createEvent("message_delta", {
                        type: "message_delta",
                        delta: { stop_reason: "end_turn", stop_sequence: null },
                        usage: { output_tokens: 12 },
                    }));
                    res.write(createEvent("message_stop", { type: "message_stop" }));
                    res.end();
                }
            });

            res.on("close", () => {
                console.log(" > [Client closed]");
                completion.removeAllListeners();
                cancel();
            });

        } catch (error) {
            console.error(error);
            const errorMessage = "Error occurred, please check the log.\\n\\n出现错误，请检查日志：<pre>" + (error.stack || error) + "</pre>";
            if (jsonBody.stream) {
                res.write(createEvent("content_block_delta", {
                    type: "content_block_delta",
                    index: 0,
                    delta: { type: "text_delta", text: errorMessage },
                }));
            } else {
                res.write(JSON.stringify({
                    id: uuidv4(),
                    content: [{ text: errorMessage }, { id: "string", name: "string", input: {} }],
                    model: proxyModel,
                    stop_reason: "error",
                    stop_sequence: null,
                    usage: { input_tokens: 0, output_tokens: 0 },
                }));
            }
            res.end();
        }
    });
});

// 辅助函数：规范化消息格式
function anthropicNormalizeMessages(messages) {
    return messages.map(message => {
        if (typeof message.content === 'string') {
            return message;
        } else if (Array.isArray(message.content)) {
            // 新版格式，提取文本内容
            const textContent = message.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');
            return { ...message, content: textContent };
        } else {
            // 未知格式，返回原始消息
            console.warn('未知的消息格式:', message);
            return message;
        }
    });
}


// handle other
app.use((req, res, next) => {
    const { revision, branch } = getGitRevision();
    res.status(404).send("Not Found (YouChat_Proxy " + revision + "@" + branch + ")");
    console.log("收到了错误路径的请求，请检查您使用的API端点是否正确。")
});

const createLocaltunnel = async (port, subdomain) => {
    const tunnelOptions = { port };
    if (subdomain) {
        tunnelOptions.subdomain = subdomain;
    }

    try {
        const tunnel = await localtunnel(tunnelOptions);
        console.log(`隧道已成功创建，可通过以下URL访问: ${tunnel.url}/v1`);
        tunnel.on("close", () => console.log("已关闭隧道"));
        return tunnel;
    } catch (error) {
        console.error("创建localtunnel隧道失败:", error);
    }
};

const createNgrok = async (port, authToken, customDomain, subdomain) => {
    const ngrokOptions = { addr: port, authtoken: authToken };

    if (customDomain) {
        ngrokOptions.hostname = customDomain;
    } else if (subdomain) {
        ngrokOptions.subdomain = subdomain;
    }

    const originalHttpProxy = process.env.HTTP_PROXY;
    const originalHttpsProxy = process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;

    try {
        const url = await ngrok.connect(ngrokOptions);
        console.log(`隧道已成功创建，可通过以下URL访问: ${url}/v1`);
        process.on('SIGTERM', async () => {
            await ngrok.kill();
            console.log("已关闭隧道");
        });
        return url;
    } catch (error) {
        console.error("创建ngrok隧道失败:", error);
    } finally {
        if (originalHttpProxy) process.env.HTTP_PROXY = originalHttpProxy;
        if (originalHttpsProxy) process.env.HTTPS_PROXY = originalHttpsProxy;
    }
};

const createTunnel = async (tunnelType, port) => {
    console.log(`创建${tunnelType}隧道中...`);
    if (tunnelType === "localtunnel") {
        return createLocaltunnel(port, process.env.SUBDOMAIN);
    } else if (tunnelType === "ngrok") {
        return createNgrok(port, process.env.NGROK_AUTH_TOKEN, process.env.NGROK_CUSTOM_DOMAIN, process.env.SUBDOMAIN);
    }
};

app.listen(port, async () => {
    console.log(`YouChat proxy listening on port ${port}`);
    if (!validApiKey) {
        console.log(`Proxy is currently running with no authentication`);
    }
    console.log(`Custom mode: ${process.env.USE_CUSTOM_MODE === "true" ? "enabled" : "disabled"}`);
    console.log(`Mode rotation: ${process.env.ENABLE_MODE_ROTATION === "true" ? "enabled" : "disabled"}`);

    if (process.env.ENABLE_TUNNEL === "true") {
        const tunnelType = process.env.TUNNEL_TYPE || "localtunnel";
        await createTunnel(tunnelType, port);
    }
});

function AnthropicApiKeyAuth(req, res, next) {
    const reqApiKey = req.header("x-api-key");

    if (validApiKey && reqApiKey !== validApiKey) {
        // If Environment variable PASSWORD is set AND x-api-key header is not equal to it, return 401
        const clientIpAddress = req.headers["x-forwarded-for"] || req.ip;
        console.log(`Receviced Request from IP ${clientIpAddress} but got invalid password.`);
        return res.status(401).json({ error: "Invalid Password" });
    }

    next();
}

function OpenAIApiKeyAuth(req, res, next) {
    const reqApiKey = req.header("Authorization");

    if (validApiKey && reqApiKey !== "Bearer " + validApiKey) {
        // If Environment variable PASSWORD is set AND Authorization header is not equal to it, return 401
        const clientIpAddress = req.headers["x-forwarded-for"] || req.ip;
        console.log(`Receviced Request from IP ${clientIpAddress} but got invalid password.`);
        return res.status(401).json({ error: { code: 403, message: "Invalid Password" } });
    }

    next();
}
