import { Storage } from "/src/utils/storage.js.js";

const SK_TOKEN_USAGE = 'VNPT_TOKEN_USAGE';

export const TokenTracker = {
    addUsage: (tokens) => {
        if (!tokens) return;
        
        const today = new Date().toISOString().split('T')[0];
        let usage = Storage.get(SK_TOKEN_USAGE) || {};
        
        // Reset count if it's a new day
        if (usage.date !== today) {
            usage = { date: today, tokens: 0, requests: 0 };
        }
        
        usage.tokens += tokens;
        usage.requests += 1;
        Storage.set(SK_TOKEN_USAGE, usage);
        
        // Phát sự kiện để cập nhật UI
        const evt = new CustomEvent('vnpt_usage_updated', { detail: usage });
        document.dispatchEvent(evt);
    },
    
    getUsage: () => {
        const today = new Date().toISOString().split('T')[0];
        let usage = Storage.get(SK_TOKEN_USAGE) || { date: today, tokens: 0, requests: 0 };
        
        // Reset nếu khác ngày
        if (usage.date !== today) {
            return { date: today, tokens: 0, requests: 0 };
        }
        return usage;
    }
};
