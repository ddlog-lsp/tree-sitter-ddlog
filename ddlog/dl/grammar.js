/// <reference types="tree-sitter-cli/dsl" />

const Pattern = {
  lit_num_bin: /[0-1][0-1_]*/,
  lit_num_dec: /[0-9][0-9_]*/,
  lit_num_float: /[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?/,
  lit_num_hex: /[0-9a-fA-F][0-9a-fA-F_]*/,
  lit_num_oct: /[0-7][0-7_]*/,
  ident_lower: /[a-z_][a-zA-Z0-9_]*/,
  ident_upper: /[A-Z][a-zA-Z0-9_]*/,
};

module.exports = grammar({
  name: "ddlog_dl",

  externals: $ => [$.rule_end],

  conflicts: $ => [
    [$.exp_assign],
    [$.exp_cons_pos, $.pat_cons_pos],
    [$.exp_eq, $.exp_gt],
    [$.exp_eq, $.exp_lt],
    [$.exp_eq, $.exp_lteq],
    [$.exp_eq, $.exp_gteq],
    [$.exp_gt],
    [$.exp_gt, $.exp_gteq],
    [$.exp_gt, $.exp_lt],
    [$.exp_gt, $.exp_lteq],
    [$.exp_gt, $.exp_neq],
    [$.exp_gteq],
    [$.exp_gteq, $.exp_lt],
    [$.exp_gteq, $.exp_lteq],
    [$.exp_gteq, $.exp_neq],
    [$._exp_lit, $._pat_lit],
    [$.exp_lt],
    [$.exp_lt, $.exp_lteq],
    [$.exp_lt, $.exp_neq],
    [$.exp_lteq],
    [$.exp_lteq, $.exp_neq],
    [$.exp_tuple, $.pat_tuple],
    [$.exp_wild, $.pat_wild],
    [$.name_cons, $.name_type],
  ],

  extras: $ => [$._comment_block, $._comment_line, /[\s\uFEFF\u2060\u200B\u00A0]/],

  word: $ => $.word,

  rules: {
    ROOT: $ => repeat($._annotated_item),

    _annotated_item: $ => seq(optional($.attributes), $._item),

    arg: $ => seq($.name_arg, ":", optional("mut"), $._type_atom),

    arg_opt_type: $ => seq($.name_arg, optional(seq(":", optional("mut"), $._type_atom))),

    _atom: $ => choice($.atom_rec, $.atom_pos, $.atom_elem),

    atom_elem: $ => seq($.name_rel, "[", $._exp, "]"),

    atom_pos: $ =>
      prec.right(
        seq(
          optional(seq($.name_var_term, "in")),
          seq(optional("&"), $.name_rel),
          optional(seq("(", optional($._exp), repeat(seq(",", $._exp)), ")")),
        ),
      ),

    atom_rec: $ =>
      seq(
        optional(seq($.name_var_term, "in")),
        seq(optional("&"), $.name_rel),
        "(",
        ".",
        $.name_arg,
        "=",
        $._exp,
        repeat(seq(",", ".", $.name_arg, "=", $._exp)),
        ")",
      ),

    attribute: $ => seq($.name, optional(seq("=", $._exp))),

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

    _escape_sequence_interpolated: $ =>
      token.immediate(
        seq("\\", choice(/[^"xu0-7]/, /[0-7]{1,3}/, /x[0-9a-fA-F]{2}/, /u[0-9a-fA-F]{4}/, /u{[0-9a-fA-F]+}/)),
      ),

    _exp: $ =>
      choice(
        $.exp_add,
        $.exp_assign,
        $.exp_binding,
        $.exp_bit_and,
        $.exp_bit_neg,
        $.exp_bit_or,
        $.exp_bit_slice,
        $.exp_bit_xor,
        $.exp_block,
        $.exp_break,
        $.exp_cast,
        $.exp_cat,
        $.exp_cond,
        $.exp_continue,
        $.exp_cons_rec,
        $.exp_cons_pos,
        $.exp_decl_var,
        $.exp_div,
        $.exp_eq,
        $.exp_field,
        $.exp_for,
        $.exp_fun_call,
        $.exp_fun_call_dot,
        $.exp_gt,
        $.exp_gteq,
        $.exp_lambda,
        $._exp_lit,
        $.exp_log_and,
        $.exp_log_imp,
        $.exp_log_neg,
        $.exp_log_or,
        $.exp_lt,
        $.exp_lteq,
        $.exp_match,
        $.exp_mul,
        $.exp_neg,
        $.exp_neq,
        $.exp_proj,
        $.exp_ref,
        $.exp_rem,
        $.exp_return,
        $.exp_seq,
        $.exp_shl,
        $.exp_shr,
        $.exp_slice,
        $.exp_sub,
        $.exp_try,
        $.exp_tuple,
        $.exp_type,
        $.exp_wild,
      ),

    exp_add: $ => prec.left(13, seq($._exp, "+", $._exp)),

    exp_assign: $ => prec(3, seq($._exp, "=", $._exp)),

    exp_bit_and: $ => prec.left(9, seq($._exp, "&", $._exp)),

    exp_bit_neg: $ => prec(16, seq("~", $._exp)),

    exp_bit_or: $ => prec.left(7, seq($._exp, "|", $._exp)),

    exp_bit_slice: $ => prec(19, seq($._exp, "[", Pattern.lit_num_dec, ",", Pattern.lit_num_dec, "]")),

    exp_bit_xor: $ => prec.left(8, seq($._exp, "^", $._exp)),

    exp_block: $ => seq("{", optional($._exp), "}"),

    exp_break: $ => "break",

    exp_cast: $ => prec(19, seq($._exp, "as", $._type_atom)),

    exp_cat: $ => prec.left(11, seq($._exp, "++", $._exp)),

    exp_cond: $ => prec.left(seq("if", $._exp, $._exp, optional(seq("else", $._exp)))),

    exp_continue: $ => "continue",

    _exp_cons: $ => choice($.exp_cons_rec, $.exp_cons_pos),

    exp_cons_rec: $ =>
      prec(
        3,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $._exp, repeat(seq(",", ".", $.name_field, "=", $._exp)))),
          "}",
        ),
      ),

    exp_binding: $ => prec(2, seq($.name_var_term, "@", $._exp)),

    exp_cons_pos: $ => seq($.name_cons, optional(seq("{", optional(seq($._exp, repeat(seq(",", $._exp)))), "}"))),

    exp_decl_var: $ => prec(20, seq(optional("var"), $.name_var_term)),

    exp_div: $ => prec.left(14, seq($._exp, "/", $._exp)),

    exp_eq: $ => prec.left(10, seq($._exp, "==", $._exp)),

    exp_field: $ => prec(19, seq($._exp, ".", $._ident)),

    // FIXME: precedence
    exp_for: $ => prec(20, seq("for", "(", $.name_var_term, "in", $._exp, ")", $._exp)),

    exp_fun_call: $ => prec(19, seq($._exp, "(", optional(seq($._exp, repeat(seq(",", $._exp)))), ")")),

    exp_fun_call_dot: $ =>
      prec(19, seq($._exp, ".", $.name_func, "(", optional(seq($._exp, repeat(seq(",", $._exp)))), ")")),

    exp_gt: $ => prec(10, seq($._exp, ">", $._exp)),

    exp_gteq: $ => prec(10, seq($._exp, ">=", $._exp)),

    exp_lambda: $ =>
      prec.right(
        0,
        choice(
          seq(
            "function",
            "(",
            optional(seq($.arg_opt_type, repeat(seq(",", $.arg_opt_type)))),
            ")",
            optional(seq(":", $._type_atom)),
            $._exp,
          ),
          seq(
            "|",
            optional(seq($.arg_opt_type, repeat(seq(",", $.arg_opt_type)))),
            "|",
            optional(seq(":", $._type_atom)),
            $._exp,
          ),
        ),
      ),

    _exp_lit: $ => choice($._lit_bool, $.lit_num, $.lit_map, $.lit_string, $.lit_vec),

    exp_log_and: $ => prec.left(6, seq($._exp, "and", $._exp)),

    exp_log_imp: $ => prec.left(4, seq($._exp, "=>", $._exp)),

    exp_log_neg: $ => prec(15, seq("not", $._exp)),

    exp_log_or: $ => prec.left(5, seq($._exp, "or", $._exp)),

    exp_lt: $ => prec(10, seq($._exp, "<", $._exp)),

    exp_lteq: $ => prec(10, seq($._exp, "<=", $._exp)),

    exp_match: $ =>
      seq(
        "match",
        "(",
        $._exp,
        ")",
        "{",
        optional(seq(seq($._pat, "->", $._exp), repeat(seq(",", seq($._pat, "->", $._exp))))),
        "}",
      ),

    exp_mul: $ => prec.left(14, seq($._exp, "*", $._exp)),

    exp_neg: $ => prec(17, seq("-", $._exp)),

    exp_neq: $ => prec.left(10, seq($._exp, "!=", $._exp)),

    exp_proj: $ => prec(19, seq($._exp, ".", /[0-9]+/)),

    exp_ref: $ => prec(18, seq("&", $._exp)),

    exp_rem: $ => prec.left(14, seq($._exp, "%", $._exp)),

    exp_return: $ => prec.right(seq("return", optional($._exp))),

    exp_seq: $ => prec.left(1, seq($._exp, ";", optional($._exp))),

    exp_shl: $ => prec.left(12, seq($._exp, "<<", $._exp)),

    exp_shr: $ => prec.left(12, seq($._exp, ">>", $._exp)),

    exp_slice: $ => prec(19, seq($._exp, "[", Pattern.lit_num_dec, ":", Pattern.lit_num_dec, "]")),

    exp_sub: $ => prec.left(13, seq($._exp, "-", $._exp)),

    exp_try: $ => prec(19, seq($._exp, "?")),

    exp_tuple: $ => seq("(", optional(seq($._exp, repeat(seq(",", $._exp)), optional(","))), ")"),

    exp_type: $ => prec(19, seq($._exp, ":", $._type_atom)),

    exp_wild: $ => "_",

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
        optional(seq(":", $._type_atom)),
      ),

    function: $ =>
      prec.right(
        seq(
          "function",
          $.name_func,
          "(",
          optional(seq($.arg, repeat(seq(",", $.arg)))),
          ")",
          optional(seq(":", $._type_atom)),
          choice(seq("=", $._exp), "{", $._exp, "}"),
        ),
      ),

    _ident: $ => choice(Pattern.ident_lower, Pattern.ident_upper),

    _ident_lower_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*::)*[a-z_][a-zA-Z0-9_]*/,

    _ident_upper_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*::)*[A-Z][a-zA-Z0-9_]*/,

    import: $ => seq("import", $.module_path, optional(seq("as", $.module_alias))),

    interpolation: $ => seq("${", $._exp, "}"),

    _item: $ => choice($.import, $._function, $._rel, $.rule, $._typedef),

    key_primary: $ => seq("primary", "key", "(", $.name_var_term, ")", $._exp),

    _lit_bool: $ => choice($.bool_false, $.bool_true),

    lit_num: $ =>
      choice(
        prec.right(choice($.lit_num_dec, $.lit_num_float)),
        prec(
          18,
          seq(
            optional($.lit_num_dec),
            choice(
              seq("'b", $.lit_num_bin),
              seq("'d", $.lit_num_dec),
              seq("'f", $.lit_num_float),
              seq("'h", $.lit_num_hex),
              seq("'o", $.lit_num_oct),
              seq("'sb", $.lit_num_bin),
              seq("'sd", $.lit_num_dec),
              seq("'sh", $.lit_num_hex),
              seq("'so", $.lit_num_oct),
            ),
          ),
        ),
      ),

    lit_num_bin: $ => Pattern.lit_num_bin,

    lit_num_dec: $ => Pattern.lit_num_dec,

    lit_num_float: $ => Pattern.lit_num_float,

    lit_num_hex: $ => Pattern.lit_num_hex,

    lit_num_oct: $ => Pattern.lit_num_oct,

    lit_map: $ => seq("[", $._exp, "->", $._exp, repeat(seq(",", $._exp, "->", $._exp)), "]"),

    lit_string: $ =>
      prec.right(repeat1(choice($.string_quoted, $.string_quoted_escaped, $.string_raw, $.string_raw_interpolated))),

    lit_vec: $ => seq("[", $._exp, repeat(seq(",", $._exp)), "]"),

    match_clause: $ => seq($._pat, "->", $._exp),

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

    _pat: $ => choice($._pat_cons, $.pat_term_decl_var, $._pat_lit, $.pat_tuple, $.pat_wild),

    _pat_cons: $ => choice($.pat_cons_rec, $.pat_cons_pos),

    pat_cons_rec: $ =>
      prec(
        1,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $._pat, repeat(seq(",", ".", $.name_field, "=", $._pat)))),
          "}",
        ),
      ),

    pat_cons_pos: $ => seq($.name_cons, optional(seq("{", optional(seq($._pat, repeat(seq(",", $._pat)))), "}"))),

    _pat_lit: $ => choice($._lit_bool, $.lit_num, $.lit_string),

    pat_term_decl_var: $ => seq(optional("var"), $.name_var_term),

    pat_tuple: $ => seq("(", optional(seq($._pat, repeat(seq(",", $._pat)))), ")"),

    pat_wild: $ => "_",

    _rel: $ => choice($.rel_args, $.rel_elem),

    rel_args: $ =>
      seq(
        optional($.rel_role),
        $.rel_semantics,
        seq(optional("&"), $.name_rel),
        "(",
        optional($.arg),
        repeat(seq(",", $.arg)),
        ")",
        optional($.key_primary),
      ),

    rel_elem: $ =>
      seq(
        optional($.rel_role),
        $.rel_semantics,
        seq(optional("&"), $.name_rel),
        "[",
        $._type_atom,
        "]",
        optional($.key_primary),
      ),

    rel_role: $ => choice("input", "internal", "output"),

    rel_semantics: $ => choice("relation", "stream", "multiset"),

    _rhs: $ => choice($.rhs_inspect, $._atom, $.rhs_atom_neg, $._exp, $.rhs_flat_map, $.rhs_grouping),

    rhs_atom_neg: $ => seq("not", $._atom),

    rhs_flat_map: $ => prec(1, seq("var", $.name_var_term, "=", "FlatMap", "(", $._exp, ")")),

    rhs_grouping: $ => seq("var", $.name_var_term, "=", $._exp, ".", "group_by", "(", $._exp, ")"),

    rhs_inspect: $ => seq("Inspect", $._exp),

    rule: $ =>
      seq($._atom, repeat(seq(",", $._atom)), optional(seq(":-", $._rhs, repeat(seq(",", $._rhs)))), $.rule_end),

    string_quoted: $ =>
      seq(
        /i?"/,
        repeat(choice(/[^$"\\\n]+|\\\r?\n/, seq("$", token.immediate(/[^{]/)), $.interpolation, $._escape_sequence)),
        '"',
      ),

    string_quoted_escaped: $ =>
      seq(
        /i?\\"/,
        repeat(
          choice(
            /[^$"\\\n]+|\\\r?\n/,
            seq("$", token.immediate(/[^{]/)),
            $.interpolation,
            $._escape_sequence_interpolated,
          ),
        ),
        '\\"',
      ),

    string_raw: $ => seq(/i?\[\|/, /([^|]|\|[^\]])*/, "|]"),

    string_raw_interpolated: $ =>
      seq(/i?\$\[\|/, repeat(choice(/([^$|]|\|[^\]])+/, seq("$", token.immediate(/[^{]/)), $.interpolation)), "|]"),

    _typedef: $ => choice($.typedef, $.typedef_external),

    typedef_external: $ =>
      seq("extern", "type", $.name_type, optional(seq("<", $.name_var_type, repeat(seq(",", $.name_var_type)), ">"))),

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

    type_bit: $ => seq("bit", "<", Pattern.lit_num_dec, ">"),

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

    type_signed: $ => seq("signed", "<", Pattern.lit_num_dec, ">"),

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
