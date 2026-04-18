export const logger = {
  info: (...args) => console.log('[Tampermonkey Script] INFO:', ...args),
  error: (...args) => console.error('[Tampermonkey Script] ERROR:', ...args),
  warn: (...args) => console.warn('[Tampermonkey Script] WARN:', ...args),
  debug: (...args) => console.debug('[Tampermonkey Script] DEBUG:', ...args)
};
