export function formatMessages(messages, proxyModel) {
    function convertToUpperCase(messages) {
        return messages.map(message => {
            let content = message.content;

            content = content.replace(/^(system|assistant|user):/gim, match => match.toUpperCase());
            content = content.replace(/\n(system|assistant|user|human):/gim, (match, p1) => '\n' + p1.toUpperCase() + ':');

            const role = message.role.toUpperCase();

            return { role, content };
        });
    }

    // 检查是否存在 "<!-- AI Round 0 begins. -->" 标记
    const hasAIRound0 = messages.some(message => message.content.includes('<!-- AI Round 0 begins. -->'));

    // 如果没有找到标记，直接返回原始消息数组
    if (!hasAIRound0) {
        return proxyModel === 'gpt_4o' ? convertToUpperCase(messages) : messages;
    }

    let formattedMessages = [];
    let userRoundCounter = 0;
    let assistantRoundCounter = 0;
    let descriptionPointCounter = 0;
    let isFirstUserFound = false;
    let lastAssistantRound = 0;

    // 查找初始回合数
    let initialRound = 0;
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'user') {
            const nextMessage = messages[i + 1];
            if (nextMessage && nextMessage.role === 'assistant') {
                const match = nextMessage.content.match(/<!-- AI Round (\d+) begins\. -->/);
                if (match) {
                    initialRound = parseInt(match[1]);
                    userRoundCounter = initialRound - 1;
                    assistantRoundCounter = initialRound;
                    lastAssistantRound = initialRound;
                    descriptionPointCounter = 1;
                    break;
                }
            }
        }
    }

    // 找到包含 </context> --- 的消息索引
    let contextEndIndex = messages.length;
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].content.includes('</context> ---')) {
            contextEndIndex = i;
            break;
        }
    }

    // 找到最后一个 user 消息的索引（在 </context> --- 之前）
    let lastUserIndex = contextEndIndex - 1;
    while (lastUserIndex >= 0 && messages[lastUserIndex].role !== 'user') {
        lastUserIndex--;
    }

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

        if (message.content.includes('<!-- AI Round 0 begins. -->')) {
            formattedMessages.push({
                role: message.role,
                content: message.content.replace('<!-- AI Round 0 begins. -->', '--------------------<建立锚点开始处>--------------------\n<!-- AI Round 0 begins. -->')
            });
            continue;
        }

        if (message.role === 'user' && i < contextEndIndex) {
            if (isFirstUserFound) {
                userRoundCounter = lastAssistantRound + 1;
                descriptionPointCounter++;
            } else {
                isFirstUserFound = true;
            }

            let roundInfo = '';
            if (i === lastUserIndex) {
                roundInfo = `{{最新user:(${userRoundCounter})回合|assistant:(${userRoundCounter + 1})回合开始，基于上回(${descriptionPointCounter - 1}(user${userRoundCounter - 1}|assistant${userRoundCounter}))中的历史锚点内的\`assistant:\`发言末尾衔接，叙事创作时不要只关注最近故事动向，尽可能的记住多个历史锚点中的"assistant:..."故事内容，保持思路清晰来响应下一个回复:}}\n`;
            } else {
                const nextAssistantRound = userRoundCounter + 1;
                roundInfo = `{{历史第 user = 回合${userRoundCounter}|assistant = 回合${nextAssistantRound} 开始，标记锚点:[${descriptionPointCounter}]}}\n`;
            }
            message.content = roundInfo + message.content;
        } else if (message.role === 'assistant' && i < contextEndIndex) {
            const match = message.content.match(/<!-- AI Round (\d+) begins\. -->/);
            if (match) {
                assistantRoundCounter = parseInt(match[1]);
                lastAssistantRound = assistantRoundCounter;
            }

            if (message.content.includes('<CHAR_turn>') && i < lastUserIndex) {
                message.content += `\n--------------------<历史锚点[${descriptionPointCounter}]结束>--------------------`;
            }
        }

        formattedMessages.push(message);
    }

    // 如果 proxyModel 是 gpt_4o，则转换消息前缀为大写
    if (proxyModel === 'gpt_4o') {
        formattedMessages = convertToUpperCase(formattedMessages);
    }

    return formattedMessages;
}
