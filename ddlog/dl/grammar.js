/// <reference types="tree-sitter-cli/dsl" />

// const Pattern = {
//   ident: /[a-zA-Z_][a-zA-Z0-9_]*/,
//   ident_upper: /[A-Z][a-zA-Z0-9_]*/,
//   ident_lower: /[a-z_][a-zA-Z0-9_]*/,
// };

module.exports = grammar({
  name: "ddlog_dl",

  conflicts: $ => [[$.term_cond], [$.term_return]],

  word: $ => $._ident_lower,

  rules: {
    ROOT: $ => repeat($.annotated_item),

    annotated_item: $ => seq(optional($.attributes), $.item),

    attribute: $ => seq($.name, "=", $._expr),

    attributes: $ => seq("#[", $.attribute, repeat(seq(",", $.attribute)), "]"),

    _expr: $ => choice($._term),

    _ident: $ => choice($._ident_lower, $._ident_upper),

    _ident_lower: $ => token(seq(/[a-z_]/, repeat(/[a-zA-Z0-9_]/))),

    _ident_lower_scoped: $ => seq(optional($.ident_scope), $._ident_lower),

    ident_scope: $ => prec.right(repeat1(seq($._ident, "::"))),

    _ident_upper: $ => token(seq(/[A-Z]/, repeat(/[a-zA-Z0-9_]/))),

    _ident_upper_scoped: $ => seq(optional($.ident_scope), $._ident_upper),

    item: $ => choice($.item_import, $._item_function, $._item_relation, $.item_rule, $.item_typedef),

    item_import: $ => seq("import", $.module_path, optional(seq("as", $.module_alias))),

    _item_function: $ => choice($.item_function_normal, $.item_function_extern),

    item_function_extern: $ =>
      seq(
        "extern",
        "function",
        $.name_func,
        "(",
        optional(seq($.name_arg, ":", $.type_spec_simple, repeat(seq(",", $.name_arg, ":", $.type_spec_simple)))),
        ")",
        ":",
        $.type_spec_simple,
      ),

    item_function_normal: $ =>
      seq(
        "function",
        $.name_func,
        "(",
        optional(seq($.name_arg, ":", $.type_spec_simple, repeat(seq(",", $.name_arg, ":", $.type_spec_simple)))),
        ")",
        ":",
        $.type_spec_simple,
        "{",
        $._expr,
        "}",
      ),

    _item_relation: $ => "item_relation", // choice($.item_relation_args, $.item_relation_elem),

    item_rule: $ => "item_rule",

    item_typedef: $ => "item_typedef",

    _literal_bool: $ => choice($.literal_bool_false, $.literal_bool_true),

    literal_bool_false: $ => "false",

    literal_bool_true: $ => "true",

    literal_int: $ => "literal_int",

    literal_map: $ => seq("[", $._expr, "->", $._expr, repeat(seq(",", $._expr, "->", $._expr)), "]"),

    literal_string: $ => "literal_string",

    literal_vec: $ => seq("[", $._expr, repeat(seq(",", $._expr)), "]"),

    match_clause: $ => seq($._pattern, "->", $._expr),

    module_alias: $ => $._ident,

    module_path: $ => seq($._ident, repeat(seq("::", $._ident))),

    name: $ => $._ident_lower,

    name_arg: $ => $._ident_lower,

    name_cons: $ => $._ident_upper_scoped,

    name_field: $ => $._ident_lower,

    name_func: $ => $._ident_lower_scoped,

    name_rel: $ => $._ident_upper_scoped,

    name_var_term: $ => $._ident_lower,

    name_var_type: $ => token(seq("'", /[A-Z]/, repeat(/[a-zA-Z0-9_]/))),

    _pattern: $ =>
      choice($._pattern_cons, $.pattern_term_decl_var, $._pattern_literal, $.pattern_tuple, $.pattern_wildcard),

    _pattern_cons: $ => choice($.pattern_cons_named, $.pattern_cons_positional),

    pattern_cons_named: $ =>
      seq(
        $.name_cons,
        "{",
        optional(seq(".", $.name_field, "=", $._pattern, repeat(seq(",", ".", $.name_field, "=", $._pattern)))),
        "}",
      ),

    pattern_cons_positional: $ =>
      seq($.name_cons, optional(seq("{", optional(seq($._pattern, repeat(seq(",", $._pattern)))), "}"))),

    _pattern_literal: $ => choice($._literal_bool, $.literal_int, $.literal_string),

    pattern_term_decl_var: $ => seq(optional("var"), $.name_var_term),

    pattern_tuple: $ => seq("(", optional(seq($._pattern, repeat(seq(",", $._pattern)))), ")"),

    pattern_wildcard: $ => "_",

    _term: $ =>
      choice(
        $.term_break,
        $.term_cond,
        $.term_continue,
        $.term_for,
        $._term_literal,
        $.term_return,
        $.term_decl_var,
        $.term_wildcard,
      ),

    term_break: $ => "break",

    _term_cons: $ => choice($.term_cons_named, $.term_cons_positional),

    term_cons_named: $ =>
      seq(
        $.name_cons,
        "{",
        optional(seq(".", $.name_field, "=", $._expr, repeat(seq(",", ".", $.name_field, "=", $._expr)))),
        "}",
      ),

    term_cons_positional: $ =>
      seq($.name_cons, optional(seq("{", optional(seq($._expr, repeat(seq(",", $._expr)))), "}"))),

    term_cond: $ => seq("if", $._term, $._term, optional(seq("else", $._term))),

    term_continue: $ => "continue",

    term_decl_var: $ => seq(optional("var"), $.name_var_term),

    term_for: $ => seq("for", "(", $.name_var_term, "in", $._expr, ")", $._term),

    _term_literal: $ => choice($._literal_bool, $.literal_map, $.literal_vec),

    term_match: $ => seq("match", "(", $._expr, ")", "{", $.match_clause, repeat(seq(",", $.match_clause)), "}"),

    term_return: $ => seq("return", optional($._expr)),

    term_wildcard: $ => "_",

    type_spec_simple: $ => "type_spec_simple",
  },
});
