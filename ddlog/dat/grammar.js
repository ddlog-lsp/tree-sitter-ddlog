/// <reference types="tree-sitter-cli/dsl" />

const ddlog_dl = require("../dl/grammar");

module.exports = grammar(ddlog_dl, {
  name: "ddlog_dat",

  extras: $ => [$._comment_line, /[\s\uFEFF\u2060\u200B\u00A0]/],

  word: $ => $.word,

  rules: {
    ROOT: $ => optional(seq($._command, repeat(seq(";", $._command)), optional(";"))),

    _atom: $ => choice($.atom_rec, $.atom_pos, $.atom_elem),

    atom_elem: $ => seq($.name_rel, "[", $._exp, "]"),

    atom_pos: $ =>
      prec.right(
        seq($.name_rel, optional(seq("(", optional(seq($._exp, repeat(seq(",", $._exp)), optional(","))), ")"))),
      ),

    atom_rec: $ =>
      seq($.name_rel, "(", ".", $.name_arg, "=", $._exp, repeat(seq(",", ".", $.name_arg, "=", $._exp)), ")"),

    _command: $ =>
      choice(
        $.clear,
        $._commit,
        $.dump,
        $.dump_index,
        $.echo,
        $.exit,
        $.insert_or_update,
        $.log_level,
        $.modify,
        $.profile,
        $.query_index,
        $.rollback,
        $.sleep,
        $.start,
        $.timestamp,
        $.updates,
      ),

    clear: $ => seq("clear", $.name_rel),

    _comment_line: $ => token(seq("#", /.*/)),

    _commit: $ => seq("commit", optional("dump_changes")),

    delete: $ => seq("delete", $._atom),

    delete_key: $ => seq("delete_key", $.name_rel, $._exp),

    dump: $ => seq("dump", optional($.name_rel)),

    dump_index: $ => seq("dump_index", $.name_index),

    echo: $ => seq("echo", /[^;]*/),

    exit: $ => "exit",

    insert: $ => seq("insert", $._atom),

    insert_or_update: $ => seq("insert_or_update", $._atom),

    log_level: $ => seq("log_level", /[0-9][0-9_]*/),

    modify: $ => seq("modify", $.name_rel, $._exp, "<-", $._atom),

    profile: $ => seq("profile", optional(seq("cpu", choice("on", "off")))),

    query_index: $ =>
      seq("query_index", $.name_index, "(", optional(seq($.arg, repeat(seq(",", $.arg)), optional(","))), ")"),

    rollback: $ => "rollback",

    sleep: $ => seq("sleep", /[0-9][0-9_]*/),

    start: $ => "start",

    timestamp: $ => "timestamp",

    updates: $ => seq(choice($.delete, $.delete_key, $.insert), repeat(seq(",", choice($.delete, $.insert)))),

    word: $ => token(seq(/[a-z_]/, repeat(/[a-zA-Z0-9_]/))),
  },
});
