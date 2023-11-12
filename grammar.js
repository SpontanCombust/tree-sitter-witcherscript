module.exports = grammar({
  name: 'witcherscript',
  
  extras: $ => [
    /\s|\\\r?\n/,
    $.comment,
  ],

  rules: {
    module: $ => repeat(
      $._literal
    ),


    // LITERALS =====================================================

    _literal: $ => choice(
      $.literal_null,
      $.literal_float,
      $.literal_int,
      $.literal_bool,
      $.literal_string,
      $.literal_name
    ),

    literal_null: $ => token(
      'NULL'
    ),

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

    literal_bool: $ => token(choice(
      'true',
      'false'
    )),

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

    // WHITESPACE ===================================================

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
    
function commaSepTrail(rule) {
  return seq(
    commaSep(rule),
    optional(',')
  )
}