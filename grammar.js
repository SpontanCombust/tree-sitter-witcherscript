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

  rules: {
    module: $ => repeat(
      $.func_stmt
    ),


    // STATEMENTS ===================================================

    member_var_decl: $ => seq(
      optional($.import),
      $.access_modifier,
      repeat($.member_var_specifier),
      'var',
      field('names', comma1($.ident)),
      $.type_annot,
      ';'
    ),

    member_var_specifier: $ => choice(
      'const',
      'editable',
      'inlined',
      'saved'
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
      $.scope_stmt,
      $.expr_stmt
    ),

    var_decl_stmt: $ => seq(
      'var',
      field('names', comma1($.ident)),
      $.type_annot,
      optional(seq(
        '=',
        $._expr
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
      repeat($.switch_case),
      optional($.switch_default),
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
      'return', optional($._expr), ';'
    ),

    delete_stmt: $ => seq(
      'delete', $._expr, ';'
    ),

    scope_stmt: $ => seq(
      '{', repeat($.func_stmt), '}'
    ),

    expr_stmt: $ => seq(
      // optional to also handle trailing semicolons
      optional($._expr), ';'
    ),

    
    type_annot: $ => seq(
      ':',
      field('type', $.ident),
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

    import: $ => 'import',


  
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

    ident: $ => token(
      /[_a-zA-Z][_a-zA-Z0-9]*/
    ),


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