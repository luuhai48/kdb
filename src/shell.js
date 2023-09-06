import shelljs from 'shelljs';

/**
 * Execute cli command
 * @param {string} cmd
 * @param {any} [callback]
 */
export const exec = async (cmd, callback) => {
  const opts = {
    env: process.env,
    async: true,
    silent: true,
  };

  return new Promise((resolve) => {
    const proc = shelljs.exec(cmd, opts, (code, stdout, stderr) =>
      resolve({ code, stdout, stderr }),
    );

    if (callback) {
      callback(proc);
    }
  });
};
