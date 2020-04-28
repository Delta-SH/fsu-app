// 扩展方法
String.format = function () {
  if (arguments.length == 0) return null;

  var str = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
    str = str.replace(re, arguments[i]);
  }

  return str;
};
String.prototype.startWith = function (value, ignoreCase) {
  if (value == null || value == "" || this.length == 0 || value.length > this.length) {
    return false;
  }

  ignoreCase = ignoreCase || false;
  if (ignoreCase === true) {
    return this.substr(0, value.length).toLowerCase() === value.toLowerCase();
  }

  return this.substr(0, value.length) === value;
};
String.prototype.endWith = function (value, ignoreCase) {
  if (value == null || value == "" || this.length == 0 || value.length > this.length) {
    return false;
  }

  ignoreCase = ignoreCase || false;
  if (ignoreCase === true) {
    return this.substr(this.length - value.length).toLowerCase() === value.toLowerCase();
  }

  return this.substr(this.length - value.length) === value;
};

function isNull(value) {
  return typeof value == "undefined" || value === null;
}

function isEmpty(value, whitespace) {
  return (whitespace || false) === true ? value.trim() === "" : value === "";
}

function isNullOrEmpty(value, whitespace) {
  if (isNull(value) === true) return true;
  return isEmpty(value, whitespace);
}

function isFunction(func) {
  return func && typeof func == "function";
}
