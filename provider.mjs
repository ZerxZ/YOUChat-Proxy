import YouProvider from './you_providers/youProvider.mjs';
import PerplexityProvider from './perplexity_providers/perplexityProvider.mjs';
import { config as youConfig } from './config.mjs';
import { config as perplexityConfig } from './perplexityConfig.mjs';

class ProviderManager {
    constructor() {
        // 根据环境变量初始化提供者
        const activeProvider = process.env.ACTIVE_PROVIDER || 'you';

        switch (activeProvider) {
            case 'you':
                this.provider = new YouProvider(youConfig);
                break;
            case 'perplexity':
                this.provider = new PerplexityProvider(perplexityConfig);
                break;
            default:
                throw new Error('Invalid ACTIVE_PROVIDER. Use "you" or "perplexity".');
        }

        console.log(`Initialized with ${activeProvider} provider.`);
    }

    async init() {
        await this.provider.init(this.provider.config);
        console.log(`Provider initialized.`);
    }

    async getCompletion(params) {
        return this.provider.getCompletion(params);
    }

    getCurrentProvider() {
        return this.provider.constructor.name;
    }
}

export default ProviderManager;
