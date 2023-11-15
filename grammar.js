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

  rules: {
    module: $ => repeat(choice(
      $.func_decl_stmt,
      $.class_decl_stmt,
      $.state_decl_stmt,
      $.struct_decl_stmt,
      $.enum_decl_stmt,
      ';'
    )),


    // STATEMENTS ===================================================

    
    // ENUM DECLARATION ====================

    enum_decl_stmt: $ => seq(
      'enum', field('name', $.ident),
      field('definition', seq(
        '{', field('values', comma_trail($.enum_decl_value)), '}'
      ))
    ),

    enum_decl_value: $ => seq(
      field('name', $.ident),
      optional(seq(
        '=',
        field('value', $.literal_int)
      )),
    ),

  
    // STRUCT DECLARATION ==================

    struct_decl_stmt: $ => seq(
      field('import', optional($.import_spec)),
      'struct', field('name', $.ident),
      field('definition', block($.struct_stmt))
    ),

    struct_stmt: $ => choice(
      $.member_var_decl_stmt,
      $.member_default_val_stmt,
      $.member_hint_stmt,
      ';'
    ),


    // STATE DECLARATION ===================

    state_decl_stmt: $ => seq(
      field('import', optional($.import_spec)),
      field('specifiers', optional($.state_specifier)),
      'state', field('name', $.ident),
      'in', field('parent', $.ident),
      field('base', optional($.class_base)),
      field('definition', block($.class_stmt))
    ),

    state_specifier: $ => choice(
      'abstract'
    ),


    // CLASS DECLARATION ===================

    class_decl_stmt: $ => seq(
      field('import', optional($.import_spec)),
      field('specifiers', repeat($.class_specifier)),
      'class', field('name', $.ident),
      field('base', optional($.class_base)),
      field('definition', block($.class_stmt))
    ),

    class_base: $ => seq(
      'extends', field('base_name', $.ident)
    ),

    class_specifier: $ => choice(
      'abstract',
      'statemachine'
    ),


    // CLASS ===============================

    class_stmt: $ => choice(
      $.member_var_decl_stmt,
      $.member_default_val_stmt,
      $.member_hint_stmt,
      $.class_autobind_stmt,
      $.func_decl_stmt,
      ';'
    ),

    class_autobind_stmt: $ => seq(
      field('access_modifier', optional($.access_modifier)),
      field('optional', optional($.optional_spec)),
      'autobind',
      field('name', $.ident),
      field('autobind_type', $.type_annot),
      '=',
      field('value', choice(
        'single',
        $.literal_string
      )),
      ';'
    ),

    member_default_val_stmt: $ => seq(
      'default',
      field('member', $.ident),
      '=',
      field('value', $._expr),
      ';'
    ),

    member_hint_stmt: $ => seq(
      'hint',
      field('member', $.ident),
      '=',
      field('value', $.literal_string),
      ';'
    ),

    member_var_decl_stmt: $ => seq(
      field('import', optional($.import_spec)),
      field('access_modifier', optional($.access_modifier)),
      field('specifiers', repeat($.member_var_specifier)),
      'var',
      field('names', comma1($.ident)),
      field('var_type', $.type_annot),
      ';'
    ),

    member_var_specifier: $ => choice(
      'const',
      'editable',
      'inlined',
      'saved'
    ),


    // FUNCTION DECLARATION ================

    func_decl_stmt: $ => seq(
      field('import', optional($.import_spec)),
      field('access_modifier', optional($.access_modifier)),
      field('specifiers', repeat($.func_specifier)),
      field('flavour', $._func_flavour),
      field('name', $.ident),
      '(', comma($.func_param_group), ')',
      field('return_type', optional($.type_annot)),
      choice(
        ';',
        field('definition', $.func_block)
      )
    ),

    func_param_group: $ => seq(
      field('optional', optional($.optional_spec)),
      field('out', optional($.out_spec)),
      field('names', comma1($.ident)),
      field('param_type', $.type_annot),
    ),

    _func_flavour: $ => choice(
      $.func_flavour_function,
      $.func_flavour_event,
      $.func_flavour_entry,
      $.func_flavour_exec,
      $.func_flavour_quest,
      $.func_flavour_timer,
      $.func_flavour_storyscene
    ),

    func_flavour_function: $ => 'function',
    func_flavour_event: $ => 'event',
    func_flavour_entry: $ => seq('entry', 'function'),
    func_flavour_exec: $ => seq('exec', 'function'),
    func_flavour_quest: $ => seq('quest', 'function'),
    func_flavour_timer: $ => seq('timer', 'function'),
    func_flavour_storyscene: $ => seq('storyscene', 'function'),

    func_specifier: $ => choice(
      'latent',
      'final'
    ),

    // FUNCTION ============================

    func_stmt: $ => choice(
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
      $.expr_stmt
    ),

    var_decl_stmt: $ => seq(
      'var',
      field('names', comma1($.ident)),
      field('var_type', $.type_annot),
      optional(seq(
        '=',
        field('init_value', $._expr)
      )),
      ';'
    ),

    for_stmt: $ => seq(
      'for', '(',
      field('initialier', optional($._expr)), ';',
      field('condition', optional($._expr)), ';',
      field('iteration', optional($._expr)),
      ')',
      field('body', $.func_stmt)
    ),

    while_stmt: $ => seq(
      'while', '(', field('condition', $._expr), ')',
      field('body', $.func_stmt)
    ),

    do_while_stmt: $ => seq(
      'do', field('body', $.func_stmt),
      'while', '(', field('condition', $._expr), ')', ';'
    ),

    if_stmt: $ => prec.right(seq(
      'if', '(', field('condition', $._expr), ')',
      field('body', $.func_stmt),
      optional(seq(
        'else', field('else', $.func_stmt)
      ))
    )),

    switch_stmt: $ => seq(
      'switch', '(', field('matched_expr', $._expr), ')',
      '{',
      field('case', repeat($.switch_case)),
      field('default', optional($.switch_default)),
      '}'
    ),

    switch_case: $ => seq(
      'case', field('value', $._expr), ':',
      field('body', repeat($.func_stmt))
    ),

    switch_default: $ => seq(
      'default', ':',
      field('body', repeat1($.func_stmt))
    ),

    break_stmt: $ => seq(
      'break', ';'
    ),

    continue_stmt: $ => seq(
      'continue', ';'
    ),

    return_stmt: $ => seq(
      'return', field('expr', optional($._expr)), ';'
    ),

    delete_stmt: $ => seq(
      'delete', field('expr', $._expr), ';'
    ),

    func_block: $ => block(choice(
      $.func_stmt, 
      ';'
    )),

    expr_stmt: $ => seq(
      field('expr', $._expr), ';'
    ),

    
    type_annot: $ => seq(
      ':',
      field('type_name', $.ident),
      optional(seq(
        '<',
        field('generic_arg', $.ident),
        '>'
      ))
    ),

    access_modifier: $ => choice(
      "private",
      "protected",
      "public"
    ),

    import_spec: $ => 'import',
    optional_spec: $ => 'optional',
    out_spec: $ => 'out',


  
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
      $.literal
    ),


    assign_op_expr: $ => choice(
      ...['=', '+=', '-=', '*=', '/=', '%=']
        .map((op) =>
          prec.left(PREC.ASSIGN, seq(
            field('left', $._assign_op_left),
            field('op', op),
            field('right', $._expr)
          ))
      )
    ),

    _assign_op_left: $ => choice(
      $.ident,
      $.func_call_expr,
      $.member_field_expr,
      $.member_func_call_expr,
      $.array_expr,
      $.nested_expr
    ),

    ternary_cond_expr: $ => prec.right(PREC.TERNARY, seq(
      field('cond', $._expr),
      '?',
      field('expr_if_true', $._expr),
      ':',
      field('expr_if_false', $._expr)
    )),


    binary_op_expr: $ => choice(
      ...[
        ['||', PREC.OR],
        ['&&', PREC.AND],
        ['|', PREC.BIT_OR],
        ['&', PREC.BIT_AND],
        ['!=', PREC.EQ],
        ['==', PREC.EQ],
        ['>=', PREC.RELATION],
        ['>', PREC.RELATION],
        ['<=', PREC.RELATION],
        ['<', PREC.RELATION],
        ['-', PREC.DIFF],
        ['+', PREC.SUM],
        ['%', PREC.MODULO],
        ['/', PREC.DIV],
        ['*', PREC.MULT],
      ].map(([op, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expr),
          field('op', op),
          field('right', $._expr)
        ))
      )
    ),
    

    new_expr: $ => prec.right(PREC.NEW, seq(
      'new',
      field('class', $.ident),
      'in',
      field('lifetime_obj', $._expr)
    )),

    unary_op_expr: $ => prec.right(PREC.UNARY, seq(
      field('op', choice('-', '!', '~', '+')),
      field('expr', $._expr)
    )),

    cast_expr: $ => prec.right(PREC.CAST, seq(
      '(',
      field('type', $.ident),
      ')',
      field('value', $._expr),
    )),


    member_func_call_expr: $ => prec.left(PREC.MEMBER_CALL, seq(
      field('accessor', $._expr),
      '.',
      field('func', $.ident),
      '(',
      field('args', comma_opt($._expr)),
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
      field('args', comma_opt($._expr)),
      ')'
    )),

    array_expr: $ => prec.left(PREC.ARRAY, seq(
      field('accessor', $._expr),
      '[',
      field('index', $._expr),
      ']'
    )),


    nested_expr: $ => seq(
      '(',
      $._expr,
      ')'
    ),



    // TOKENS =======================================================

    this_expr: $ => 'this',

    super_expr: $ => 'super',

    parent_expr: $ => 'parent',

    virtual_parent_expr: $ => 'virtual_parent',


    literal: $ => choice(
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
        repeat1(digit),
        '.',
        repeat(digit),
        choice(
          digit,
          'f'
        )
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
        token.immediate(prec(1, /[^\\"]+/)),
        '\\"', // WS seems to handle only espaced quotes as the majority of formatting is done through HTML tags (e.g. <br>) in Flash
      )),
      '"',
    )),

    literal_name: $ => token(seq(
      '\'',
      repeat(choice(
        token.immediate(prec(1, /[^\\']+/)),
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
    
function comma1(rule) {
  return seq(
    rule,
    repeat(seq(
      ',',
      rule
    ))
  )
}
    
function comma(rule) {
  return optional(comma1(rule))
}

function comma_opt(rule) {
  return optional(comma1(optional(rule)))
}
    
function comma_trail(rule) {
  return seq(
    comma(rule),
    optional(',')
  )
}

function block(rule) {
  return seq(
    '{', field('statements', repeat(rule)), '}'
  )
}