export {};

const required = ['OPENAI_API_KEY', 'OPENAI_MODEL', 'AI_MODEL_CONFIG_VERSION', 'OPENAI_DATA_CONTROL_MODE'] as const;
const missing = required.filter((name) => !process.env[name]?.trim());
const requiredByCi = process.env.CI === 'true' || process.env.AI_EVAL_REQUIRED === '1';

if (missing.length > 0) {
  const message = `G70 live model eval NOT_VERIFIED locally; missing ${missing.join(', ')}. Configure the official OpenAI lane before production/CI acceptance.`;
  if (requiredByCi) throw new Error(message);
  console.warn(message);
} else {
  await import('./ai-runtime-eval');
}
