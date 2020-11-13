/// <reference types="tree-sitter-cli/dsl" />

const Pattern = {
  decimal: /[0-9]+/,
};

module.exports = grammar({
  name: "ddlog_dl",

  conflicts: $ => [[$.term_cond], [$.term_return]],

  word: $ => $._ident_lower,

  rules: {
    ROOT: $ => repeat($.annotated_item),

    annotated_item: $ => seq(optional($.attributes), $.item),

    arg: $ => seq($.name_arg, ":", $.type_spec_simple),

    _atom: $ => choice($.atom_named, $.atom_positional, $.atom_elem),

    atom_elem: $ => seq($.name_rel, "[", $._expr, "]"),

    atom_positional: $ =>
      seq(optional(seq($.name_var_term, "in")), $.name_rel, "(", $._expr, repeat(seq(",", $._expr)), ")"),

    atom_named: $ =>
      seq(
        optional(seq($.name_var_term, "in")),
        $.name_rel,
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

    _constructor: $ => choice($.constructor_positional, $.constructor_named),

    constructor_positional: $ => seq(optional($.attributes), $.name_cons),

    constructor_named: $ => seq(optional($.attributes), $.name_cons, "{", $.field, repeat(seq(",", $.field)), "}"),

    _expr: $ =>
      choice(
        $._term,
        // $.expr_bit_slice,
        // $.expr_function_call,
        // $.expr_function_call_dot,
        // $.expr_struct_field,
        // $.expr_type_annotation,
      ),

    expr_bit_slice: $ => seq($._expr, "[", Pattern.decimal, ",", Pattern.decimal, "]"),

    expr_function_call: $ => seq($._expr, "(", optional(seq($._expr, repeat(seq(",", $._expr)))), ")"),

    expr_function_call_dot: $ =>
      seq($._expr, ".", $.name_func, "(", optional(seq($._expr, repeat(seq(",", $._expr)))), ")"),

    expr_struct_field: $ => seq($._expr, ".", $._ident),

    expr_type_annotation: $ => seq($._expr, ":", $.type_spec_simple),

    field: $ => seq(optional($.attributes), $.name_field, ":", $.type_spec_simple),

    _ident: $ => choice($._ident_lower, $._ident_upper),

    _ident_lower: $ => token(seq(/[a-z_]/, repeat(/[a-zA-Z0-9_]/))),

    _ident_lower_scoped: $ => seq(optional($.ident_scope), $._ident_lower),

    ident_scope: $ => prec.right(repeat1(seq($._ident, "::"))),

    _ident_upper: $ => token(seq(/[A-Z]/, repeat(/[a-zA-Z0-9_]/))),

    _ident_upper_scoped: $ => seq(optional($.ident_scope), $._ident_upper),

    item: $ => choice($.item_import, $._item_function, $._item_relation, $.item_rule, $._item_typedef),

    item_import: $ => seq("import", $.module_path, optional(seq("as", $.module_alias))),

    _item_function: $ => choice($.item_function_normal, $.item_function_extern),

    item_function_extern: $ =>
      seq(
        "extern",
        "function",
        $.name_func,
        "(",
        optional(seq($.arg, repeat(seq(",", $.arg)))),
        ")",
        ":",
        $.type_spec_simple,
      ),

    item_function_normal: $ =>
      seq(
        "function",
        $.name_func,
        "(",
        optional(seq($.arg, repeat(seq(",", $.arg)))),
        ")",
        ":",
        $.type_spec_simple,
        "{",
        $._expr,
        "}",
      ),

    _item_relation: $ => choice($.item_relation_args, $.item_relation_elem),

    item_relation_args: $ =>
      seq(
        optional(choice("input", "output")),
        "relation",
        $.name_rel,
        "(",
        $.arg,
        repeat(seq(",", $.arg)),
        ")",
        optional($.primary_key),
      ),

    item_relation_elem: $ =>
      seq(
        optional(choice("input", "output")),
        "relation",
        $.name_rel,
        "[",
        $.type_spec_simple,
        "]",
        optional($.primary_key),
      ),

    item_rule: $ => seq($._atom, repeat(seq(",", $._atom)), ":-", $._rhs_clause, repeat(seq(",", $._rhs_clause))),

    _item_typedef: $ => choice($.item_typedef_normal, $.item_typedef_external),

    item_typedef_external: $ =>
      seq(
        "extern",
        "type",
        $.name_var_type,
        optional(seq("<", $.name_var_type, repeat(seq(",", $.name_var_type)), ">")),
      ),

    item_typedef_normal: $ =>
      seq(
        "typedef",
        $.name_var_type,
        optional(seq("<", $.name_var_type, repeat(seq(",", $.name_var_type)), ">")),
        "=",
        $._type_spec,
      ),

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

    primary_key: $ => seq("primary", "key", "(", $.name_var_term, ")", $._expr),

    _rhs_clause: $ =>
      choice(
        $.rhs_clause_assign,
        $.rhs_clause_atom,
        $.rhs_clause_atom_neg,
        $.rhs_clause_expr,
        $.rhs_clause_flat_map,
        $.rhs_clause_grouping,
      ),

    rhs_clause_assign: $ => seq($._expr, "=", $._expr),

    rhs_clause_atom: $ => $._atom,

    rhs_clause_atom_neg: $ => seq("not", $._atom),

    rhs_clause_expr: $ => $._expr,

    rhs_clause_flat_map: $ => prec(1, seq("var", $.name_var_term, "=", "FlatMap", "(", $._expr, ")")),

    rhs_clause_grouping: $ => seq("var", $.name_var_term, "=", $._expr, ".", "group_by", "(", $._expr, ")"),

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

    _type_spec: $ =>
      choice(
        $.type_spec_alias,
        $.type_spec_bigint,
        $.type_spec_bitvector,
        $.type_spec_bool,
        $.type_spec_double,
        $.type_spec_float,
        $.type_spec_function,
        $.type_spec_integer,
        $.type_spec_string,
        $.type_spec_tuple,
        $.type_spec_union,
        $.type_spec_var,
      ),

    type_spec_alias: $ => seq($.name_var_type, optional(seq("<", $._type_spec, repeat(seq(",", $._type_spec)), ">"))),

    type_spec_bigint: $ => "bigint",

    type_spec_bitvector: $ => seq("bit", "<", Pattern.decimal, ">"),

    type_spec_bool: $ => "bool",

    type_spec_double: $ => "double",

    type_spec_float: $ => "float",

    type_spec_function: $ =>
      choice(
        seq(
          "function",
          "(",
          optional(seq(optional("mut"), $._type_spec, repeat(seq(",", optional("mut"), $._type_spec)))),
          ")",
          optional(seq(":", $._type_spec)),
        ),
        prec.left(
          seq(
            "|",
            optional(seq(optional("mut"), $._type_spec, repeat(seq(",", optional("mut"), $._type_spec)))),
            "|",
            optional(seq(":", $._type_spec)),
          ),
        ),
      ),

    type_spec_integer: $ => seq("signed", "<", Pattern.decimal, ">"),

    type_spec_simple: $ => "type_spec_simple",

    type_spec_string: $ => "string",

    type_spec_tuple: $ => seq("(", repeat($.type_spec_simple), ")"),

    type_spec_union: $ => prec.right(seq(repeat(seq($._constructor, "|")), $._constructor)),

    type_spec_var: $ => "var",
  },
});
