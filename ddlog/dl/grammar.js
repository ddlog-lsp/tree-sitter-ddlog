/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "ddlog_dl",

  rules: {
    PARSE: $ => optional("parse"),
  },
});
