const buildErrorMsg = (errObj) => {
  const { path, config, message } = errObj;
  const msg = `Message: ${message}`;
  if (path) {
    const fsErr = `Error with path/file: >>> ${path}`;
    return `${fsErr}\n${msg}`;
  }
  const httpErr = `Error when requesting url: >>> ${config.url}`;
  return `${httpErr}\n${msg}`;
};

export default buildErrorMsg;
