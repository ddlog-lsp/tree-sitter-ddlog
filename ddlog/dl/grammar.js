/// <reference types="tree-sitter-cli/dsl" />

const Pattern = {
  literal_num_bin: /[0-1][0-1_]*/,
  literal_num_dec: /[0-9][0-9_]*/,
  literal_num_float: /[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?/,
  literal_num_hex: /[0-9a-fA-F][0-9a-fA-F_]*/,
  literal_num_oct: /[0-7][0-7_]*/,
  ident_lower: /[a-z_][a-zA-Z0-9_]*/,
  ident_upper: /[A-Z][a-zA-Z0-9_]*/,
};

module.exports = grammar({
  name: "ddlog_dl",

  externals: $ => [$.rule_end],

  conflicts: $ => [
    [$.expr_assign],
    [$.expr_cons_pos, $.patt_cons_pos],
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
    [$._expr_lit, $._patt_lit],
    [$.expr_lt],
    [$.expr_lt, $.expr_lteq],
    [$.expr_lt, $.expr_neq],
    [$.expr_lteq],
    [$.expr_lteq, $.expr_neq],
    [$.expr_tuple, $.patt_tuple],
    [$.expr_wild, $.patt_wild],
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

    atom_pos: $ =>
      seq(
        optional(seq($.name_var_term, "in")),
        seq(optional("&"), $.name_rel),
        "(",
        optional($._expr),
        repeat(seq(",", $._expr)),
        ")",
      ),

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

    attribute: $ => seq($.name, optional(seq("=", $._expr))),

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
        $.expr_binding,
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
        $.expr_lambda,
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
        $.expr_ref,
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

    expr_add: $ => prec.left(13, seq($._expr, "+", $._expr)),

    expr_assign: $ => prec(3, seq($._expr, "=", $._expr)),

    expr_bit_and: $ => prec.left(9, seq($._expr, "&", $._expr)),

    expr_bit_neg: $ => prec(16, seq("~", $._expr)),

    expr_bit_or: $ => prec.left(7, seq($._expr, "|", $._expr)),

    expr_bit_slice: $ => prec(19, seq($._expr, "[", Pattern.literal_num_dec, ",", Pattern.literal_num_dec, "]")),

    expr_bit_xor: $ => prec.left(8, seq($._expr, "^", $._expr)),

    expr_block: $ => seq("{", optional($._expr), "}"),

    expr_break: $ => "break",

    expr_cast: $ => prec(19, seq($._expr, "as", $._type_atom)),

    expr_cat: $ => prec.left(11, seq($._expr, "++", $._expr)),

    expr_cond: $ => prec.left(seq("if", $._expr, $._expr, optional(seq("else", $._expr)))),

    expr_continue: $ => "continue",

    _expr_cons: $ => choice($.expr_cons_rec, $.expr_cons_pos),

    expr_cons_rec: $ =>
      prec(
        3,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $._expr, repeat(seq(",", ".", $.name_field, "=", $._expr)))),
          "}",
        ),
      ),

    expr_binding: $ => prec(2, seq($.name_var_term, "@", $._expr)),

    expr_cons_pos: $ => seq($.name_cons, optional(seq("{", optional(seq($._expr, repeat(seq(",", $._expr)))), "}"))),

    expr_decl_var: $ => prec(20, seq(optional("var"), $.name_var_term)),

    expr_div: $ => prec.left(14, seq($._expr, "/", $._expr)),

    expr_eq: $ => prec.left(10, seq($._expr, "==", $._expr)),

    expr_field: $ => prec(19, seq($._expr, ".", $._ident)),

    // FIXME: precedence
    expr_for: $ => prec(20, seq("for", "(", $.name_var_term, "in", $._expr, ")", $._expr)),

    expr_fun_call: $ => prec(19, seq($._expr, "(", optional(seq($._expr, repeat(seq(",", $._expr)))), ")")),

    expr_fun_call_dot: $ =>
      prec(19, seq($._expr, ".", $.name_func, "(", optional(seq($._expr, repeat(seq(",", $._expr)))), ")")),

    expr_gt: $ => prec(10, seq($._expr, ">", $._expr)),

    expr_gteq: $ => prec(10, seq($._expr, ">=", $._expr)),

    expr_lambda: $ =>
      prec.right(
        0,
        choice(
          seq(
            "function",
            "(",
            optional(seq($._patt, repeat(seq(",", $._patt)))),
            ")",
            optional(seq(":", $._type_atom)),
            $._expr,
          ),
          seq("|", optional(seq($._patt, repeat(seq(",", $._patt)))), "|", optional(seq(":", $._type_atom)), $._expr),
        ),
      ),

    _expr_lit: $ =>
      choice($._literal_bool, $.literal_num, $.literal_map, $.literal_string, $.literal_string_interned, $.literal_vec),

    expr_log_and: $ => prec.left(6, seq($._expr, "and", $._expr)),

    expr_log_imp: $ => prec.left(4, seq($._expr, "=>", $._expr)),

    expr_log_neg: $ => prec(15, seq("not", $._expr)),

    expr_log_or: $ => prec.left(5, seq($._expr, "or", $._expr)),

    expr_lt: $ => prec(10, seq($._expr, "<", $._expr)),

    expr_lteq: $ => prec(10, seq($._expr, "<=", $._expr)),

    expr_match: $ =>
      seq("match", "(", $._expr, ")", "{", optional($.match_clause), repeat(seq(",", $.match_clause)), "}"),

    expr_mul: $ => prec.left(14, seq($._expr, "*", $._expr)),

    expr_neg: $ => prec(17, seq("-", $._expr)),

    expr_neq: $ => prec.left(10, seq($._expr, "!=", $._expr)),

    expr_proj: $ => prec(19, seq($._expr, ".", /[0-9]+/)),

    expr_ref: $ => prec(18, seq("&", $._expr)),

    expr_rem: $ => prec.left(14, seq($._expr, "%", $._expr)),

    expr_return: $ => prec.right(seq("return", optional($._expr))),

    expr_seq: $ => prec.right(1, seq($._expr, ";", $._expr)),

    expr_shl: $ => prec.left(12, seq($._expr, "<<", $._expr)),

    expr_shr: $ => prec.left(12, seq($._expr, ">>", $._expr)),

    expr_sub: $ => prec.left(13, seq($._expr, "-", $._expr)),

    expr_tuple: $ => seq("(", optional(seq($._expr, repeat(seq(",", $._expr)), optional(","))), ")"),

    expr_type: $ => prec(19, seq($._expr, ":", $._type_atom)),

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

    _ident_lower_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*::)*[a-z_][a-zA-Z0-9_]*/,

    _ident_upper_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*::)*[A-Z][a-zA-Z0-9_]*/,

    import: $ => seq("import", $.module_path, optional(seq("as", $.module_alias))),

    interpolation: $ => seq("${", $._expr, "}"),

    _item: $ => choice($.import, $._function, $._relation, $.rule, $._typedef),

    _literal_bool: $ => choice($.bool_false, $.bool_true),

    literal_num: $ =>
      choice(
        prec.right(choice($.literal_num_dec, $.literal_num_float)),
        prec(
          18,
          seq(
            optional($.literal_num_dec),
            choice(
              seq("'b", $.literal_num_bin),
              seq("'d", $.literal_num_dec),
              seq("'f", $.literal_num_float),
              seq("'h", $.literal_num_hex),
              seq("'o", $.literal_num_oct),
              seq("'sb", $.literal_num_bin),
              seq("'sd", $.literal_num_dec),
              seq("'sh", $.literal_num_hex),
              seq("'so", $.literal_num_oct),
            ),
          ),
        ),
      ),

    literal_num_bin: $ => Pattern.literal_num_bin,

    literal_num_dec: $ => Pattern.literal_num_dec,

    literal_num_float: $ => Pattern.literal_num_float,

    literal_num_hex: $ => Pattern.literal_num_hex,

    literal_num_oct: $ => Pattern.literal_num_oct,

    literal_map: $ => seq("[", $._expr, "->", $._expr, repeat(seq(",", $._expr, "->", $._expr)), "]"),

    literal_string: $ => prec.right(repeat1(choice($.string_quoted, $.string_raw, $.string_raw_interpolated))),

    literal_string_interned: $ => seq("i", $.literal_string),

    literal_vec: $ => seq("[", $._expr, repeat(seq(",", $._expr)), "]"),

    match_clause: $ => seq($._patt, "->", $._expr),

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

    _patt: $ => choice($._patt_cons, $.patt_term_decl_var, $._patt_lit, $.patt_tuple, $.patt_wild),

    _patt_cons: $ => choice($.patt_cons_rec, $.patt_cons_pos),

    patt_cons_rec: $ =>
      prec(
        1,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $._patt, repeat(seq(",", ".", $.name_field, "=", $._patt)))),
          "}",
        ),
      ),

    patt_cons_pos: $ => seq($.name_cons, optional(seq("{", optional(seq($._patt, repeat(seq(",", $._patt)))), "}"))),

    _patt_lit: $ => choice($._literal_bool, $.literal_num, $.literal_string),

    patt_term_decl_var: $ => seq(optional("var"), $.name_var_term),

    patt_tuple: $ => seq("(", optional(seq($._patt, repeat(seq(",", $._patt)))), ")"),

    patt_wild: $ => "_",

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

    _rhs: $ => choice($._atom, $.rhs_atom_neg, $._expr, $.rhs_flat_map, $.rhs_grouping),

    rhs_atom_neg: $ => seq("not", $._atom),

    rhs_flat_map: $ => prec(1, seq("var", $.name_var_term, "=", "FlatMap", "(", $._expr, ")")),

    rhs_grouping: $ => seq("var", $.name_var_term, "=", $._expr, ".", "group_by", "(", $._expr, ")"),

    rule: $ =>
      seq($._atom, repeat(seq(",", $._atom)), optional(seq(":-", $._rhs, repeat(seq(",", $._rhs)))), $.rule_end),

    string_quoted: $ =>
      seq(
        '"',
        repeat(choice(/[^$"\\\n]+|\\\r?\n/, seq("$", token.immediate(/[^{]/)), $.interpolation, $._escape_sequence)),
        '"',
      ),

    string_raw: $ => seq("[|", /([^|]|\|[^\]])*/, "|]"),

    string_raw_interpolated: $ =>
      seq("$[|", repeat(choice(/([^$|]|\|[^\]])+/, seq("$", token.immediate(/[^{]/)), $.interpolation)), "|]"),

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

    type_var: $ => seq("'", token.immediate(Pattern.ident_upper)),

    word: $ => token(seq(/[a-z_]/, repeat(/[a-zA-Z0-9_]/))),
  },
});
