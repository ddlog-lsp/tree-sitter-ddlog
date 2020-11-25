#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType { RULE_END };

extern "C" {
void *tree_sitter_ddlog_dat_external_scanner_create() { return NULL; }

void tree_sitter_ddlog_dat_external_scanner_destroy(const void *const payload) {
  (void)payload;
}

void tree_sitter_ddlog_dat_external_scanner_reset(const void *const payload) {
  (void)payload;
}

unsigned
tree_sitter_ddlog_dat_external_scanner_serialize(const void *const payload,
                                                 char *const buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_ddlog_dat_external_scanner_deserialize(
    const void *const payload, char *const buffer, unsigned const length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

bool tree_sitter_ddlog_dat_external_scanner_scan(
    const void *const payload, TSLexer *const lexer,
    const bool *const valid_symbols) {
  (void)payload;
  (void)lexer;
  (void)valid_symbols;
  return false;
}
}
