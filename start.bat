@echo off

REM 安装依赖包
call npm install

REM 设置代理的网站：you、perplexity
set ACTIVE_PROVIDER=you

REM 设置是否启用手动登录
set USE_MANUAL_LOGIN=true

REM 是否允许非Pro账户
set ALLOW_NON_PRO=false

REM 设置自定义终止符(用于处理输出停不下来情况，留空则不启用，使用双引号包裹)
set CUSTOM_END_MARKER="<CHAR_turn>"

REM 设置是否启用延迟发送请求，如果设置false卡发送请求尝试打开它
set ENABLE_DELAY_LOGIC=false

REM 设置是否启用隧道访问
set ENABLE_TUNNEL=false

REM 设置隧道类型 (localtunnel 或 ngrok)
set TUNNEL_TYPE=ngrok

REM 设置localtunnel子域名(留空则为随机域名)
set SUBDOMAIN=

REM 设置 ngrok AUTH TOKEN
REM 这是 ngrok 账户的身份验证令牌。可以在 ngrok 仪表板的 "Auth" 部分找到它。
REM 免费账户和付费账户都需要设置此项。
REM ngrok网站: https://dashboard.ngrok.com
set NGROK_AUTH_TOKEN=

REM 设置 ngrok 自定义域名
REM 这允许使用自己的域名而不是 ngrok 的随机子域名。
REM 注意：此功能仅适用于 ngrok 付费账户。
REM 使用此功能前，请确保已在 ngrok 仪表板中添加并验证了该域名。
REM 格式示例：your-custom-domain.com
REM 如果使用免费账户或不想使用自定义域名，请将此项留空。
set NGROK_CUSTOM_DOMAIN=

REM 设置 https_proxy 代理，可以使用本地的socks5或http(s)代理
REM 例如，使用 HTTP 代理：export https_proxy=http://127.0.0.1:7890
REM 或者使用 SOCKS5 代理：export https_proxy=socks5://host:port:username:password
set https_proxy=

REM 设置 PASSWORD API密码
set PASSWORD=

REM 设置 PORT 端口
set PORT=8080

REM 设置AI模型(Claude系列模型直接在酒馆中选择即可使用，修改`AI_MODEL`环境变量可以切换Claude以外的模型，支持的模型名字如下 (请参考官网获取最新模型))
set AI_MODEL=

REM 自定义会话模式
set USE_CUSTOM_MODE=false

REM 启用模式轮换
REM 只有当 USE_CUSTOM_MODE 和 ENABLE_MODE_ROTATION 都设置为 true 时，才会启用模式轮换功能。
REM 可以在自定义模式和默认模式之间动态切换
set ENABLE_MODE_ROTATION=false

REM 是否启用隐身模式
set INCOGNITO_MODE=false

REM 设置上传文件格式 (docx 或 txt) gpt_4o 使用txt可能更好破限
set UPLOAD_FILE_FORMAT=docx

REM 运行 Node.js 应用程序
node index.mjs

REM 暂停脚本执行,等待用户按任意键退出
pause
