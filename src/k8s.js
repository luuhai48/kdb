import { KubeConfig } from '@kubernetes/client-node';

const config = new KubeConfig();
config.loadFromDefault();

export default {
  get config() {
    return config;
  },
};
