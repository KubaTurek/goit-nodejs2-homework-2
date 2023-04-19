const fs = require("fs/promises");

const doesExist = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const creaeteFolder = async (path) => {
  if (!(await doesExist(path))) {
    await fs.mkdir(path);
  }
};

module.exports = creaeteFolder;
