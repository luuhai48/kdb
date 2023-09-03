import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';
import { exec } from './shell';

/** @type {KubeConfig} */
let config;

/** @type {CoreV1Api} */
let api;

export default {
  async reloadConfig() {
    config = new KubeConfig();

    try {
      config.loadFromDefault();
    } catch (e) {
      return e;
    }

    if (
      config.contexts.length &&
      config.currentContext &&
      !config.contexts.find((c) => c.cluster === config.currentContext)
    ) {
      const result = await exec(
        `kubectl config use-context ${config.contexts[0].cluster}`,
      );
      if (!result || result.code !== 0) {
        return new Error(result.stderr);
      }

      return this.reloadConfig();
    }

    try {
      api = config.makeApiClient(CoreV1Api);
    } catch (e) {
      return e;
    }
  },

  /**
   * Switch context
   * @param {string} contextName
   */
  async setCurrentContext(contextName) {
    const result = await exec(`kubectl config use-context ${contextName}`);
    if (!result || result.code !== 0) {
      return new Error(result.stderr);
    }

    return this.reloadConfig();
  },

  get config() {
    return config;
  },

  get api() {
    return api;
  },
};
