/**
 * @file WitcherScript grammar for tree-sitter
 * @author Przemysław Cedro
 * @license MIT
 */


// higher number == greater precedence
// based on C++'s operator precedence
// https://en.cppreference.com/w/cpp/language/operator_precedence
const PREC = {
  DEFAULT: 0,
  ASSIGN: 1,
  TERNARY: 2,
  OR: 3,
  AND: 4,
  BIT_OR: 5,
  BIT_XOR: 6,
  BIT_AND: 7,
  EQ: 8,
  RELATION: 9,
  SUM: 10,
  DIFF: 10,
  MULT: 11,
  DIV: 11,
  MODULO: 11,
  NEW: 12,
  UNARY: 12,
  CAST: 12,
  MEMBER: 13,
  CALL: 13,
  ARRAY: 13,
  ARRAY_INIT: 14,
  FUNC_BLOCK: 15
};

module.exports = grammar({
  name: 'witcherscript',
  
  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.ident,

  externals: $ => [
    $.ident,
    $.annotation_ident,

    'NULL',
    'abstract',
    'autobind',
    'break',
    'case',
    'class',
    'cleanup',
    'const',
    'continue', 
    'default',
    'defaults',
    'delete',
    'do',
    'editable',
    'else',
    'entry',
    'enum',
    'event',
    'exec',
    'extends',
    'false',
    'final',
    'for',
    'function',
    'hint',
    'if',
    'in',
    'inlined',
    'import',
    'latent',
    'new',
    'optional',
    'out',
    'parent',
    'private',
    'protected',
    'public',
    'quest',
    'return',
    'reward',
    'saved',
    'single',
    'state',
    'statemachine',
    'storyscene',
    'struct',
    'super',
    'switch',
    'this',
    'timer',
    'true',
    'var',
    'virtual_parent',
    'while'
  ],

  conflicts: $ => [
    [$._expr, $._paren_ident], // nested expr
  ],

  rules: {

    // TOP LEVEL RULE ===============================================
    
    script: $ => repeat(choice(
      $.func_decl,
      $.class_decl,
      $.state_decl,
      $.struct_decl,
      $.enum_decl,
      $.member_var_decl, // needed for @addField annotation
      $.nop
    )),
    
    
    // STATEMENTS ===================================================

    
    // ENUM DECLARATION ====================

    enum_decl: $ => seq(
      $._enum_decl_intro,
      field('definition', $.enum_def)
    ),

    // TS seems to be doing error recovery best when it can work within shorter sequences.
    // Specifically at the end of those sequences, at the last or second-last terminal.
    // Making hidden rules as a part of a bigger rule can then improve it.
    // So when possible chop rules up into smaller bits that are 2-3 tokens long.
    // Grammar file will look a little uglier, but it will be for the greater benefit of the parser.
    // This can be done reliably only when a rule contains distinguishable keywords/punctuation.
    _enum_decl_intro: $ => seq(
      'enum', field('name', $.ident),
    ),

    enum_def: $ => block_delim(
      $.enum_decl_variant, ','
    ),

    enum_decl_variant: $ => seq(
      field('name', $.ident),
      // Error recovery with hidden rules is not so good when the rule is optional.
      optional($._enum_decl_variant_assign),
    ),

    _enum_decl_variant_assign: $ => seq(
      '=', 
      field('value', choice(
        $.literal_int,
        $.literal_hex
      ))
    ),

  
    // STRUCT DECLARATION ==================

    struct_decl: $ => seq(
      field('specifiers', repeat($.specifier)),
      $._struct_decl_intro,
      field('definition', $.struct_def)
    ),

    _struct_decl_intro: $ => seq(
      'struct', field('name', $.ident),
    ),

    struct_def: $ => block(
      $._struct_prop
    ),

    _struct_prop: $ => choice(
      $.member_var_decl,
      $.member_default_val,
      $.member_default_val_block,
      $.member_hint,
      $.nop
    ),


    // STATE DECLARATION ===================

    state_decl: $ => seq(
      field('specifiers', repeat($.specifier)),
      $._state_decl_intro,
      $._state_decl_parent,
      optional($._class_base),
      field('definition', $.class_def)
    ),

    _state_decl_intro: $ => seq(
      'state', field('name', $.ident),
    ),

    _state_decl_parent: $ => seq(
      'in', field('parent', $.ident),
    ),


    // CLASS DECLARATION ===================

    class_decl: $ => seq(
      field('specifiers', repeat($.specifier)),
      $._class_decl_intro,
      optional($._class_base),
      field('definition', $.class_def)
    ),

    _class_decl_intro: $ => seq(
      'class', field('name', $.ident),
    ),

    class_def: $ => block(
      $._class_prop
    ),

    _class_base: $ => seq(
      'extends', field('base', $.ident)
    ),


    // CLASS ===============================

    _class_prop: $ => choice(
      $.member_var_decl,
      $.member_default_val,
      $.member_default_val_block,
      $.member_hint,
      $.autobind_decl,
      $.func_decl,
      $.event_decl,
      $.nop
    ),

    autobind_decl: $ => seq(
      field('specifiers', repeat($.specifier)),
      $._autobind_decl_intro,
      ':',
      field('autobind_type', $.type_annot),
      $._autobind_decl_assign,
      ';'
    ),

    _autobind_decl_intro: $ => seq(
      'autobind', field('name', $.ident),
    ),

    _autobind_decl_assign: $ => seq(
      '=',
      field('value', $._autobind_decl_value)
    ),

    _autobind_decl_value: $ => choice(
      $.autobind_single,
      $.literal_string
    ),

    autobind_single: $ => 'single',

    member_default_val_block: $ => seq(
      'defaults',
      block($.member_default_val_block_assign)
    ),

    member_default_val_block_assign: $ => seq(
      field('member', $.ident),
      '=',
      field('value', $._expr),
      ';'
    ),

    member_default_val: $ => seq(
      $._member_default_val_intro,
      '=',
      field('value', $._expr),
      ';'
    ),

    _member_default_val_intro: $ => seq(
      'default', field('member', $.ident),
    ),

    member_hint: $ => seq(
      $._member_hint_intro,
      $._member_hint_assign,
      ';'
    ),

    _member_hint_intro: $ => seq(
      'hint', field('member', $.ident),
    ),

    _member_hint_assign: $ => seq(
      '=', field('value', $.literal_string)
    ),

    member_var_decl: $ => seq(
      field('annotation', optional($.annotation)),
      field('specifiers', repeat($.specifier)),
      $._var_decl_intro,
      ':',
      field('var_type', $.type_annot),
      ';'
    ),


    // FUNCTION DECLARATION ================

    event_decl: $ => seq(
      $._event_decl_intro,
      field('params', $.func_params),
      optional(seq(
        ':',
        field('return_type', $.type_annot)
      )),
      field('definition', $._func_definition)
    ),

    _event_decl_intro: $ => seq(
      'event', field('name', $.ident),
    ),

    func_decl: $ => seq(
      field('annotation', optional($.annotation)),
      field('specifiers', repeat($.specifier)),
      field('flavour', optional($.func_flavour)),
      $._func_decl_intro,
      field('params', $.func_params),
      optional(seq(
        ':',
        field('return_type', $.type_annot)
      )),
      field('definition', $._func_definition)
    ),

    _func_decl_intro: $ => seq(
      'function', field('name', $.ident),
    ),

    
    _func_definition: $ => choice(
      $.func_block,
      $.nop
    ),

    func_params: $ => seq(
      '(', comma($.func_param_group), ')'
    ), 

    func_param_group: $ => seq(
      field('specifiers', repeat($.specifier)),
      field('names', comma1($.ident)),
      ':',
      field('param_type', $.type_annot),
    ),


    annotation: $ => seq(
      field('name', $.annotation_ident),
      optional($._annotation_arg)
    ),

    _annotation_arg: $ => seq('(', field('arg', $.ident), ')'),

    func_flavour: $ => choice(
      'cleanup',
      'entry',
      'exec',
      'quest',
      'reward',
      'storyscene',
      'timer',
    ),

    specifier: $ => choice(
      'abstract',
      'const',
      'editable',
      'final',
      'import',
      'inlined',
      'latent',
      'optional',
      'out',
      'private',
      'protected',
      'public',
      'saved',
      'statemachine'
    ),


    // FUNCTION ============================

    _func_stmt: $ => choice(
      $.local_var_decl_stmt,
      $.for_stmt,
      $.while_stmt,
      $.do_while_stmt,
      $.if_stmt,
      $.switch_stmt,
      $.break_stmt,
      $.continue_stmt,
      $.return_stmt,
      $.delete_stmt,
      $.func_block,
      $.expr_stmt,
      $.nop
    ),

    local_var_decl_stmt: $ => seq(
      $._var_decl_intro,
      ':',
      field('var_type', $.type_annot),
      optional(seq(
        '=',
        field('init_value', $._expr)
      )),
      ';'
    ),

    _var_decl_intro: $ => seq(
      'var', field('names', comma1($.ident))
    ),


    for_stmt: $ => seq(
      'for', '(',
      field('init', optional($._expr)), ';',
      field('cond', optional($._expr)), ';',
      field('iter', optional($._expr)),
      ')',
      field('body', $._func_stmt)
    ),

    while_stmt: $ => seq(
      'while', '(', field('cond', $._expr), ')',
      field('body', $._func_stmt)
    ),

    do_while_stmt: $ => seq(
      'do', field('body', $._func_stmt),
      'while', '(', field('cond', $._expr), ')'
    ),


    if_stmt: $ => prec.right(seq(
      'if', '(', field('cond', $._expr), ')',
      field('body', $._func_stmt),
      optional(seq(
        'else', field('else', $._func_stmt)
      ))
    )),

    switch_stmt: $ => seq(
      'switch', '(', field('cond', $._expr), ')',
      field('body', $.switch_block),
    ),

    switch_block: $ => seq(
      '{',
      repeat($._switch_section),
      '}'
    ),

    _switch_section: $ =>choice(
      $.switch_case_label,
      $.switch_default_label,
      $._func_stmt
    ),

    switch_case_label: $ => seq(
      'case', field('value', $._expr), ':'
    ),

    switch_default_label: $ => seq(
      'default', ':',
    ),

    
    break_stmt: $ => seq(
      'break', ';'
    ),

    continue_stmt: $ => seq(
      'continue', ';'
    ),

    return_stmt: $ => seq(
      'return', optional($._expr), ';'
    ),

    delete_stmt: $ => seq(
      'delete', $._expr, ';'
    ),

    func_block: $ => prec(PREC.FUNC_BLOCK, block(
      $._func_stmt
    )),

    expr_stmt: $ => seq(
      $._expr, ';'
    ),

    
    nop: $ => ';',

    type_annot: $ => seq(
      field('type_name', $.ident),
      optional(seq(
        '<',
        field('type_arg', $.type_annot),
        '>'
      ))
    ),


  
    // EXPRESSIONS ==================================================

    _expr: $ => choice(
      $.array_init_expr,
      $.assign_op_expr,
      $.ternary_cond_expr,
      $.binary_op_expr,
      $.new_expr,
      $.unary_op_expr,
      $.cast_expr,
      $.member_access_expr,
      $.func_call_expr,
      $.array_expr,
      $.nested_expr,
      $.this_expr,
      $.super_expr,
      $.parent_expr,
      $.virtual_parent_expr,
      $.ident,
      $._literal
    ),


    array_init_expr: $ => prec(PREC.ARRAY_INIT, block_delim($._expr, ',')),

    assign_op_expr: $ => prec.left(PREC.ASSIGN, seq(
      field('left', $._expr),
      field('op', choice(
        $.assign_op_direct,
        $.assign_op_sum,
        $.assign_op_diff,
        $.assign_op_mult,
        $.assign_op_div,
        $.assign_op_bitand,
        $.assign_op_bitor
      )),
      field('right', $._expr)
    )),

    assign_op_direct: $ => '=',
    assign_op_sum: $ => '+=',
    assign_op_diff: $ => '-=',
    assign_op_mult: $ => '*=',
    assign_op_div: $ => '/=',
    assign_op_bitand: $ => '&=',
    assign_op_bitor: $ => '|=',


    ternary_cond_expr: $ => prec.right(PREC.TERNARY, seq(
      field('cond', $._expr),
      '?',
      field('conseq', $._expr),
      ':',
      field('alt', $._expr)
    )),


    binary_op_expr: $ => choice(
      ...[
        [$.binary_op_or, PREC.OR],
        [$.binary_op_and, PREC.AND],
        [$.binary_op_bitor, PREC.BIT_OR],
        [$.binary_op_bitand, PREC.BIT_AND],
        [$.binary_op_bitxor, PREC.BIT_XOR],
        [$.binary_op_eq, PREC.EQ],
        [$.binary_op_neq, PREC.EQ],
        [$.binary_op_gt, PREC.RELATION],
        [$.binary_op_ge, PREC.RELATION],
        [$.binary_op_lt, PREC.RELATION],
        [$.binary_op_le, PREC.RELATION],
        [$.binary_op_diff, PREC.DIFF],
        [$.binary_op_sum, PREC.SUM],
        [$.binary_op_mod, PREC.MODULO],
        [$.binary_op_div, PREC.DIV],
        [$.binary_op_mult, PREC.MULT],
      ].map(([op, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expr),
          field('op', op),
          field('right', $._expr)
        ))
      )
    ),

    // can't bring those under a single rule, because they have different precedense
    binary_op_or: $ => '||',
    binary_op_and: $ => '&&',
    binary_op_bitor: $ => '|',
    binary_op_bitand: $ => '&',
    binary_op_bitxor: $ => '^',
    binary_op_eq: $ => '==',
    binary_op_neq: $ => '!=',
    binary_op_gt: $ => '>',
    binary_op_ge: $ => '>=',
    binary_op_lt: $ => '<',
    binary_op_le: $ => '<=',
    binary_op_diff: $ => '-',
    binary_op_sum: $ => '+',
    binary_op_mod: $ => '%',
    binary_op_div: $ => '/',
    binary_op_mult: $ => '*',
    

    new_expr: $ => prec.right(PREC.NEW, seq(
      $._new_expr_intro,
      optional($._new_expr_lifetime_obj)
    )),

    _new_expr_intro: $ => seq(
      'new', field('class', $.ident),
    ),

    _new_expr_lifetime_obj: $ => seq(
      'in', field('lifetime_obj', $._expr)
    ),

    unary_op_expr: $ => prec.right(PREC.UNARY, seq(
      field('op', choice(
        $.unary_op_neg,
        $.unary_op_not,
        $.unary_op_bitnot,
        $.unary_op_plus,
      )),
      field('right', $._expr)
    )),

    unary_op_neg: $ => '-',
    unary_op_not: $ => '!',
    unary_op_bitnot: $ => '~',
    unary_op_plus: $ => '+',


    cast_expr: $ => prec.right(PREC.CAST, seq(
      field('type', $._paren_ident),
      field('value', $._expr),
    )),


    member_access_expr: $ => prec.left(PREC.MEMBER, seq(
      field('accessor', $._expr),
      '.',
      field('member', $.ident)
    )),

    func_call_expr: $ => prec.left(PREC.CALL, seq(
      field('func', $._expr),
      '(',
      field('args', optional($.func_call_args)),
      ')'
    )),

    func_call_args: $ => choice(
      $._expr,
      comma2(optional($._expr))
    ),

    array_expr: $ => prec.left(PREC.ARRAY, seq(
      field('accessor', $._expr),
      '[',
      field('index', $._expr),
      ']'
    )),


    nested_expr: $ => choice(
      seq('(', $._expr, ')'),
      $._paren_ident
    ),

    _paren_ident: $ => seq(
      '(', $.ident, ')'
    ),



    // TOKENS =======================================================

    this_expr: $ => 'this',

    super_expr: $ => 'super',

    parent_expr: $ => 'parent',

    virtual_parent_expr: $ => 'virtual_parent',


    _literal: $ => choice(
      $.literal_null,
      $.literal_float,
      $.literal_int,
      $.literal_hex,
      $.literal_bool,
      $.literal_string,
      $.literal_name
    ),

    literal_null: $ => 'NULL',

    literal_float: $ => {
      const digit = /[0-9]/
      return token(seq(
        optional(choice('+', '-')),
        choice(
          // normal looking float literal
          seq(
            repeat1(digit),
            '.',
            // repeat() and not repeat1(), because forms like "0." are allowed
            repeat(digit),
          ),
          // Goofy ass float without the integer part
          seq(
            '.',
            repeat1(digit),
          )
        ),
        // This optional suffix is completely pointless as there is only one floating point type in the language.
        optional('f')
      ))
    },

    literal_int: $ => token(seq(
      optional(choice('+', '-')),
      repeat1(/[0-9]/)
    )),

    literal_hex: $ => token(
      /0[xX][0-9a-fA-F]+/,
    ),

    literal_bool: $ => choice(
      'true',
      'false'
    ),

    literal_string: $ => token(seq(
      '"',
      repeat(choice(
        token.immediate(prec(1, /[^"]+/)),
        '\\"', // WS seems to handle only espaced quotes as the majority of formatting is done through HTML tags (e.g. <br>) in Flash
      )),
      '"',
    )),

    literal_name: $ => token(seq(
      '\'',
      repeat(choice(
        token.immediate(prec(1, /[^']+/)),
        '\\\'',
      )),
      '\'',
    )),


    comment: $ => token(choice(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  },     
});


function delim1(rule, del) {
  return seq(
    rule,
    repeat(seq(
      del,
      rule
    ))
  )
}

function delim2(rule, del) {
  return seq(
    rule,
    repeat1(seq(
      del,
      rule
    ))
  )
}

function delim(rule, del) {
  return optional(delim1(rule, del))
}

function delim_trail(rule, del) {
  return seq(
    delim(rule, del),
    optional(del)
  )
}


function comma1(rule) {
  return delim1(rule, ',')
}

function comma2(rule) {
  return delim2(rule, ',')
}
    
function comma(rule) {
  return optional(comma1(rule))
}
    
function comma_trail(rule) {
  return delim_trail(rule, del)
}


function block(rule) {
  return seq(
    '{', repeat(rule), '}'
  )
}

function block_delim(rule, del) {
  return seq(
    '{', delim_trail(rule, del), '}'
  )
}