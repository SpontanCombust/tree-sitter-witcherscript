/**
 * @file scanner.c
 * @author Przemysław Cedro
 * @brief Custom scanner for WitcherScript tree-sitter grammar
 * 
 * @details
 * This scanner searches for identifiers and as an additional precaution checks them against keywords used in the grammar.
 * If keyword will be used in place of a name identifier, scanner will be able to detect it and raise a lexical error.
 * This is a measure that has to be taken until reserved words are introduced into tree-sitter.
 * There's a PR on that feature that is yet to be completed: https://github.com/tree-sitter/tree-sitter/pull/1635
 * 
 * @version 0.1
 * @date 2023-11-14
 * 
 * @copyright MIT Licence (c) 2023
 */


#include "tree_sitter/parser.h"
#include <ctype.h>
#include <string.h>

// #define DEBUG
#ifdef DEBUG
#include <stdio.h>
#define LOG(...) fprintf(stderr, __VA_ARGS__)
#else
#define LOG(...)
#endif


// Do NOT change the order of values in TokenType and KEYWORDS
// Keywords have to be sorted according to the ASCII table for the binary search to work (so those with capital letters have to go first)
// This applies to padding entries as well
// Each string in KEYWORDS should correspond to an enum value on the same index in TokenType

enum TokenType {
    IDENT,

    KW_NULL,
    KW_ABSTRACT,
    KW_AUTOBIND,
    KW_BREAK,
    KW_CASE,
    KW_CLASS,
    KW_CONST,
    KW_CONTINUE,
    KW_DEFAULT,
    KW_DELETE,
    KW_DO,
    KW_EDITABLE,
    KW_ELSE,
    KW_ENTRY,
    KW_ENUM,
    KW_EVENT,
    KW_EXEC,
    KW_EXTENDS,
    KW_FALSE,
    KW_FINAL,
    KW_FOR,
    KW_FUNCTION,
    KW_HINT,
    KW_IF,
    KW_IN,
    KW_INLINED,
    KW_IMPORT,
    KW_LATENT,
    KW_NEW,
    KW_OPTIONAL,
    KW_OUT,
    KW_PARENT,
    KW_PRIVATE,
    KW_PROTECTED,
    KW_PUBLIC,
    KW_QUEST,
    KW_RETURN,
    KW_SAVED,
    KW_SINGLE,
    KW_STATE,
    KW_STATEMACHINE,
    KW_STORYSCENE,
    KW_STRUCT,
    KW_SUPER,
    KW_SWITCH,
    KW_THIS,
    KW_TIMER,
    KW_TRUE,
    KW_VAR,
    KW_VIRTUAL_PARENT,
    KW_WHILE,

    _MAX_TOKENS
};

static const char * const KEYWORDS[_MAX_TOKENS] = {
    "000_PAD_IDENT",

    "NULL",
    "abstract",
    "autobind",
    "break",
    "case",
    "class",
    "const",
    "continue", 
    "default",
    "delete",
    "do",
    "editable",
    "else",
    "entry",
    "enum",
    "event",
    "exec",
    "extends",
    "false",
    "final",
    "for",
    "function",
    "hint",
    "if",
    "in",
    "inlined",
    "import",
    "latent",
    "new",
    "optional",
    "out",
    "parent",
    "private",
    "protected",
    "public",
    "quest",
    "return",
    "saved",
    "single",
    "state",
    "statemachine",
    "storyscene",
    "struct",
    "super",
    "switch",
    "this",
    "timer",
    "true",
    "var",
    "virtual_parent",
    "while",
};

// should be more than enough
#define MAX_IDENT_LENGTH 128 

// Does a binary search for a given keyword. Returns index of the keyword or -1 if it wasn't found.
static int find_keyword(const char * ident){
    int start = 0;
    int end = _MAX_TOKENS - 1;
    int mid, cmp;

    while(start <= end){
        mid = (start + end) / 2;
        LOG("checking %s\n", KEYWORDS[mid]);
        cmp = strcmp(KEYWORDS[mid], ident);
        if (cmp == 0){
            return mid;
        } else if (cmp > 0){
            end = mid - 1;
        } else {
            start = mid + 1;
        }
    }

    return -1;
}

// Runs the scanner that progressively writes characters into `buffer` if an identifier is detected
static bool scan_ident(TSLexer *lexer, char* buffer, int buffer_size) {
    if (lexer->eof(lexer)) {
        return false;
    }

    // skip leading whitespace
    while (iswspace(lexer->lookahead)) {
        lexer->advance(lexer, true);
    }

    if (lexer->eof(lexer) || !(isalpha(lexer->lookahead) || lexer->lookahead == '_')) {
        return false;
    }

    int i = 0;
    buffer[i] = lexer->lookahead;
    lexer->advance(lexer, false);

    for (i = 1; i < buffer_size; i++) {
        if (lexer->eof(lexer) || !(isalnum(lexer->lookahead) || lexer->lookahead == '_')) {
            break;
        }
        buffer[i] = (char)lexer->lookahead;
        lexer->advance(lexer, false);
    }

    return true;
}




void *tree_sitter_witcherscript_external_scanner_create() { return NULL; }
void tree_sitter_witcherscript_external_scanner_destroy(void *p) {}
void tree_sitter_witcherscript_external_scanner_reset(void *p) {}
unsigned tree_sitter_witcherscript_external_scanner_serialize(void *p, char *buffer) { return 0; }
void tree_sitter_witcherscript_external_scanner_deserialize(void *p, const char *b, unsigned n) {}

bool tree_sitter_witcherscript_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    bool expected_ident = valid_symbols[IDENT];
    bool expected_keyword = false;
    for(int i = IDENT + 1; i < _MAX_TOKENS; i++) {
        if(valid_symbols[i]) {
            expected_keyword = true;
            break;
        }
    }

    if(expected_ident || expected_keyword) {
        static char buffer[MAX_IDENT_LENGTH];
        memset(buffer, '\0', MAX_IDENT_LENGTH);

        if(scan_ident(lexer, buffer, MAX_IDENT_LENGTH)) {
            // check whether this identifier is actually a reserved keyword
            LOG("scanned identifier: %s\n", buffer);
            int kw = find_keyword(buffer);
            LOG("it is %sa keyword\n", kw == -1 ? "not " : "");
            if (kw != -1) {
                // keywords take precedence over any name identifier
                if (expected_keyword) {
                    lexer->result_symbol = kw;
                    return true;
                // if anything else was expected here (like name identifier) it should throw an error anyways
                } else {
                    return false;
                }
            } else if (expected_ident) {
                lexer->result_symbol = IDENT;
                return true;
            }
        }
    }

    return false;
} 