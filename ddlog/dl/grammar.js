/// <reference types="tree-sitter-cli/dsl" />

const Pattern = {
  literal_num_bin: /[0-1]+/,
  literal_num_dec: /[0-9]+/,
  literal_num_hex: /[0-9a-fA-F]+/,
  literal_num_oct: /[0-7]+/,
  ident_lower: /[a-z_][a-zA-Z0-9_]*/,
  ident_upper: /[A-Z][a-zA-Z0-9_]*/,
};

module.exports = grammar({
  name: "ddlog_dl",

  conflicts: $ => [
    [$.expr_assign],
    [$.expr_eq, $.expr_gt],
    [$.expr_eq, $.expr_lt],
    [$.expr_eq, $.expr_lteq],
    [$.expr_eq, $.expr_gteq],
    [$.expr_gt],
    [$.expr_gt, $.expr_gteq],
    [$.expr_gt, $.expr_lt],
    [$.expr_gt, $.expr_lteq],
    [$.expr_gt, $.expr_neq],
    [$.expr_gteq],
    [$.expr_gteq, $.expr_lt],
    [$.expr_gteq, $.expr_lteq],
    [$.expr_gteq, $.expr_neq],
    [$.expr_lt],
    [$.expr_lt, $.expr_lteq],
    [$.expr_lt, $.expr_neq],
    [$.expr_lteq],
    [$.expr_lteq, $.expr_neq],
    [$.name_cons, $.name_type],
  ],

  extras: $ => [$._comment_block, $._comment_line, /[\s\uFEFF\u2060\u200B\u00A0]/],

  word: $ => $.word,

  rules: {
    ROOT: $ => repeat($._annotated_item),

    _annotated_item: $ => seq(optional($.attributes), $._item),

    arg: $ => seq($.name_arg, ":", $._type_atom),

    _atom: $ => choice($.atom_rec, $.atom_pos, $.atom_elem),

    atom_elem: $ => seq($.name_rel, "[", $._expr, "]"),

    atom_pos: $ => seq(optional(seq($.name_var_term, "in")), $.name_rel, "(", $._expr, repeat(seq(",", $._expr)), ")"),

    atom_rec: $ =>
      seq(
        optional(seq($.name_var_term, "in")),
        seq(optional("&"), $.name_rel),
        "(",
        ".",
        $.name_arg,
        "=",
        $._expr,
        repeat(seq(",", ".", $.name_arg, "=", $._expr)),
        ")",
      ),

    attribute: $ => seq($.name, "=", $._expr),

    attributes: $ => seq("#[", $.attribute, repeat(seq(",", $.attribute)), "]"),

    bool_false: $ => "false",

    bool_true: $ => "true",

    _comment_block: $ => seq("/*", repeat(choice($._comment_block, /[^/*]+/, "/", "*")), "*/"),

    _comment_line: $ => token(seq("//", /.*/)),

    _cons: $ => choice($.cons_rec, $.cons_pos),

    cons_pos: $ => seq(optional($.attributes), $.name_cons),

    cons_rec: $ => prec(1, seq(optional($.attributes), $.name_cons, "{", $.field, repeat(seq(",", $.field)), "}")),

    _escape_sequence: $ =>
      token.immediate(
        seq("\\", choice(/[^xu0-7]/, /[0-7]{1,3}/, /x[0-9a-fA-F]{2}/, /u[0-9a-fA-F]{4}/, /u{[0-9a-fA-F]+}/)),
      ),

    _expr: $ =>
      choice(
        $.expr_add,
        $.expr_assign,
        $.expr_bit_and,
        $.expr_bit_neg,
        $.expr_bit_or,
        $.expr_bit_slice,
        $.expr_block,
        $.expr_break,
        $.expr_cast,
        $.expr_cat,
        $.expr_cond,
        $.expr_continue,
        $.expr_cons_rec,
        $.expr_cons_pos,
        $.expr_decl_var,
        $.expr_div,
        $.expr_eq,
        $.expr_field,
        $.expr_for,
        $.expr_fun_call,
        $.expr_fun_call_dot,
        $.expr_gt,
        $.expr_gteq,
        $._expr_lit,
        $.expr_log_and,
        $.expr_log_imp,
        $.expr_log_neg,
        $.expr_log_or,
        $.expr_lt,
        $.expr_lteq,
        $.expr_match,
        $.expr_mul,
        $.expr_neg,
        $.expr_neq,
        $.expr_proj,
        $.expr_rem,
        $.expr_return,
        $.expr_seq,
        $.expr_shl,
        $.expr_shr,
        $.expr_sub,
        $.expr_tuple,
        $.expr_type,
        $.expr_wild,
      ),

    expr_add: $ => prec.left(11, seq($._expr, "+", $._expr)),

    expr_assign: $ => prec(1, seq($._expr, "=", $._expr)),

    expr_bit_and: $ => prec.left(7, seq($._expr, "&", $._expr)),

    expr_bit_neg: $ => prec(14, seq("~", $._expr)),

    expr_bit_or: $ => prec.left(5, seq($._expr, "|", $._expr)),

    expr_bit_slice: $ => prec(17, seq($._expr, "[", Pattern.literal_num_dec, ",", Pattern.literal_num_dec, "]")),

    expr_bit_xor: $ => prec.left(6, seq($._expr, "^", $._expr)),

    expr_block: $ => seq("{", optional($._expr), "}"),

    expr_break: $ => "break",

    expr_cast: $ => prec(17, seq($._expr, "as", $._type_atom)),

    expr_cat: $ => prec.left(9, seq($._expr, "++", $._expr)),

    expr_cond: $ => prec.left(seq("if", $._expr, $._expr, optional(seq("else", $._expr)))),

    expr_continue: $ => "continue",

    _expr_cons: $ => choice($.expr_cons_rec, $.expr_cons_pos),

    expr_cons_rec: $ =>
      prec(
        1,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $._expr, repeat(seq(",", ".", $.name_field, "=", $._expr)))),
          "}",
        ),
      ),

    expr_cons_pos: $ => seq($.name_cons, optional(seq("{", optional(seq($._expr, repeat(seq(",", $._expr)))), "}"))),

    expr_decl_var: $ => seq(optional("var"), $.name_var_term),

    expr_div: $ => prec.left(12, seq($._expr, "/", $._expr)),

    expr_eq: $ => prec.left(8, seq($._expr, "==", $._expr)),

    expr_field: $ => prec(17, seq($._expr, ".", $._ident)),

    // FIXME: precedence
    expr_for: $ => prec(18, seq("for", "(", $.name_var_term, "in", $._expr, ")", $._expr)),

    expr_fun_call: $ => prec(17, seq($._expr, "(", optional(seq($._expr, repeat(seq(",", $._expr)))), ")")),

    expr_fun_call_dot: $ =>
      prec(17, seq($._expr, ".", $.name_func, "(", optional(seq($._expr, repeat(seq(",", $._expr)))), ")")),

    expr_gt: $ => prec(8, seq($._expr, ">", $._expr)),

    expr_gteq: $ => prec(8, seq($._expr, ">=", $._expr)),

    _expr_lit: $ => choice($._literal_bool, $.literal_int, $.literal_map, $.literal_string, $.literal_vec),

    expr_log_and: $ => prec.left(4, seq($._expr, "and", $._expr)),

    expr_log_imp: $ => prec.left(2, seq($._expr, "=>", $._expr)),

    expr_log_neg: $ => prec(13, seq("not", $._expr)),

    expr_log_or: $ => prec.left(3, seq($._expr, "or", $._expr)),

    expr_lt: $ => prec(8, seq($._expr, "<", $._expr)),

    expr_lteq: $ => prec(8, seq($._expr, "<=", $._expr)),

    expr_match: $ =>
      seq("match", "(", $._expr, ")", "{", optional($.match_clause), repeat(seq(",", $.match_clause)), "}"),

    expr_mul: $ => prec.left(12, seq($._expr, "*", $._expr)),

    expr_neg: $ => prec(15, seq("-", $._expr)),

    expr_neq: $ => prec.left(8, seq($._expr, "!=", $._expr)),

    expr_proj: $ => prec(17, seq($._expr, ".", /[0-9]+/)),

    expr_rem: $ => prec.left(12, seq($._expr, "%", $._expr)),

    expr_return: $ => prec.right(seq("return", optional($._expr))),

    expr_seq: $ => prec.right(0, seq($._expr, ";", $._expr)),

    expr_shl: $ => prec.left(10, seq($._expr, "<<", $._expr)),

    expr_shr: $ => prec.left(10, seq($._expr, ">>", $._expr)),

    expr_sub: $ => prec.left(11, seq($._expr, "-", $._expr)),

    expr_tuple: $ => seq("(", optional(seq($._expr, repeat(seq(",", $._expr)), optional(","))), ")"),

    expr_type: $ => prec(17, seq($._expr, ":", $._type_atom)),

    expr_wild: $ => "_",

    field: $ => seq(optional($.attributes), $.name_field, ":", $._type_atom),

    _function: $ => choice($.function, $.function_extern),

    function_extern: $ =>
      seq(
        "extern",
        "function",
        $.name_func,
        "(",
        optional(seq($.arg, repeat(seq(",", $.arg)))),
        ")",
        ":",
        $._type_atom,
      ),

    function: $ =>
      prec.right(
        seq(
          "function",
          $.name_func,
          "(",
          optional(seq($.arg, repeat(seq(",", $.arg)))),
          ")",
          ":",
          $._type_atom,
          choice(seq("=", $._expr), "{", $._expr, "}"),
        ),
      ),

    _ident: $ => choice(Pattern.ident_lower, Pattern.ident_upper),

    _ident_lower_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*\.)*[a-z_][a-zA-Z0-9_]*/,

    _ident_upper_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*\.)*[A-Z][a-zA-Z0-9_]*/,

    import: $ => seq("import", $.module_path, optional(seq("as", $.module_alias))),

    _item: $ => choice($.import, $._function, $._relation, $.rule, $._typedef),

    _literal_bool: $ => choice($.bool_false, $.bool_true),

    literal_int: $ =>
      choice(
        $.literal_int_dec,
        prec(
          18,
          seq(
            optional($.literal_int_dec),
            choice(
              seq("'b", $.literal_int_bin),
              seq("'d", $.literal_int_dec),
              seq("'h", $.literal_int_hex),
              seq("'o", $.literal_int_oct),
              seq("'sb", $.literal_int_bin),
              seq("'sd", $.literal_int_dec),
              seq("'sh", $.literal_int_hex),
              seq("'so", $.literal_int_oct),
            ),
          ),
        ),
      ),

    literal_int_bin: $ => Pattern.literal_num_bin,

    literal_int_dec: $ => Pattern.literal_num_dec,

    literal_int_hex: $ => Pattern.literal_num_hex,

    literal_int_oct: $ => Pattern.literal_num_oct,

    literal_map: $ => seq("[", $._expr, "->", $._expr, repeat(seq(",", $._expr, "->", $._expr)), "]"),

    literal_string: $ => seq('"', repeat(choice(token.immediate(/[^"\\\n]+|\\\r?\n/), $._escape_sequence)), '"'),

    literal_vec: $ => seq("[", $._expr, repeat(seq(",", $._expr)), "]"),

    match_clause: $ => seq($._pattern, "->", $._expr),

    module_alias: $ => $._ident,

    module_path: $ => seq($._ident, repeat(seq("::", $._ident))),

    name: $ => Pattern.ident_lower,

    name_arg: $ => Pattern.ident_lower,

    name_cons: $ => $._ident_upper_scoped,

    name_field: $ => Pattern.ident_lower,

    name_func: $ => $._ident_lower_scoped,

    name_rel: $ => prec(1, $._ident_upper_scoped),

    name_type: $ => choice($._ident_lower_scoped, $._ident_upper_scoped),

    name_var_term: $ => $._ident_lower_scoped,

    name_var_type: $ => /'[A-Z][a-zA-Z0-9_]*/,

    _pattern: $ =>
      choice($._pattern_cons, $.pattern_term_decl_var, $._pattern_literal, $.pattern_tuple, $.pattern_wildcard),

    _pattern_cons: $ => choice($.pattern_cons_rec, $.pattern_cons_pos),

    pattern_cons_rec: $ =>
      prec(
        1,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $._pattern, repeat(seq(",", ".", $.name_field, "=", $._pattern)))),
          "}",
        ),
      ),

    pattern_cons_pos: $ =>
      seq($.name_cons, optional(seq("{", optional(seq($._pattern, repeat(seq(",", $._pattern)))), "}"))),

    _pattern_literal: $ => choice($._literal_bool, $.literal_int, $.literal_string),

    pattern_term_decl_var: $ => seq(optional("var"), $.name_var_term),

    pattern_tuple: $ => seq("(", optional(seq($._pattern, repeat(seq(",", $._pattern)))), ")"),

    pattern_wildcard: $ => "_",

    primary_key: $ => seq("primary", "key", "(", $.name_var_term, ")", $._expr),

    _relation: $ => choice($.relation_args, $.relation_elem),

    relation_args: $ =>
      seq(
        optional(choice("input", "output")),
        "relation",
        seq(optional("&"), $.name_rel),
        "(",
        $.arg,
        repeat(seq(",", $.arg)),
        ")",
        optional($.primary_key),
      ),

    relation_elem: $ => choice($.relation_input, $.relation_output, $.relation_internal),

    relation_input: $ => seq("input", "relation", $.name_rel, "[", $._type_atom, "]", optional($.primary_key)),

    relation_output: $ => seq("output", "relation", $.name_rel, "[", $._type_atom, "]", optional($.primary_key)),

    relation_internal: $ => seq("relation", $.name_rel, "[", $._type_atom, "]", optional($.primary_key)),

    _rhs: $ => choice($.rhs_atom, $.rhs_atom_neg, $.rhs_expr, $.rhs_flat_map, $.rhs_grouping),

    rhs_atom: $ => $._atom,

    rhs_atom_neg: $ => seq("not", $._atom),

    rhs_expr: $ => $._expr,

    rhs_flat_map: $ => prec(1, seq("var", $.name_var_term, "=", "FlatMap", "(", $._expr, ")")),

    rhs_grouping: $ => seq("var", $.name_var_term, "=", $._expr, ".", "group_by", "(", $._expr, ")"),

    rule: $ => seq($._atom, repeat(seq(",", $._atom)), ":-", $._rhs, repeat(seq(",", $._rhs))),

    _typedef: $ => choice($.typedef, $.typedef_external),

    typedef_external: $ =>
      seq(
        "extern",
        "type",
        $.name_var_type,
        optional(seq("<", $.name_var_type, repeat(seq(",", $.name_var_type)), ">")),
      ),

    typedef: $ =>
      seq(
        "typedef",
        $.name_type,
        optional(seq("<", $.name_var_type, repeat(seq(",", $.name_var_type)), ">")),
        "=",
        $._type,
      ),

    _type: $ =>
      choice(
        $.type_bit,
        $.type_signed,
        $.type_bigint,
        $.type_double,
        $.type_float,
        $.type_string,
        $.type_bool,
        $.type_union,
        $.type_user,
        $.type_var,
        $.type_fun,
        $.type_tuple,
      ),

    type_bigint: $ => "bigint",

    type_bit: $ => seq("bit", "<", Pattern.literal_num_dec, ">"),

    type_bool: $ => "bool",

    type_double: $ => "double",

    type_float: $ => "float",

    type_fun: $ =>
      prec.right(
        choice(
          seq(
            "function",
            "(",
            optional(seq(optional("mut"), $._type, repeat(seq(",", optional("mut"), $._type)))),
            ")",
            optional(seq(":", $._type)),
          ),
          prec.left(
            seq(
              "|",
              optional(seq(optional("mut"), $._type, repeat(seq(",", optional("mut"), $._type)))),
              "|",
              optional(seq(":", $._type)),
            ),
          ),
        ),
      ),

    type_signed: $ => seq("signed", "<", Pattern.literal_num_dec, ">"),

    _type_atom: $ =>
      choice(
        $.type_bit,
        $.type_signed,
        $.type_bigint,
        $.type_double,
        $.type_float,
        $.type_string,
        $.type_bool,
        $.type_tuple,
        $.type_user,
        $.type_fun,
        $.type_var,
      ),

    type_string: $ => "string",

    type_tuple: $ => seq("(", optional(seq($._type_atom, repeat(seq(",", $._type_atom)), optional(","))), ")"),

    type_union: $ => prec.right(seq(repeat(seq($._cons, "|")), $._cons)),

    type_user: $ => prec.right(seq($.name_type, optional(seq("<", $._type, repeat(seq(",", $._type)), ">")))),

    type_var: $ => "var",

    word: $ => token(seq(/[a-z_]/, repeat(/[a-zA-Z0-9_]/))),
  },
});
