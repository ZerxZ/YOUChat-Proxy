export function formatMessages(messages) {
    // 检查是否存在 "<!-- AI Round 0 begins. -->" 标记
    const hasAIRound0 = messages.some(message => message.content.includes('<!-- AI Round 0 begins. -->'));
    
    // 如果没有找到标记，直接返回原始消息数组
    if (!hasAIRound0) {
        return messages;
    }

    let formattedMessages = [];
    let userRoundCounter = 0;
    let assistantRoundCounter = 0;
    let descriptionPointCounter = 0;
    let isFirstUserFound = false;
    let isLatestRound = false;
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

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

        if (message.content.includes('<!-- AI Round 0 begins. -->')) {
            formattedMessages.push({
                role: message.role,
                content: message.content.replace('<!-- AI Round 0 begins. -->', '--------------------<建立锚点开始处>--------------------\n<!-- AI Round 0 begins. -->')
            });
            continue;
        }

        if (message.role === 'user') {
            if (isFirstUserFound) {
                userRoundCounter = lastAssistantRound + 1;
                descriptionPointCounter++;
            } else {
                isFirstUserFound = true;
            }
            
            let roundInfo = '';
            if (i + 1 < messages.length && messages[i + 1].role === 'assistant') {
                const nextAssistantRound = userRoundCounter + 1;
                roundInfo = `{{历史第 user = 回合${userRoundCounter}|assistant = 回合${nextAssistantRound} 开始，标记锚点:[${descriptionPointCounter}]}}\n`;
            } else {
                isLatestRound = true;
                roundInfo = `{{最新user:(${userRoundCounter})回合|assistant:(${userRoundCounter + 1})回合开始，基于上回(${descriptionPointCounter - 1}(user${userRoundCounter - 1}|assistant${userRoundCounter}))中的历史锚点内的\`assistant:\`发言末尾衔接，叙事创作时不要只关注最近故事动向，尽可能的记住多个历史锚点中的"assistant:..."故事内容，保持思路清晰来响应下一个回复:}}\n`;
            }
            formattedMessages.push({
                role: 'system',
                content: roundInfo
            });
        } else if (message.role === 'assistant') {
            const match = message.content.match(/<!-- AI Round (\d+) begins\. -->/);
            if (match) {
                assistantRoundCounter = parseInt(match[1]);
                lastAssistantRound = assistantRoundCounter;
            }
        }

        formattedMessages.push(message);

        if (message.content.includes('<CHAR_turn>') && !isLatestRound) {
            formattedMessages.push({
                role: 'system',
                content: `--------------------<历史锚点[${descriptionPointCounter}]结束>--------------------`
            });
        }

        if (message.content.includes('<!-- The following are the writing style rules and guidelines for the turn-based collaborative storytelling: -->')) {
            break;
        }
    }

    return formattedMessages;
}
