/// <reference types="tree-sitter-cli/dsl" />

const Pattern = {
  lit_num_bin: /[0-1][0-1_]*/,
  lit_num_dec: /[0-9][0-9_]*/,
  lit_num_float: /[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?/,
  lit_num_hex: /[0-9a-fA-F][0-9a-fA-F_]*/,
  lit_num_oct: /[0-7][0-7_]*/,
  ident: /[a-zA-Z_][a-zA-Z0-9_]*/,
  ident_lower: /[a-z_][a-zA-Z0-9_]*/,
  ident_upper: /[A-Z][a-zA-Z0-9_]*/,
};

module.exports = grammar({
  patterns: Pattern,

  name: "ddlog_dl",

  conflicts: $ => [
    [$.exp_assign],
    [$.exp_block, $.statement_block],
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
    [$.exp_lit, $.pat_lit],
    [$.exp_lt],
    [$.exp_lt, $.exp_lteq],
    [$.exp_lt, $.exp_neq],
    [$.exp_lteq],
    [$.exp_lteq, $.exp_neq],
    [$.exp_match, $.statement_match],
    [$.exp_tuple, $.pat_tuple],
    [$.exp_tuple, $.statement_if],
    [$.exp_wild, $.pat_wild],
    [$.name_cons, $.name_type],
    [$.statement_if],
  ],

  externals: $ => [$.rule_end],

  extras: $ => [$.comment_block, $.comment_line, /[\s\uFEFF\u2060\u200B\u00A0]/],

  word: $ => $.word,

  rules: {
    ROOT: $ => repeat($.annotated_item),

    annotated_item: $ => seq(optional($.attributes), $.item),

    apply: $ =>
      seq(
        "apply",
        field("identifier", $.name_trans),
        "(",
        optional(choice($.name_func, $.name_rel)),
        repeat(seq(",", choice($.name_func, $.name_rel))),
        ")",
        "->",
        "(",
        optional($.name_rel),
        repeat(seq(",", $.name_rel)),
        ")",
      ),

    arg: $ => seq($.name_arg, ":", optional("mut"), $.type_atom),

    arg_opt_type: $ => seq($.name_arg, optional(seq(":", optional("mut"), $.type_atom))),

    arg_trans: $ => seq($.name_trans, ":", $.type_trans),

    atom: $ => choice($.atom_rec, $.atom_pos, $.atom_elem),

    atom_elem: $ => seq($.name_rel, "[", $.exp, "]"),

    atom_pos: $ =>
      prec.right(
        seq(
          optional(seq($.name_var_term, "in")),
          seq(optional("&"), $.name_rel),
          optional(seq("(", optional(seq($.exp, repeat(seq(",", $.exp)), optional(","))), ")")),
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
        $.exp,
        repeat(seq(",", ".", $.name_arg, "=", $.exp)),
        ")",
      ),

    attribute: $ => seq($.name, optional(seq("=", $.exp))),

    attributes: $ => repeat1(seq("#[", $.attribute, repeat(seq(",", $.attribute)), "]")),

    comment_block: $ =>
      seq("/*", repeat(choice($.comment_block, alias(token(choice(/[^/*]+/, "/", "*")), $.comment_block_inner))), "*/"),

    comment_line: $ => token(seq("//", /.*/)),

    cons: $ => choice($.cons_rec, $.cons_pos),

    cons_pos: $ => seq(optional($.attributes), $.name_cons),

    cons_rec: $ =>
      prec(
        1,
        seq(
          optional($.attributes),
          $.name_cons,
          "{",
          optional(seq($.field, repeat(seq(",", $.field)), optional(","))),
          "}",
        ),
      ),

    escape_sequence: $ =>
      token.immediate(
        seq("\\", choice(/[^xu0-7]/, /[0-7]{1,3}/, /x[0-9a-fA-F]{2}/, /u[0-9a-fA-F]{4}/, /u{[0-9a-fA-F]+}/)),
      ),

    // NOTE: why did this need to be a separate rule? duplicated from above
    escape_sequence_interpolated: $ =>
      token.immediate(
        seq("\\", choice(/[^"xu0-7]/, /[0-7]{1,3}/, /x[0-9a-fA-F]{2}/, /u[0-9a-fA-F]{4}/, /u{[0-9a-fA-F]+}/)),
      ),

    exp: $ =>
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
        $.exp_cons_pos,
        $.exp_cons_rec,
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
        $.exp_lit,
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

    exp_add: $ => prec.left(13, seq($.exp, "+", $.exp)),

    exp_assign: $ => prec(3, seq($.exp, "=", $.exp)),

    exp_binding: $ => prec(2, seq($.name_var_term, "@", $.exp)),

    exp_bit_and: $ => prec.left(9, seq($.exp, "&", $.exp)),

    exp_bit_neg: $ => prec(16, seq("~", $.exp)),

    exp_bit_or: $ => prec.left(7, seq($.exp, "|", $.exp)),

    exp_bit_slice: $ => prec(19, seq($.exp, "[", $.lit_num_dec, ",", $.lit_num_dec, "]")),

    exp_bit_xor: $ => prec.left(8, seq($.exp, "^", $.exp)),

    exp_block: $ => seq("{", optional($.exp), "}"),

    exp_break: $ => "break",

    exp_cast: $ => prec(19, seq($.exp, "as", $.type_atom)),

    exp_cat: $ => prec.left(11, seq($.exp, "++", $.exp)),

    exp_cond: $ => prec.left(seq("if", $.exp, $.exp, optional(seq("else", $.exp)))),

    exp_cons_pos: $ => seq($.name_cons, optional(seq("{", optional(seq($.exp, repeat(seq(",", $.exp)))), "}"))),

    exp_cons_rec: $ =>
      prec(
        3,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $.exp, repeat(seq(",", ".", $.name_field, "=", $.exp)))),
          "}",
        ),
      ),

    exp_continue: $ => "continue",

    exp_decl_var: $ => prec(21, seq(optional("var"), $.name_var_term)),

    exp_div: $ => prec.left(14, seq($.exp, "/", $.exp)),

    exp_eq: $ => prec.left(10, seq($.exp, "==", $.exp)),

    exp_field: $ => prec(19, seq($.exp, ".", $.ident)),

    // FIXME: precedence
    exp_for: $ => prec(21, seq("for", "(", $.name_var_term, "in", $.exp, ")", $.exp)),

    exp_fun_call: $ => prec(19, seq($.exp, "(", optional(seq($.exp, repeat(seq(",", $.exp)), optional(","))), ")")),

    exp_fun_call_dot: $ =>
      prec(20, seq($.exp, ".", $.name_func, "(", optional(seq($.exp, repeat(seq(",", $.exp)), optional(","))), ")")),

    exp_gt: $ => prec(10, seq($.exp, ">", $.exp)),

    exp_gteq: $ => prec(10, seq($.exp, ">=", $.exp)),

    exp_lambda: $ => choice($.exp_lambda_branch_0, $.exp_lambda_branch_1),

    exp_lambda_branch_0: $ =>
      prec.right(
        0,
        seq(
          "function",
          "(",
          optional(seq($.arg_opt_type, repeat(seq(",", $.arg_opt_type)))),
          ")",
          optional(seq(":", $.type_atom)),
          $.exp,
        ),
      ),

    exp_lambda_branch_1: $ =>
      prec.right(
        0,
        seq(
          "|",
          optional(seq($.arg_opt_type, repeat(seq(",", $.arg_opt_type)))),
          "|",
          optional(seq(":", $.type_atom)),
          $.exp,
        ),
      ),

    exp_lit: $ => choice($.lit_bool, $.lit_num, $.lit_map, $.lit_string, $.lit_vec),

    exp_log_and: $ => prec.left(6, seq($.exp, "and", $.exp)),

    exp_log_imp: $ => prec.left(4, seq($.exp, "=>", $.exp)),

    exp_log_neg: $ => prec(15, seq("not", $.exp)),

    exp_log_or: $ => prec.left(5, seq($.exp, "or", $.exp)),

    exp_lt: $ => prec(10, seq($.exp, "<", $.exp)),

    exp_lteq: $ => prec(10, seq($.exp, "<=", $.exp)),

    exp_match: $ =>
      seq(
        "match",
        "(",
        $.exp,
        ")",
        "{",
        optional(seq(seq($.pat, "->", $.exp), repeat(seq(",", seq($.pat, "->", $.exp))), optional(","))),
        "}",
      ),

    exp_mul: $ => prec.left(14, seq($.exp, "*", $.exp)),

    exp_neg: $ => prec(17, seq("-", $.exp)),

    exp_neq: $ => prec.left(10, seq($.exp, "!=", $.exp)),

    exp_proj: $ => prec(19, seq($.exp, ".", alias(/[0-9]+/, $.exp_proj_digits))),

    exp_ref: $ => prec(18, seq("&", $.exp)),

    exp_rem: $ => prec.left(14, seq($.exp, "%", $.exp)),

    exp_return: $ => prec.right(seq("return", optional($.exp))),

    exp_seq: $ => prec.left(1, seq($.exp, ";", optional($.exp))),

    exp_shl: $ => prec.left(12, seq($.exp, "<<", $.exp)),

    exp_shr: $ => prec.left(12, seq($.exp, ">>", $.exp)),

    exp_slice: $ => prec(19, seq($.exp, "[", $.lit_num_dec, ":", $.lit_num_dec, "]")),

    exp_sub: $ => prec.left(13, seq($.exp, "-", $.exp)),

    exp_try: $ => prec(19, seq($.exp, "?")),

    exp_tuple: $ => seq("(", optional(seq($.exp, repeat(seq(",", $.exp)), optional(","))), ")"),

    exp_type: $ => prec(19, seq($.exp, ":", $.type_atom)),

    exp_wild: $ => "_",

    field: $ => seq(optional($.attributes), $.name_field, ":", $.type_atom),

    function: $ => choice($.function_normal, $.function_extern),

    function_extern: $ =>
      seq(
        "extern",
        "function",
        field("identifier", $.name_func),
        "(",
        optional(seq($.arg, repeat(seq(",", $.arg)))),
        ")",
        optional(seq(":", $.type_atom)),
      ),

    function_normal: $ =>
      prec.right(
        seq(
          "function",
          field("identifier", $.name_func),
          "(",
          optional(seq($.arg, repeat(seq(",", $.arg)))),
          ")",
          optional(seq(":", $.type_atom)),
          choice($.function_normal_branch_0, $.function_normal_branch_1),
        ),
      ),

    function_normal_branch_0: $ => seq("=", $.exp),

    function_normal_branch_1: $ => seq("{", $.exp, "}"),

    ident: $ => choice($.ident_lower, $.ident_upper),

    ident_lower: $ => Pattern.ident_lower,

    ident_lower_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*::)*[a-z_][a-zA-Z0-9_]*/,

    ident_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*::)*[a-zA-Z_][a-zA-Z0-9_]*/,

    ident_upper: $ => Pattern.ident_upper,

    ident_upper_scoped: $ => /([a-zA-Z_][a-zA-Z0-9_]*::)*[A-Z][a-zA-Z0-9_]*/,

    import: $ => seq("import", $.module_path, optional(seq("as", $.module_alias))),

    index: $ =>
      seq(
        "index",
        field("identifier", $.name_index),
        "(",
        optional(seq($.arg, repeat(seq(",", $.arg)), optional(","))),
        ")",
        "on",
        $.atom,
      ),

    interpolation: $ => seq("${", $.exp, "}"),

    item: $ => choice($.statement_for, $.apply, $.import, $.function, $.index, $.rel, $.rule, $.transformer, $.typedef),

    key_primary: $ => seq("primary", "key", "(", $.name_var_term, ")", $.exp),

    lit_bool: $ => choice("false", "true"),

    // NOTE: can there be an optional trailing comma?
    lit_map: $ => seq("[", $.exp, "->", $.exp, repeat(seq(",", $.exp, "->", $.exp)), "]"),

    lit_num: $ => choice($.lit_num_branch_0, $.lit_num_branch_1),

    lit_num_branch_0: $ => prec.right(choice($.lit_num_dec, $.lit_num_float, $.lit_num_hex)),

    lit_num_branch_1: $ =>
      prec(
        18,
        seq(
          optional($.lit_num_dec),
          choice(
            $.lit_num_branch_10,
            $.lit_num_branch_11,
            $.lit_num_branch_12,
            $.lit_num_branch_13,
            $.lit_num_branch_14,
            $.lit_num_branch_15,
            $.lit_num_branch_16,
            $.lit_num_branch_17,
            $.lit_num_branch_18,
          ),
        ),
      ),

    lit_num_branch_10: $ => seq("'b", $.lit_num_bin),

    lit_num_branch_11: $ => seq("'d", $.lit_num_dec),

    lit_num_branch_12: $ => seq("'f", $.lit_num_float),

    lit_num_branch_13: $ => seq("'h", $.lit_num_hex),

    lit_num_branch_14: $ => seq("'o", $.lit_num_oct),

    lit_num_branch_15: $ => seq("'sb", $.lit_num_bin),

    lit_num_branch_16: $ => seq("'sd", $.lit_num_dec),

    lit_num_branch_17: $ => seq("'sh", $.lit_num_hex),

    lit_num_branch_18: $ => seq("'so", $.lit_num_oct),

    lit_num_bin: $ => Pattern.lit_num_bin,

    lit_num_dec: $ => Pattern.lit_num_dec,

    lit_num_float: $ => Pattern.lit_num_float,

    lit_num_hex: $ => Pattern.lit_num_hex,

    lit_num_oct: $ => Pattern.lit_num_oct,

    lit_string: $ =>
      prec.right(repeat1(choice($.string_quoted, $.string_quoted_escaped, $.string_raw, $.string_raw_interpolated))),

    lit_vec: $ => seq("[", $.exp, repeat(seq(",", $.exp)), "]"),

    module_alias: $ => $.ident,

    module_path: $ => seq($.ident, repeat(seq("::", $.ident))),

    name: $ => Pattern.ident_lower,

    name_arg: $ => Pattern.ident_lower,

    name_cons: $ => $.ident_upper_scoped,

    name_field: $ => Pattern.ident_lower,

    name_func: $ => $.ident_lower_scoped,

    name_index: $ => $.ident_scoped,

    name_rel: $ => prec(1, $.ident_upper_scoped),

    name_trans: $ => $.ident_scoped,

    name_type: $ => choice($.ident_lower_scoped, $.ident_upper_scoped),

    name_var_term: $ => $.ident_lower_scoped,

    name_var_type: $ => /'[A-Z][a-zA-Z0-9_]*/,

    pat: $ => choice($.pat_cons, $.pat_term_decl_var, $.pat_lit, $.pat_tuple, $.pat_type, $.pat_wild),

    pat_cons: $ => choice($.pat_cons_rec, $.pat_cons_pos),

    pat_cons_pos: $ =>
      prec(1, seq($.name_cons, optional(seq("{", optional(seq($.pat, repeat(seq(",", $.pat)), optional(","))), "}")))),

    pat_cons_rec: $ =>
      prec(
        2,
        seq(
          $.name_cons,
          "{",
          optional(seq(".", $.name_field, "=", $.pat, repeat(seq(",", ".", $.name_field, "=", $.pat)))),
          "}",
        ),
      ),

    pat_lit: $ => choice($.lit_bool, $.lit_num, $.lit_string),

    pat_term_decl_var: $ => seq(optional("var"), $.name_var_term),

    pat_tuple: $ => seq("(", optional(seq($.pat, repeat(seq(",", $.pat)))), ")"),

    pat_type: $ => seq($.pat, ":", $.type_atom),

    pat_wild: $ => "_",

    rel: $ => choice($.rel_args, $.rel_elem),

    rel_args: $ =>
      seq(
        optional($.rel_role),
        $.rel_semantics,
        seq(optional("&"), field("identifier", $.name_rel)),
        "(",
        optional(seq($.arg, repeat(seq(",", $.arg)), optional(","))),
        ")",
        optional($.key_primary),
      ),

    rel_elem: $ =>
      seq(
        optional($.rel_role),
        $.rel_semantics,
        seq(optional("&"), field("identifier", $.name_rel)),
        "[",
        $.type_atom,
        "]",
        optional($.key_primary),
      ),

    rel_role: $ => choice("input", "internal", "output"),

    rel_semantics: $ => choice("relation", "stream", "multiset"),

    rhs: $ => choice($.rhs_inspect, $.atom, $.rhs_atom_neg, $.exp, $.rhs_flat_map, $.rhs_grouping),

    rhs_atom_neg: $ => seq("not", $.atom),

    rhs_flat_map: $ => prec(1, seq("var", $.name_var_term, "=", "FlatMap", "(", $.exp, ")")),

    rhs_grouping: $ => seq("var", $.name_var_term, "=", $.exp, ".", "group_by", "(", $.exp, ")"),

    rhs_inspect: $ => seq("Inspect", $.exp),

    rule: $ => seq($.atom, repeat(seq(",", $.atom)), optional(seq(":-", $.rhs, repeat(seq(",", $.rhs)))), $.rule_end),

    statement: $ =>
      choice(
        $.statement_assign,
        $.statement_block,
        $.statement_empty,
        $.statement_for,
        $.statement_if,
        $.statement_insert,
        $.statement_match,
      ),

    statement_assign: $ => seq($.exp, "in", $.statement),

    statement_block: $ => seq("{", repeat(seq($.statement, optional(seq(";", optional($.statement))))), "}"),

    statement_empty: $ => "skip",

    statement_for: $ => seq("for", "(", $.atom, optional(seq("if", $.exp)), ")", $.statement),

    statement_if: $ => seq("if", "(", $.exp, ")", $.statement, optional(seq("else", $.statement))),

    statement_insert: $ => $.atom,

    statement_match: $ =>
      seq(
        "match",
        "(",
        $.exp,
        ")",
        "{",
        optional(seq(seq($.pat, "->", $.statement), repeat(seq(",", seq($.pat, "->", $.statement))), optional(","))),
        "}",
      ),

    string_quoted: $ =>
      seq(
        /i?"/,
        repeat(
          choice(
            $.string_quoted_branch_0,
            seq("$", optional(token.immediate(/[^{]/))),
            $.interpolation,
            $.escape_sequence,
          ),
        ),
        '"',
      ),

    string_quoted_branch_0: $ => /[^$"\\\n]+|\\\r?\n/,

    string_quoted_escaped: $ =>
      seq(
        /i?\\"/,
        repeat(
          choice(
            $.string_quoted_escaped_branch_0,
            $.string_quoted_escaped_branch_1,
            $.interpolation,
            $.escape_sequence_interpolated,
          ),
        ),
        '\\"',
      ),

    string_quoted_escaped_branch_0: $ => /[^$"\\\n]+|\\\r?\n/,

    string_quoted_escaped_branch_1: $ => seq("$", optional(token.immediate(/[^{]/))),

    string_raw: $ => token(seq(/i?\[\|/, /([^|]|\|[^\]])*/, "|]")),

    string_raw_interpolated: $ =>
      seq(
        /i?\$\[\|/,
        repeat(choice($.string_raw_interpolated_branch_0, $.string_raw_interpolated_branch_1, $.interpolation)),
        "|]",
      ),

    string_raw_interpolated_branch_0: $ => /([^$|]|\|[^\]])+/,

    string_raw_interpolated_branch_1: $ => seq("$", optional(token.immediate(/[^{]/))),

    transformer: $ =>
      seq(
        "extern",
        "transformer",
        field("identifier", $.name_trans),
        "(",
        optional(seq($.arg_trans, repeat(seq(",", $.arg_trans)), optional(","))),
        ")",
        "->",
        "(",
        optional(seq($.arg_trans, repeat(seq(",", $.arg_trans)), optional(","))),
        ")",
      ),

    type: $ =>
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

    type_atom: $ =>
      choice(
        $.type_bit,
        $.type_signed,
        $.type_bigint,
        $.type_double,
        $.type_float,
        $.type_string,
        $.type_bool,
        $.type_user,
        $.type_var,
        $.type_fun,
        $.type_tuple,
      ),

    type_bigint: $ => "bigint",

    type_bit: $ => seq("bit", "<", $.lit_num_dec, ">"),

    type_bool: $ => "bool",

    type_double: $ => "double",

    type_float: $ => "float",

    type_fun: $ => choice($.type_fun_branch_0, $.type_fun_branch_1),

    type_fun_branch_0: $ =>
      prec.right(
        seq(
          "function",
          "(",
          optional(seq(optional("mut"), $.type, repeat(seq(",", optional("mut"), $.type)))),
          ")",
          optional(seq(":", $.type)),
        ),
      ),

    type_fun_branch_1: $ =>
      prec.right(
        seq(
          "|",
          optional(seq(optional("mut"), $.type, repeat(seq(",", optional("mut"), $.type)))),
          "|",
          optional(seq(":", $.type)),
        ),
      ),

    type_signed: $ => seq("signed", "<", $.lit_num_dec, ">"),

    type_string: $ => "string",

    type_trans: $ => choice($.type_trans_fun, $.type_trans_rel),

    type_trans_fun: $ => seq("function", "(", optional(seq($.arg, repeat(seq(",", $.arg)))), ")", ":", $.type_atom),

    type_trans_rel: $ => seq("relation", "[", $.type_atom, "]"),

    type_tuple: $ => seq("(", optional(seq($.type_atom, repeat(seq(",", $.type_atom)), optional(","))), ")"),

    type_union: $ => prec.right(seq(repeat(seq($.cons, "|")), $.cons)),

    type_user: $ => prec.right(seq($.name_type, optional(seq("<", $.type, repeat(seq(",", $.type)), ">")))),

    type_var: $ => seq("'", alias(token.immediate(Pattern.ident_upper), $.misc_pat0)),

    typedef: $ => choice($.typedef_normal, $.typedef_extern),

    typedef_extern: $ =>
      seq(
        "extern",
        "type",
        field("identifier", $.name_type),
        optional(seq("<", $.name_var_type, repeat(seq(",", $.name_var_type)), ">")),
      ),

    typedef_normal: $ =>
      seq(
        "typedef",
        field("identifier", $.name_type),
        optional(seq("<", $.name_var_type, repeat(seq(",", $.name_var_type)), ">")),
        "=",
        $.type,
      ),

    word: $ => token(seq(/[a-z_]/, repeat(/[a-zA-Z0-9_]/))),
  },
});
