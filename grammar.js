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
  BIT_AND: 6,
  EQ: 7,
  RELATION: 8,
  SUM: 9,
  DIFF: 9,
  MULT: 10,
  DIV: 10,
  MODULO: 10,
  NEW: 11,
  UNARY: 11,
  CAST: 11,
  MEMBER: 12,
  CALL: 12,
  ARRAY: 12,
  MEMBER_CALL: 13,
};

module.exports = grammar({
  name: 'witcherscript',
  
  extras: $ => [
    /\s|\\\r?\n/,
    $.comment,
  ],

  word: $ => $.ident,

  externals: $ => [
    $.ident,

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
    [$.struct_specifier, $.state_specifier, $.class_specifier, $.global_func_specifier], // import
    [$.state_specifier, $.class_specifier], // abstract
    [$.member_var_specifier, $.member_func_specifier],
    [$.class_autobind_specifier, $.member_var_specifier, $.member_func_specifier] // access_modifier
  ],

  rules: {

    // TOP LEVEL RULE ===============================================
    
    script: $ => repeat(choice(
      $.global_func_decl_stmt,
      $.class_decl_stmt,
      $.state_decl_stmt,
      $.struct_decl_stmt,
      $.enum_decl_stmt,
      $.nop
    )),
    
    
    // STATEMENTS ===================================================

    
    // ENUM DECLARATION ====================

    enum_decl_stmt: $ => seq(
      $._enum_decl_intro,
      field('definition', $.enum_block)
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

    enum_block: $ => block_delim(
      $.enum_decl_value, ','
    ),

    enum_decl_value: $ => seq(
      field('name', $.ident),
      // Error recovery with hidden rules is not so good when the rule is optional.
      optional($._enum_decl_value_assign),
    ),

    _enum_decl_value_assign: $ => seq(
      '=', field('value', $.literal_int)
    ),

  
    // STRUCT DECLARATION ==================

    struct_decl_stmt: $ => seq(
      field('specifiers', repeat($.struct_specifier)),
      $._struct_decl_intro,
      field('definition', $.struct_block)
    ),

    _struct_decl_intro: $ => seq(
      'struct', field('name', $.ident),
    ),

    struct_block: $ => block(
      $._struct_stmt
    ),

    struct_specifier: $ => choice(
      'import'
    ),

    _struct_stmt: $ => choice(
      $.member_var_decl_stmt,
      $.member_default_val_stmt,
      $.member_hint_stmt,
      $.nop
    ),


    // STATE DECLARATION ===================

    state_decl_stmt: $ => seq(
      field('specifiers', repeat($.state_specifier)),
      $._state_decl_intro,
      $._state_decl_parent,
      optional($._class_base),
      field('definition', $.class_block)
    ),

    _state_decl_intro: $ => seq(
      'state', field('name', $.ident),
    ),

    _state_decl_parent: $ => seq(
      'in', field('parent', $.ident),
    ),

    state_specifier: $ => choice(
      'import',
      'abstract'
    ),


    // CLASS DECLARATION ===================

    class_decl_stmt: $ => seq(
      field('specifiers', repeat($.class_specifier)),
      $._class_decl_intro,
      optional($._class_base),
      field('definition', $.class_block)
    ),

    _class_decl_intro: $ => seq(
      'class', field('name', $.ident),
    ),

    class_block: $ => block(
      $._class_stmt
    ),

    _class_base: $ => seq(
      'extends', field('base', $.ident)
    ),

    class_specifier: $ => choice(
      'import',
      'abstract',
      'statemachine'
    ),


    // CLASS ===============================

    _class_stmt: $ => choice(
      $.member_var_decl_stmt,
      $.member_default_val_stmt,
      $.member_hint_stmt,
      $.class_autobind_stmt,
      $.member_func_decl_stmt,
      $.event_decl_stmt,
      $.nop
    ),

    class_autobind_stmt: $ => seq(
      field('specifiers', repeat($.class_autobind_specifier)),
      $._class_autobind_intro,
      ':',
      field('autobind_type', $.type_annot),
      $._class_autobind_assign,
      ';'
    ),

    _class_autobind_intro: $ => seq(
      'autobind', field('name', $.ident),
    ),

    _class_autobind_assign: $ => seq(
      '=',
      field('value', choice(
        'single',
        $.literal_string
      ))
    ),

    class_autobind_specifier: $ => choice(
      $._access_modifier,
      'optional',
    ),

    member_default_val_stmt: $ => seq(
      $._member_default_val_intro,
      '=',
      field('value', $._expr),
      ';'
    ),

    _member_default_val_intro: $ => seq(
      'default', field('member', $.ident),
    ),

    member_hint_stmt: $ => seq(
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

    member_var_decl_stmt: $ => seq(
      field('specifiers', repeat($.member_var_specifier)),
      $._var_decl_intro,
      ':',
      field('var_type', $.type_annot),
      ';'
    ),

    member_var_specifier: $ => choice(
      $._access_modifier,
      'import',
      'const',
      'editable',
      'inlined',
      'saved',
    ),


    // FUNCTION DECLARATION ================

    event_decl_stmt: $ => seq(
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

    member_func_decl_stmt: $ => seq(
      field('specifiers', repeat($.member_func_specifier)),
      field('flavour', optional($.member_func_flavour)),
      $._func_decl_intro,
      field('params', $.func_params),
      optional(seq(
        ':',
        field('return_type', $.type_annot)
      )),
      field('definition', $._func_definition)
    ),

    global_func_decl_stmt: $ => seq(
      field('specifiers', repeat($.global_func_specifier)),
      field('flavour', optional($.global_func_flavour)),
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
      field('specifiers', repeat($.func_param_specifier)),
      field('names', comma1($.ident)),
      ':',
      field('param_type', $.type_annot),
    ),

    func_param_specifier: $ => choice(
      'optional',
      'out'
    ),


    member_func_flavour: $ => choice(
      'entry',
      'cleanup',
      'timer',
    ),

    member_func_specifier: $ => choice(
      $._access_modifier,
      'import',
      'latent',
      'final',
    ),

    _access_modifier: $ => choice(
      "private",
      "protected",
      "public"
    ),


    global_func_flavour: $ => choice(
      'exec',
      'quest',
      'storyscene',
      'reward' // present in the code exactly once, LOL
    ),

    global_func_specifier: $ => choice(
      'import',
      'latent',
    ),


    // FUNCTION ============================

    _func_stmt: $ => choice(
      $.var_decl_stmt,
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

    var_decl_stmt: $ => seq(
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
      'while', '(', field('cond', $._expr), ')', ';'
    ),

    if_stmt: $ => prec.right(seq(
      'if', '(', field('cond', $._expr), ')',
      field('body', $._func_stmt),
      optional(seq(
        'else', field('else', $._func_stmt)
      ))
    )),

    //TODO rework
    switch_stmt: $ => seq(
      'switch', '(', field('matched_expr', $._expr), ')',
      '{',
      field('cases', repeat($.switch_case)),
      field('default', optional($.switch_default)),
      '}'
    ),

    switch_case: $ => seq(
      'case', field('value', $._expr), ':',
      field('body', repeat($._func_stmt))
    ),

    switch_default: $ => seq(
      'default', ':',
      field('body', repeat1($._func_stmt))
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

    func_block: $ => block(
      $._func_stmt
    ),

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
      $.assign_op_expr,
      $.ternary_cond_expr,
      $.binary_op_expr,
      $.new_expr,
      $.unary_op_expr,
      $.cast_expr,
      $.member_func_call_expr,
      $.member_field_expr,
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


    assign_op_expr: $ => prec.left(PREC.ASSIGN, seq(
      field('left', $._expr),
      field('op', choice(
        $.assign_op_direct,
        $.assign_op_sum,
        $.assign_op_diff,
        $.assign_op_mult,
        $.assign_op_div,
        $.assign_op_mod
      )),
      field('right', $._expr)
    )),

    assign_op_direct: $ => '=',
    assign_op_sum: $ => '+=',
    assign_op_diff: $ => '-=',
    assign_op_mult: $ => '*=',
    assign_op_div: $ => '/=',
    assign_op_mod: $ => '%=', 


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
      'in',
      field('lifetime_obj', $._expr)
    )),

    _new_expr_intro: $ => seq(
      'new', field('class', $.ident),
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


    member_func_call_expr: $ => prec.left(PREC.MEMBER_CALL, seq(
      field('accessor', $._expr),
      '.',
      field('func', $.ident),
      '(',
      field('args', optional($.func_call_args)),
      ')'
    )),

    member_field_expr: $ => prec.left(PREC.MEMBER, seq(
      field('accessor', $._expr),
      '.',
      field('member', $.ident)
    )),

    func_call_expr: $ => prec.left(PREC.CALL, seq(
      field('func', $.ident),
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