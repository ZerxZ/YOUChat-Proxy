import YouProvider from './you_providers/youProvider.js';
import PerplexityProvider from './perplexity_providers/perplexityProvider.js';
import HappyApiProvider from './happyapi_providers/happyApi.js';
// import { config as youConfig } from './config.js';
// import { config as perplexityConfig } from './perplexityConfig.js';
const getConfig = (cookies) => {
    return {
        sessions: cookies.map(cookie => {
            return {
                cookie
            }
        })
    }
}

class ProviderManager {
    constructor({ youConfig, perplexityConfig }) {
        // 根据环境变量初始化提供者
        const activeProvider = process.env.ACTIVE_PROVIDER || 'you';

        switch (activeProvider) {
            case 'you':
                this.provider = new YouProvider(youConfig);
                break;
            case 'perplexity':
                this.provider = new PerplexityProvider(perplexityConfig);
                break;
            case 'happyapi':
                this.provider = new HappyApiProvider();
                break;
            default:
                throw new Error('Invalid ACTIVE_PROVIDER. Use "you", "perplexity", or "happyapi".');
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
