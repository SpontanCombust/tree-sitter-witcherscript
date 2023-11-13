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
      $.expr
    ),


    // EXPRESSIONS ==================================================

    expr: $ => choice(
      $.assign_op_expr,
      $.ternary_cond_expr,
      $.binary_op_expr,
      $.new_expr,
      $.unary_op_expr,
      $.cast_expr,
      $.member_expr,
      $.call_expr,
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
            field('right', $.expr)
          ))
      )
    ),

    _assign_op_left: $ => choice(
      $.ident,
      $.call_expr,
      $.member_expr,
      $.array_expr,
      $.nested_expr
    ),

    ternary_cond_expr: $ => prec.right(PREC.TERNARY, seq(
      field('cond', $.expr),
      '?',
      field('expr_if_true', $.expr),
      ':',
      field('expr_if_false', $.expr)
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
          field('left', $.expr),
          field('op', op),
          field('right', $.expr)
        ))
      )
    ),
    

    new_expr: $ => prec.right(PREC.NEW, seq(
      'new',
      field('class', $.ident),
      'in',
      field('lifetime_obj', $.expr)
    )),

    unary_op_expr: $ => prec.right(PREC.UNARY, seq(
      field('op', choice('-', '!', '~')),
      field('expr', $.expr)
    )),

    cast_expr: $ => prec.right(PREC.CAST, seq(
      '(',
      field('type', $.ident),
      ')',
      field('value', $.expr),
    )),


    member_expr: $ => prec.left(PREC.MEMBER, seq(
      field('accessor', $.expr),
      '.',
      field('member', $.ident)
    )),

    call_expr: $ => prec.left(PREC.CALL, seq(
      field('func', $.expr),
      '(',
      field('args', commaSepOpt($.expr)),
      ')'
    )),

    array_expr: $ => prec.left(PREC.ARRAY, seq(
      field('accessor', $.expr),
      '[',
      field('index', $.expr),
      ']'
    )),


    nested_expr: $ => seq(
      '(',
      $.expr,
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
    
function commaSep1(rule) {
  return seq(
    rule,
    repeat(seq(
      ',',
      rule
    ))
  )
}
    
function commaSep(rule) {
  return optional(commaSep1(rule))
}

function commaSepOpt(rule) {
  return optional(commaSep1(optional(rule)))
}
    
function commaSepTrail(rule) {
  return seq(
    commaSep(rule),
    optional(',')
  )
}