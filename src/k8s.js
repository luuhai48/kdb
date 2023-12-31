import { KubeConfig, CoreV1Api, AppsV1Api, Log } from '@kubernetes/client-node';
import { exec } from './shell';

/** @type {KubeConfig} */
let config;

/** @type {CoreV1Api} */
let api;

/** @type {AppsV1Api} */
let appsApi;

/** @type {Log} */
let log;

export default {
  /**
   * @returns {Promise<void|Error>}
   */
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
      !config.contexts.find((c) => c.name === config.currentContext)
    ) {
      const result = await exec(
        `kubectl config use-context ${config.contexts[0].name}`,
      );
      if (!result || result.code !== 0) {
        return new Error(result.stderr);
      }

      return this.reloadConfig();
    }

    try {
      api = config.makeApiClient(CoreV1Api);
      appsApi = config.makeApiClient(AppsV1Api);
      log = new Log(config);
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
  },

  /**
   * Switch namespace
   * @param {string} namespaceName
   */
  async setCurrentNamespace(namespaceName) {
    const result = await exec(
      `kubectl config set-context --current --namespace=${namespaceName}`,
    );
    if (!result || result.code !== 0) {
      return new Error(result.stderr);
    }
  },

  get config() {
    return config;
  },

  get api() {
    return api;
  },

  get appsApi() {
    return appsApi;
  },

  get log() {
    return log;
  },
};
