/// <reference types="tree-sitter-cli/dsl" />

const ddlog_dl = require("../dl/grammar");

module.exports = grammar(ddlog_dl, {
  name: "ddlog_dat",

  rules: {
    PARSE: $ => optional("parse"),
  },
});
