/// <reference types="tree-sitter-cli/dsl" />

const dl = require("../dl/grammar");

module.exports = grammar(dl, {
  name: "dat",

  externals: $ => [$.rule_end, $.updates_end],

  extras: $ => [$.comment_line, /[\s\uFEFF\u2060\u200B\u00A0]/],

  word: $ => $.word,

  rules: {
    ROOT: $ => repeat($.command),

    atom: $ => choice($.atom_rec, $.atom_pos, $.atom_elem),

    atom_elem: $ => seq($.name_rel, "[", $.exp, "]"),

    atom_pos: $ =>
      prec.right(
        seq($.name_rel, optional(seq("(", optional(seq($.exp, repeat(seq(",", $.exp)), optional(","))), ")"))),
      ),

    atom_rec: $ =>
      seq($.name_rel, "(", ".", $.name_arg, "=", $.exp, repeat(seq(",", ".", $.name_arg, "=", $.exp)), ")"),

    clear: $ => seq("clear", $.name_rel, ";"),

    command: $ =>
      choice(
        $.clear,
        $.commit,
        $.dump,
        $.dump_index,
        $.echo,
        $.exit,
        $.log_level,
        $.profile,
        $.query_index,
        $.rollback,
        $.sleep,
        $.start,
        $.timestamp,
        $.updates,
      ),

    comment_line: $ => token(seq("#", /.*/)),

    commit: $ => seq("commit", optional("dump_changes"), ";"),

    cons_arg: $ => choice($.record_named, $.record),

    cons_args: $ => seq($.cons_arg, repeat(seq(",", $.cons_arg))),

    delete: $ => seq("delete", $.atom),

    delete_key: $ => seq("delete_key", $.name_rel, $.exp),

    dump: $ => seq("dump", optional($.name_rel), ";"),

    dump_index: $ => seq("dump_index", $.name_index, ";"),

    echo: $ => seq("echo", alias(/[^;]*/, $.misc_pat0), ";"),

    exit: $ => seq("exit", ";"),

    exp: ($, original) => choice($.lit_serialized, original),

    insert: $ => seq("insert", $.atom),

    insert_or_update: $ => seq("insert_or_update", $.atom),

    lit_num_hex: $ => /0x[0-9a-fA-F][0-9a-fA-F_]*/,

    lit_serialized: $ => seq("@", $.serde_encoding, $.lit_string),

    lit_string: $ =>
      prec.right(repeat1(choice($.string_quoted, $.string_quoted_escaped, $.string_raw, $.string_raw_interpolated))),

    log_level: $ => seq("log_level", alias(/[0-9][0-9_]*/, $.misc_pat0), ";"),

    modify: $ => seq("modify", $.name_rel, $.record, "<-", $.record),

    profile: $ => seq("profile", optional(seq("cpu", choice("on", "off"))), ";"),

    query_index: $ =>
      seq("query_index", $.name_index, "(", optional(seq($.arg, repeat(seq(",", $.arg)), optional(","))), ")", ";"),

    record: $ =>
      choice(
        $.lit_bool,
        $.lit_string,
        $.lit_serialized,
        $.val_tuple,
        $.val_array,
        $.val_struct,
        $.lit_num_float,
        $.lit_num_dec,
        $.lit_num_hex,
      ),

    record_named: $ => seq(".", $.name_field, "=", $.record),

    rollback: $ => seq("rollback", ";"),

    serde_encoding: $ => token.immediate("json"),

    sleep: $ => seq("sleep", alias(/[0-9][0-9_]*/, $.misc_pat0), ";"),

    start: $ => seq("start", ";"),

    timestamp: $ => seq("timestamp", ";"),

    update: $ => choice($.delete, $.delete_key, $.insert, $.insert_or_update, $.modify),

    updates: $ => seq($.update, repeat(seq(",", $.update)), $.updates_end),

    val_array: $ => seq("[", optional(seq($.record, repeat(seq(",", $.record)), optional(","))), "]"),

    val_struct: $ => seq($.name_rel, optional(seq("{", $.cons_args, "}"))),

    val_tuple: $ => seq("(", optional(seq($.record, repeat(seq(",", $.record)), optional(","))), ")"),

    word: $ => token(seq(/[a-z_]/, repeat(/[a-zA-Z0-9_]/))),
  },
});
