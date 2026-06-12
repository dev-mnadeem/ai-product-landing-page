import { loadConfig, type AppConfig } from "@/lib/config";
import { LocalStrategyProvider } from "./local-provider";
import { OpenAiStrategyProvider } from "./openai-provider";
import type { StrategyProvider } from "./types";

/**
 * Resolve the configured provider. `local` is the default so a fresh clone,
 * the test suite and CI all run with no credentials at all.
 */
export function getStrategyProvider(
  config: AppConfig = loadConfig()
): StrategyProvider {
  switch (config.providerName) {
    case "openai":
      return new OpenAiStrategyProvider(config);
    case "local":
    default:
      return new LocalStrategyProvider();
  }
}
