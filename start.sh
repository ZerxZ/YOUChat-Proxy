#!/bin/bash

# 安装依赖包
npm install

# 设置代理的网站：you、perplexity、happyapi
export ACTIVE_PROVIDER=you

# 设置是否启用手动登录
export USE_MANUAL_LOGIN=true

# 是否允许非Pro账户
export ALLOW_NON_PRO=false

# 设置自定义终止符(用于处理输出停不下来情况，留空则不启用，使用双引号包裹)
export CUSTOM_END_MARKER="<CHAR_turn>"

# 设置是否启用延迟发送请求，如果设置false卡发送请求尝试打开它
export ENABLE_DELAY_LOGIC=false

# 设置是否启用隧道访问
export ENABLE_TUNNEL=false

# 设置隧道类型 (localtunnel 或 ngrok)
export TUNNEL_TYPE=ngrok

# 设置localtunnel子域名(留空则为随机域名)
export SUBDOMAIN=

# 设置 ngrok AUTH TOKEN
# 这是 ngrok 账户的身份验证令牌。可以在 ngrok 仪表板的 "Auth" 部分找到它。
# 免费账户和付费账户都需要设置此项。
# ngrok网站: https://dashboard.ngrok.com
export NGROK_AUTH_TOKEN=

# 设置 ngrok 自定义域名
# 这允许使用自己的域名而不是 ngrok 的随机子域名。
# 注意：此功能仅适用于 ngrok 付费账户。
# 使用此功能前，请确保已在 ngrok 仪表板中添加并验证了该域名。
# 格式示例：your-custom-domain.com
# 如果使用免费账户或不想使用自定义域名，请将此项留空。
export NGROK_CUSTOM_DOMAIN=

# 设置 https_proxy 代理，可以使用本地的socks5或http(s)代理
# 例如，使用 HTTP 代理：export https_proxy=http://127.0.0.1:7890
# 或者使用 SOCKS5 代理：export https_proxy=socks5://host:port:username:password
export https_proxy=

# 设置 PASSWORD API密码
export PASSWORD=

# 设置 PORT 端口
export PORT=8080

# 设置AI模型(Claude系列模型直接在酒馆中选择即可使用，修改`AI_MODEL`环境变量可以切换Claude以外的模型，支持的模型名字如下 (请参考官网获取最新模型))
export AI_MODEL=

# 自定义会话模式
export USE_CUSTOM_MODE=false

# 启用模式轮换
# 只有当 USE_CUSTOM_MODE 和 ENABLE_MODE_ROTATION 都设置为 true 时，才会启用模式轮换功能。
# 可以在自定义模式和默认模式之间动态切换
export ENABLE_MODE_ROTATION=false

# 是否启用隐身模式
export INCOGNITO_MODE=false

# 设置上传文件格式 (docx 或 txt) gpt_4o 使用txt可能更好破限
export UPLOAD_FILE_FORMAT=docx

# ---------------------------------------------------
# 控制是否在开头插入乱码
export ENABLE_GARBLED_START=false
# 设置开头插入乱码最小长度
export GARBLED_START_MIN_LENGTH=1000
# 设置开头插入乱码最大长度
export GARBLED_START_MAX_LENGTH=5000
# 设置结尾插入乱码固定长度
export GARBLED_END_LENGTH=500
# 控制是否在结尾插入乱码
export ENABLE_GARBLED_END=false
# ---------------------------------------------------

# 运行 Node.js 应用程序
node index.mjs

read -p "Press any key to exit..."
