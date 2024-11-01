import crypto from 'crypto';

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 插入乱码
export function insertGarbledText(content) {
    const enableGarbledStart = process.env.ENABLE_GARBLED_START === 'true';
    const enableGarbledEnd = process.env.ENABLE_GARBLED_END === 'true';

    if (!enableGarbledStart && !enableGarbledEnd) {
        return content;
    }

    // 生成指定长度的随机乱码
    function generateGarbledText(length) {
        return crypto.randomBytes(length).toString('hex');
    }

    let garbledContent = content;

    // 配置参数
    const startMinLength = parseInt(process.env.GARBLED_START_MIN_LENGTH) || 1000;
    const startMaxLength = parseInt(process.env.GARBLED_START_MAX_LENGTH) || 5000;

    const endGarbledLength = parseInt(process.env.GARBLED_END_LENGTH) || 500;

    if (enableGarbledStart) {
        const startGarbledLength = getRandomInt(startMinLength, startMaxLength);

        const byteLength = Math.ceil(startGarbledLength / 2);

        // 生成乱码
        const startPlaceholder = generateGarbledText(byteLength);

        garbledContent = startPlaceholder + '\n\n\n' + garbledContent.trim();
    }

    if (enableGarbledEnd) {
        const byteLength = Math.ceil(endGarbledLength / 2);
        const endPlaceholder = generateGarbledText(byteLength);
        garbledContent = garbledContent.trim() + '\n\n\n' + endPlaceholder;
    }

    return garbledContent;
}