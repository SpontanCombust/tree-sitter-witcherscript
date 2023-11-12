#include <tree_sitter/parser.h>

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 5
#define LARGE_STATE_COUNT 4
#define SYMBOL_COUNT 11
#define ALIAS_COUNT 0
#define TOKEN_COUNT 8
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 0
#define MAX_ALIAS_SEQUENCE_LENGTH 2
#define PRODUCTION_ID_COUNT 1

enum {
  sym_literal_null = 1,
  sym_literal_float = 2,
  sym_literal_int = 3,
  sym_literal_bool = 4,
  sym_literal_string = 5,
  sym_literal_name = 6,
  sym_comment = 7,
  sym_module = 8,
  sym__literal = 9,
  aux_sym_module_repeat1 = 10,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_literal_null] = "literal_null",
  [sym_literal_float] = "literal_float",
  [sym_literal_int] = "literal_int",
  [sym_literal_bool] = "literal_bool",
  [sym_literal_string] = "literal_string",
  [sym_literal_name] = "literal_name",
  [sym_comment] = "comment",
  [sym_module] = "module",
  [sym__literal] = "_literal",
  [aux_sym_module_repeat1] = "module_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_literal_null] = sym_literal_null,
  [sym_literal_float] = sym_literal_float,
  [sym_literal_int] = sym_literal_int,
  [sym_literal_bool] = sym_literal_bool,
  [sym_literal_string] = sym_literal_string,
  [sym_literal_name] = sym_literal_name,
  [sym_comment] = sym_comment,
  [sym_module] = sym_module,
  [sym__literal] = sym__literal,
  [aux_sym_module_repeat1] = aux_sym_module_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [sym_literal_null] = {
    .visible = true,
    .named = true,
  },
  [sym_literal_float] = {
    .visible = true,
    .named = true,
  },
  [sym_literal_int] = {
    .visible = true,
    .named = true,
  },
  [sym_literal_bool] = {
    .visible = true,
    .named = true,
  },
  [sym_literal_string] = {
    .visible = true,
    .named = true,
  },
  [sym_literal_name] = {
    .visible = true,
    .named = true,
  },
  [sym_comment] = {
    .visible = true,
    .named = true,
  },
  [sym_module] = {
    .visible = true,
    .named = true,
  },
  [sym__literal] = {
    .visible = false,
    .named = true,
  },
  [aux_sym_module_repeat1] = {
    .visible = false,
    .named = false,
  },
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static const TSStateId ts_primary_state_ids[STATE_COUNT] = {
  [0] = 0,
  [1] = 1,
  [2] = 2,
  [3] = 3,
  [4] = 4,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(22);
      if (lookahead == '"') ADVANCE(2);
      if (lookahead == '\'') ADVANCE(4);
      if (lookahead == '+' ||
          lookahead == '-') ADVANCE(18);
      if (lookahead == '/') ADVANCE(5);
      if (lookahead == 'N') ADVANCE(10);
      if (lookahead == '\\') SKIP(21)
      if (lookahead == 'f') ADVANCE(11);
      if (lookahead == 't') ADVANCE(15);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(0)
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(26);
      END_STATE();
    case 1:
      if (lookahead == '"') ADVANCE(2);
      END_STATE();
    case 2:
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '\\') ADVANCE(1);
      if (lookahead != 0) ADVANCE(2);
      END_STATE();
    case 3:
      if (lookahead == '\'') ADVANCE(4);
      END_STATE();
    case 4:
      if (lookahead == '\'') ADVANCE(29);
      if (lookahead == '\\') ADVANCE(3);
      if (lookahead != 0) ADVANCE(4);
      END_STATE();
    case 5:
      if (lookahead == '*') ADVANCE(7);
      if (lookahead == '/') ADVANCE(31);
      END_STATE();
    case 6:
      if (lookahead == '*') ADVANCE(6);
      if (lookahead == '/') ADVANCE(30);
      if (lookahead != 0) ADVANCE(7);
      END_STATE();
    case 7:
      if (lookahead == '*') ADVANCE(6);
      if (lookahead != 0) ADVANCE(7);
      END_STATE();
    case 8:
      if (lookahead == 'L') ADVANCE(23);
      END_STATE();
    case 9:
      if (lookahead == 'L') ADVANCE(8);
      END_STATE();
    case 10:
      if (lookahead == 'U') ADVANCE(9);
      END_STATE();
    case 11:
      if (lookahead == 'a') ADVANCE(14);
      END_STATE();
    case 12:
      if (lookahead == 'e') ADVANCE(27);
      END_STATE();
    case 13:
      if (lookahead == 'f') ADVANCE(24);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      END_STATE();
    case 14:
      if (lookahead == 'l') ADVANCE(16);
      END_STATE();
    case 15:
      if (lookahead == 'r') ADVANCE(17);
      END_STATE();
    case 16:
      if (lookahead == 's') ADVANCE(12);
      END_STATE();
    case 17:
      if (lookahead == 'u') ADVANCE(12);
      END_STATE();
    case 18:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(26);
      END_STATE();
    case 19:
      if (lookahead != 0 &&
          lookahead != '\r' &&
          lookahead != '\\') ADVANCE(31);
      if (lookahead == '\r') ADVANCE(33);
      if (lookahead == '\\') ADVANCE(32);
      END_STATE();
    case 20:
      if (eof) ADVANCE(22);
      if (lookahead == '\n') SKIP(0)
      END_STATE();
    case 21:
      if (eof) ADVANCE(22);
      if (lookahead == '\n') SKIP(0)
      if (lookahead == '\r') SKIP(20)
      END_STATE();
    case 22:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(sym_literal_null);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(sym_literal_float);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(sym_literal_float);
      if (lookahead == 'f') ADVANCE(24);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(sym_literal_int);
      if (lookahead == '.') ADVANCE(13);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(26);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(sym_literal_bool);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(sym_literal_string);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(sym_literal_name);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(sym_comment);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead == '\\') ADVANCE(19);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(31);
      END_STATE();
    case 32:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\r' &&
          lookahead != '\\') ADVANCE(31);
      if (lookahead == '\r') ADVANCE(33);
      if (lookahead == '\\') ADVANCE(32);
      END_STATE();
    case 33:
      ACCEPT_TOKEN(sym_comment);
      if (lookahead != 0 &&
          lookahead != '\\') ADVANCE(31);
      if (lookahead == '\\') ADVANCE(19);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 0},
  [2] = {.lex_state = 0},
  [3] = {.lex_state = 0},
  [4] = {.lex_state = 0},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_literal_null] = ACTIONS(1),
    [sym_literal_float] = ACTIONS(1),
    [sym_literal_int] = ACTIONS(1),
    [sym_literal_bool] = ACTIONS(1),
    [sym_literal_string] = ACTIONS(1),
    [sym_literal_name] = ACTIONS(1),
    [sym_comment] = ACTIONS(3),
  },
  [1] = {
    [sym_module] = STATE(4),
    [sym__literal] = STATE(2),
    [aux_sym_module_repeat1] = STATE(2),
    [ts_builtin_sym_end] = ACTIONS(5),
    [sym_literal_null] = ACTIONS(7),
    [sym_literal_float] = ACTIONS(7),
    [sym_literal_int] = ACTIONS(9),
    [sym_literal_bool] = ACTIONS(7),
    [sym_literal_string] = ACTIONS(7),
    [sym_literal_name] = ACTIONS(7),
    [sym_comment] = ACTIONS(3),
  },
  [2] = {
    [sym__literal] = STATE(3),
    [aux_sym_module_repeat1] = STATE(3),
    [ts_builtin_sym_end] = ACTIONS(11),
    [sym_literal_null] = ACTIONS(13),
    [sym_literal_float] = ACTIONS(13),
    [sym_literal_int] = ACTIONS(15),
    [sym_literal_bool] = ACTIONS(13),
    [sym_literal_string] = ACTIONS(13),
    [sym_literal_name] = ACTIONS(13),
    [sym_comment] = ACTIONS(3),
  },
  [3] = {
    [sym__literal] = STATE(3),
    [aux_sym_module_repeat1] = STATE(3),
    [ts_builtin_sym_end] = ACTIONS(17),
    [sym_literal_null] = ACTIONS(19),
    [sym_literal_float] = ACTIONS(19),
    [sym_literal_int] = ACTIONS(22),
    [sym_literal_bool] = ACTIONS(19),
    [sym_literal_string] = ACTIONS(19),
    [sym_literal_name] = ACTIONS(19),
    [sym_comment] = ACTIONS(3),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 2,
    ACTIONS(3), 1,
      sym_comment,
    ACTIONS(25), 1,
      ts_builtin_sym_end,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(4)] = 0,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT_EXTRA(),
  [5] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_module, 0),
  [7] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [9] = {.entry = {.count = 1, .reusable = false}}, SHIFT(2),
  [11] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_module, 1),
  [13] = {.entry = {.count = 1, .reusable = true}}, SHIFT(3),
  [15] = {.entry = {.count = 1, .reusable = false}}, SHIFT(3),
  [17] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_module_repeat1, 2),
  [19] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_module_repeat1, 2), SHIFT_REPEAT(3),
  [22] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_module_repeat1, 2), SHIFT_REPEAT(3),
  [25] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef _WIN32
#define extern __declspec(dllexport)
#endif

extern const TSLanguage *tree_sitter_witcherscript(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
