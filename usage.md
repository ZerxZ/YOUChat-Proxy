# 使用指南 / Usage Guide

## 前提条件 / Prerequisites

1. **安装必要的软件：**

   - Node.js 或 BunJS 或 Deno
   - Git
   - Python

2. **获得一个 You.com 账户并订阅 Pro 或 Team 计划，登录账户。**

3. **建议全局代理来确保网络连接稳定。**

4. **如果需要，可以在 `start.bat` 文件中设置代理。**

---

## 设置步骤 / Setup Steps

### 方法一：使用 Cookie 登录（默认情况下）

#### 步骤 1：获取 Cookie

1. **打开浏览器，登录 [you.com](https://you.com)。**

2. **按 `F12` 打开开发者工具，找到 "Console"（控制台）选项卡。**

3. **在控制台中输入以下代码并回车，然后复制所有输出内容（Cookie）：**

   ```javascript
   console.log(document.cookie);
   ```

#### 步骤 2：配置项目

1. **下载或克隆本项目代码，解压缩。**

2. **编辑 `.env` 文件，将上一步获取的 Cookie 粘贴进去。**

   ```ini
   # YOU 曲奇
   YOU_COOKIE=cookie1,cookie2,cookie3

   # PERPLEXITY 曲奇
   PERPLEXITY_COOKIE=cookie1,cookie2,cookie3
   ```

#### 步骤 3：配置环境变量

1. **打开 `start.bat` 文件，根据需要设置环境变量。**

#### 步骤 4：启动服务

1. **双击运行 `start.bat`。**

2. **等待程序安装依赖并启动服务。**

#### 步骤 5：配置客户端

1. **在 SillyTavern 中选择 **Custom (OpenAI-compatible)**。**

2. **将反向代理地址设置为 `http://127.0.0.1:8080/v1`。**

3. **反代密码需要填写（随便填一个即可，除非在 `start.bat` 中设置了 `PASSWORD`）。**

4. **开始使用。如果失败或没有结果，尝试多次重试。**

---

### 方法二：使用手动登录

#### 步骤 1：配置 `start.bat`

1. **打开 `start.bat` 文件，将 `USE_MANUAL_LOGIN` 设置为 `true`：**

   ```batch
   set USE_MANUAL_LOGIN=true
   ```

2. **保存并关闭 `start.bat` 文件。**

#### 步骤 2：启动服务并手动登录

1. **双击运行 `start.bat`。**

2. **程序将启动并自动打开浏览器窗口。**

3. **在弹出的浏览器窗口中手动登录的 You.com 账户。**

4. **登录成功后，程序将自动获取的会话信息。**

#### 步骤 3：配置客户端

*同方法一的步骤5*

---

## 可选配置 / Optional Configurations

### 设置代理 / Set Proxy

如果需要设置代理，请在 `start.bat` 中设置 `http_proxy` 和 `https_proxy` 环境变量。例如：

```batch
set http_proxy=http://127.0.0.1:7890
set https_proxy=http://127.0.0.1:7890
```

This project uses the local Chrome browser, which will automatically read and use the system proxy settings.

### 设置 AI 模型 / Set AI Model

可以通过设置 `AI_MODEL` 环境变量来切换使用的模型。支持的模型包括（请参考官网获取最新模型）：

- `gpt_4o`
- `gpt_4_turbo`
- `gpt_4`
- `claude_3_5_sonnet`
- `claude_3_opus`
- `claude_3_sonnet`
- `claude_3_haiku`
- `claude_2`
- `llama3`
- `gemini_pro`
- `gemini_1_5_pro`
- `databricks_dbrx_instruct`
- `command_r`
- `command_r_plus`
- `zephyr`

例如：

```batch
set AI_MODEL=claude_3_opus
```

### 启用自定义会话模式 / Enable Custom Chat Mode

启用后，可以缩短系统消息长度、禁用联网、减少等待时间，可能有助于突破限制。

```batch
set USE_CUSTOM_MODE=true
```

### 启用模式轮换 / Enable Mode Rotation

只有当 `USE_CUSTOM_MODE` 和 `ENABLE_MODE_ROTATION` 都设置为 `true` 时，才会启用模式轮换功能。

```batch
set ENABLE_MODE_ROTATION=true
```

### 启用隧道访问 / Enable Tunnel Access

如果需要从外网访问本地服务，可以启用隧道访问。支持 `ngrok` 和 `localtunnel`。

**使用 ngrok：**

1. **设置隧道类型：**

   ```batch
   set ENABLE_TUNNEL=true
   set TUNNEL_TYPE=ngrok
   ```

2. **设置 ngrok Auth Token（从 ngrok 仪表板获取）：**

   ```batch
   set NGROK_AUTH_TOKEN=your_ngrok_auth_token
   ```

3. **（可选）设置自定义域名（付费账户）：**

   ```batch
   set NGROK_CUSTOM_DOMAIN=your_custom_domain
   ```

**使用 localtunnel：**

1. **设置隧道类型：**

   ```batch
   set ENABLE_TUNNEL=true
   set TUNNEL_TYPE=localtunnel
   ```

2. **（可选）设置子域名：**

   ```batch
   set SUBDOMAIN=your_subdomain
   ```

---

## 注意事项 / Important Notes

- **关于 Cloudflare 人机验证：**

  如果在程序运行过程中弹出人机验证提示，请在30秒内完成验证。

- **关于 `ALLOW_NON_PRO` 设定：**

  如果设置为 `true`，允许使用非订阅账户，但功能会受限，可能无法正常使用。

  ```batch
  set ALLOW_NON_PRO=true
  ```

- **关于 `CUSTOM_END_MARKER` 设定：**

  当输出无法停止时，可设置自定义终止符，程序检测到该终止符后将自动停止输出。

  ```batch
  set CUSTOM_END_MARKER="<YOUR_END_MARKER>"
  ```

- **关于 `ENABLE_DELAY_LOGIC` 设定：**

  如果请求卡顿，尝试将其设置为 `true`。

  ```batch
  set ENABLE_DELAY_LOGIC=true
  ```

- **关于上传文件格式：**

  可以选择上传文件的格式为 `docx` 或 `txt`。

  ```batch
  set UPLOAD_FILE_FORMAT=docx
  ```
- **关于403问题（基本只存在于旧版本）**

  这个问题基本只存在于旧版本，新版本由于使用了浏览器模拟访问，已经不容易被拦截。

  新版本如果弹出人机验证提示，用户只需要在30秒内点击完成CloudFlare的人机验证，并且等待程序继续处理即可。

  cloudflare有一个风控分数。这个和你的TLS指纹、浏览器指纹、IP地址声誉等等有关系
  我们这个项目一直用的TLS指纹和浏览器指纹就非常可疑（都是自动化库和Node内置TLS），分数直接拉满 
  相当于已经预先有了30+30分数，剩下就看IP地址声誉（40分）你拿了几分
  （具体分数不详，只是举个例子）
  那如果你IP确实白，拿了0分，那你总共分数就是60。
  假设you那边设置了分数高于80的要跳验证码，那现在就没事
  如果你IP黑，拿了超过20分，那你就是>80分，你就要跳验证码，结果就是403
  然后最近you觉得被薅狠了，或者别的啥原因，把这个分数设置成60以上的就要跳验证码 
  结果就我IP有点黑，不管怎么搞都过不去了。
  但是同样的IP，你用正常的Google Chrome访问，就没问题，因为它的指纹非常干净，所以前面的指纹分数就很低 
  就算加上IP声誉分他也没到那条线
  总之以上是一个简化的版本，CF抗bot还有很多指标、很多策略 

---

## 在 Linux 上部署 / Deploy on Linux

可以使用 Docker 进行部署，请参照项目中的 `Dockerfile`。

---

## 常见问题 / FAQ

**Q:** 如何解决 npm 安装依赖失败的问题？

**A:** 请确保的网络连接稳定，必要时使用全局代理。

**Q:** 为什么程序提示 "两种模式均达到请求上限"？

**A:** 这可能是因为频繁请求导致模式被暂时禁用，建议稍等一段时间再尝试。

**Q:** 如何切换模型？

**A:** 编辑 `start.bat` 中的 `AI_MODEL` 环境变量，设置为想使用的模型名称(已经可以在SillyTavern设置了)。

---

## 免责声明 / Disclaimer

本项目仅供学习和研究使用，请遵守相关法律法规，勿用于任何商业或非法用途。

This project is for learning and research purposes only. Please comply with relevant laws and regulations and do not use it for any commercial or illegal purposes.

---


# Usage Guide

## Prerequisites

1. **Install necessary software:**

   - Node.js
   - Git
   - Python
   - Visual C++ Build Tools ([Download link](https://visualstudio.microsoft.com/visual-cpp-build-tools/))

2. **Obtain a You.com account and subscribe to Pro or Team plan, then log in.**

3. **Global proxy is recommended to ensure stable network connection.**

4. **If needed, you can set up a proxy in the `start.bat` file.**

---

## Setup Steps

### Method 1: Login using Cookie (Default)

#### Step 1: Obtain Cookie

1. **Open browser and log in to [you.com](https://you.com).**

2. **Press `F12` to open developer tools, find the "Console" tab.**

3. **Enter the following code in the console and press enter, then copy all output content (Cookie):**

   ```javascript
   console.log(document.cookie);
   ```

#### Step 2: Configure Project

1. **Download or clone this project code, unzip.**

2. **Edit `config.example.js` file, paste the Cookie obtained in the previous step.**

   If there are multiple Cookies, add them in the following format, then save the file as `config.js`:

   ```javascript
   export const config = {
       "sessions": [
           {
               "cookie": `cookie1`
           },
           {
               "cookie": `cookie2`
           },
           {
               "cookie": `cookie3`
           }
       ]
   }
   ```

#### Step 3: Configure Environment Variables

1. **Open `start.bat` file, set environment variables as needed.**

#### Step 4: Start Service

1. **Double-click to run `start.bat`.**

2. **Wait for the program to install dependencies and start the service.**

#### Step 5: Configure Client

1. **In SillyTavern, select **Custom (OpenAI-compatible)**.**

2. **Set the reverse proxy address to `http://127.0.0.1:8080/v1`.**

3. **Reverse proxy password needs to be filled (any value will do, unless `PASSWORD` is set in `start.bat`).**

4. **Start using. If it fails or there's no result, try multiple retries.**

---

### Method 2: Manual Login

#### Step 1: Configure `start.bat`

1. **Open `start.bat` file, set `USE_MANUAL_LOGIN` to `true`:**

   ```batch
   set USE_MANUAL_LOGIN=true
   ```

2. **Save and close `start.bat` file.**

#### Step 2: Start Service and Manual Login

1. **Double-click to run `start.bat`.**

2. **The program will start and automatically open a browser window.**

3. **Manually log in to your You.com account in the pop-up browser window.**

4. **After successful login, the program will automatically obtain the session information.**

#### Step 3: Configure Client

*Same as Step 5 in Method 1*

---

## Optional Configurations

### Set Proxy

If you need to set a proxy, please set the `http_proxy` and `https_proxy` environment variables in `start.bat`. For example:

```batch
set http_proxy=http://127.0.0.1:7890
set https_proxy=http://127.0.0.1:7890
```

This project uses the local Chrome browser, which will automatically read and use the system proxy settings.

### Set AI Model

You can switch the model used by setting the `AI_MODEL` environment variable. Supported models include (please refer to the official website for the latest models):

- `gpt_4o`
- `gpt_4_turbo`
- `gpt_4`
- `claude_3_5_sonnet`
- `claude_3_opus`
- `claude_3_sonnet`
- `claude_3_haiku`
- `claude_2`
- `llama3`
- `gemini_pro`
- `gemini_1_5_pro`
- `databricks_dbrx_instruct`
- `command_r`
- `command_r_plus`
- `zephyr`

For example:

```batch
set AI_MODEL=claude_3_opus
```

### Enable Custom Chat Mode

When enabled, it can shorten system message length, disable internet connection, reduce waiting time, which may help break through limitations.

```batch
set USE_CUSTOM_MODE=true
```

### Enable Mode Rotation

Mode rotation will only be enabled when both `USE_CUSTOM_MODE` and `ENABLE_MODE_ROTATION` are set to `true`.

```batch
set ENABLE_MODE_ROTATION=true
```

### Enable Tunnel Access

If you need to access the local service from the external network, you can enable tunnel access. Both `ngrok` and `localtunnel` are supported.

**Using ngrok:**

1. **Set tunnel type:**

   ```batch
   set ENABLE_TUNNEL=true
   set TUNNEL_TYPE=ngrok
   ```

2. **Set ngrok Auth Token (obtain from ngrok dashboard):**

   ```batch
   set NGROK_AUTH_TOKEN=your_ngrok_auth_token
   ```

3. **(Optional) Set custom domain (paid account):**

   ```batch
   set NGROK_CUSTOM_DOMAIN=your_custom_domain
   ```

**Using localtunnel:**

1. **Set tunnel type:**

   ```batch
   set ENABLE_TUNNEL=true
   set TUNNEL_TYPE=localtunnel
   ```

2. **(Optional) Set subdomain:**

   ```batch
   set SUBDOMAIN=your_subdomain
   ```

---

## Important Notes

- **About Cloudflare CAPTCHA:**

  If a CAPTCHA prompt pops up during program operation, please complete the verification within 30 seconds.

- **About `ALLOW_NON_PRO` setting:**

  If set to `true`, it allows the use of non-subscription accounts, but functionality will be limited and may not work properly.

  ```batch
  set ALLOW_NON_PRO=true
  ```

- **About `CUSTOM_END_MARKER` setting:**

  When the output cannot stop, you can set a custom termination marker. The program will automatically stop output after detecting this marker.

  ```batch
  set CUSTOM_END_MARKER="<YOUR_END_MARKER>"
  ```

- **About `ENABLE_DELAY_LOGIC` setting:**

  If requests are stuck, try setting this to `true`.

  ```batch
  set ENABLE_DELAY_LOGIC=true
  ```

- **About upload file format:**

  You can choose to upload files in `docx` or `txt` format.

  ```batch
  set UPLOAD_FILE_FORMAT=docx
  ```
- **About 403 issue (mainly exists in old versions)**

  This issue mainly exists in old versions. The new version is less likely to be blocked as it uses browser simulation for access.

  In the new version, if a CAPTCHA prompt pops up, users only need to complete the CloudFlare CAPTCHA within 30 seconds and wait for the program to continue processing.

  Cloudflare has a risk control score. This is related to your TLS fingerprint, browser fingerprint, IP address reputation, etc.
  The TLS fingerprint and browser fingerprint used in this project have always been very suspicious (all are automation libraries and Node built-in TLS), directly maxing out the score.
  It's equivalent to having 30+30 points in advance, and the rest depends on how many points your IP address reputation takes (40 points)
  (The specific scores are not detailed, just an example)
  So if your IP is indeed white and takes 0 points, your total score is 60.
  Suppose You sets that scores higher than 80 require CAPTCHA, then there's no problem now.
  If your IP is black and takes more than 20 points, then you're >80 points, you need to do CAPTCHA, resulting in 403.
  Then recently You felt it was being abused too much, or for some other reason, set it so that scores above 60 require CAPTCHA.
  As a result, my IP is a bit black, and I can't get through no matter what.
  But with the same IP, if you access with normal Google Chrome, there's no problem, because its fingerprint is very clean, so the previous fingerprint score is very low.
  Even with the IP reputation score added, it doesn't reach that line.
  In short, the above is a simplified version, CF has many more indicators and strategies for anti-bot.

---

## Deploy on Linux

You can deploy using Docker, please refer to the `Dockerfile` in the project.

---

## FAQ

**Q:** How to solve the problem of npm failing to install dependencies?

**A:** Please ensure your network connection is stable, use global proxy if necessary.

**Q:** Why does the program prompt "Both modes have reached the request limit"?

**A:** This may be because frequent requests have caused the mode to be temporarily disabled. It is recommended to wait for a while before trying again.

**Q:** How to switch models?

**A:** Edit the `AI_MODEL` environment variable in `start.bat`, set it to the name of the model you want to use (can now be set in SillyTavern).

---

## Disclaimer

This project is for learning and research purposes only. Please comply with relevant laws and regulations and do not use it for any commercial or illegal purposes.

---
