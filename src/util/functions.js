function removeUnnecessaryProps(a) {
  return new Proxy(a, {
    construct() {
      const obj = Reflect.construct(...arguments);
      Object.keys(obj).forEach((key) => {
        if (
          typeof obj[key] == "function" ||
          key.toUpperCase() == key ||
          key.startsWith("_")
        )
          Object.defineProperty(obj, key, { enumerable: false });
      });
      return obj;
    },
  });
}

module.exports = {
  removeUnnecessaryProps,
};
