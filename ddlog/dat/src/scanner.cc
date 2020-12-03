#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType { RULE_END, UPDATES_END };

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

bool tree_sitter_ddlog_dat_is_end_of_token(TSLexer *const lexer) {
  return lexer->lookahead == 0 || iswspace(lexer->lookahead) ||
         lexer->lookahead == '/';
}

void tree_sitter_ddlog_dat_skip_extras(TSLexer *const lexer) {
  while (iswspace(lexer->lookahead) || lexer->lookahead == '#') {
    // consume remaining whitespace
    while (iswspace(lexer->lookahead)) {
      lexer->advance(lexer, true);
    }

    // check if we are at the start of a comment
    if (lexer->lookahead == '#') {
      while(lexer->lookahead != 0) {
        lexer->advance(lexer, false);
      }
    }
  }
}

bool tree_sitter_ddlog_dat_external_scanner_scan(
    const void *const payload, TSLexer *const lexer,
    const bool *const valid_symbols) {
  (void)payload;

  if (valid_symbols[UPDATES_END]) {
    tree_sitter_ddlog_dat_skip_extras(lexer);

    // scan for ';'
    if (lexer->lookahead == ';') {
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      lexer->result_symbol = UPDATES_END;
      return true;
    }

    // scan for ','
    if (lexer->lookahead == ',') {
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);

      tree_sitter_ddlog_dat_skip_extras(lexer);

      if (lexer->lookahead == 'd') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == 'e') {
          lexer->advance(lexer, false);
          if (lexer->lookahead == 'l') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'e') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 't') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'e') {
                  lexer->advance(lexer, false);
                  if (tree_sitter_ddlog_dat_is_end_of_token(lexer)) {
                    return false;
                  }
                  if (lexer->lookahead == '_') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 'k') {
                      lexer->advance(lexer, false);
                      if (lexer->lookahead == 'e') {
                        lexer->advance(lexer, false);
                        if (lexer->lookahead == 'y') {
                          lexer->advance(lexer, false);
                          if (tree_sitter_ddlog_dat_is_end_of_token(lexer)) {
                            return false;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (lexer->lookahead == 'i') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == 'n') {
          lexer->advance(lexer, false);
          if (lexer->lookahead == 's') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'e') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'r') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 't') {
                  lexer->advance(lexer, false);
                  if (tree_sitter_ddlog_dat_is_end_of_token(lexer)) {
                    return false;
                  }
                  if (lexer->lookahead == '_') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 'o') {
                      lexer->advance(lexer, false);
                      if (lexer->lookahead == 'r') {
                        lexer->advance(lexer, false);
                        if (lexer->lookahead == '_') {
                          lexer->advance(lexer, false);
                          if (lexer->lookahead == 'u') {
                            lexer->advance(lexer, false);
                            if (lexer->lookahead == 'p') {
                              lexer->advance(lexer, false);
                              if (lexer->lookahead == 'd') {
                                lexer->advance(lexer, false);
                                if (lexer->lookahead == 'a') {
                                  lexer->advance(lexer, false);
                                  if (lexer->lookahead == 't') {
                                    lexer->advance(lexer, false);
                                    if (lexer->lookahead == 'e') {
                                      lexer->advance(lexer, false);
                                      if (tree_sitter_ddlog_dat_is_end_of_token(lexer)) {
                                        return false;
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (lexer->lookahead == 'm') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == 'o') {
          lexer->advance(lexer, false);
          if (lexer->lookahead == 'd') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'i') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'f') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'y') {
                  lexer->advance(lexer, false);
                  if (tree_sitter_ddlog_dat_is_end_of_token(lexer)) {
                    return false;
                  }
                }
              }
            }
          }
        }
      }

      lexer->result_symbol = UPDATES_END;
      return true;
    }
  }

  return false;
}
}
