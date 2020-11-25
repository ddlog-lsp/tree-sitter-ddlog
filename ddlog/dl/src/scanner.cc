#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType { RULE_END };

extern "C" {
void *tree_sitter_ddlog_dl_external_scanner_create() { return NULL; }

void tree_sitter_ddlog_dl_external_scanner_destroy(const void *const payload) {
  (void)payload;
}

void tree_sitter_ddlog_dl_external_scanner_reset(const void *const payload) {
  (void)payload;
}

unsigned
tree_sitter_ddlog_dl_external_scanner_serialize(const void *const payload,
                                                char *const buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_ddlog_dl_external_scanner_deserialize(
    const void *const payload, char *const buffer, unsigned const length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

void skip_whitespace_and_comments(TSLexer *lexer) {
  while (iswspace(lexer->lookahead) || lexer->lookahead == '/') {
    while (iswspace(lexer->lookahead)) {
      lexer->advance(lexer, true);
    }

    if (lexer->lookahead == '/') {
      lexer->advance(lexer, false);

      if (lexer->lookahead == '/') {
        lexer->advance(lexer, false);
        while (lexer->lookahead != 0 && lexer->lookahead != '\n') {
          lexer->advance(lexer, false);
        }
      }

      size_t depth = 0;

      if (lexer->lookahead == '*') {
        lexer->advance(lexer, false);
        depth += 1;

        while (depth > 0 && lexer->lookahead != 0) {
          while (lexer->lookahead != '/' && lexer->lookahead != '*' && lexer->lookahead != 0) {
            lexer->advance(lexer, false);
          }
          if (lexer->lookahead == '/') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == '*') {
              lexer->advance(lexer, false);
              depth += 1;
            }
            continue;
          }
          if (lexer->lookahead == '*') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == '/') {
              lexer->advance(lexer, false);
              depth -= 1;
            }
            continue;
          }
        }
      }
    }
  }
}

bool tree_sitter_ddlog_dl_external_scanner_scan(
    const void *const payload, TSLexer *const lexer,
    const bool *const valid_symbols) {
  (void)payload;

  if (valid_symbols[RULE_END]) {
    skip_whitespace_and_comments(lexer);

    // lookahead for '.'
    if (lexer->lookahead == '.') {
      // skip '.'
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);

      skip_whitespace_and_comments(lexer);

      while (iswalpha(lexer->lookahead)) {
        bool was_uc_ident = false;

        if (iswlower(lexer->lookahead)) {
          was_uc_ident = true;

          // scan for "export"
          if (lexer->lookahead == 'e') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'x') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 't') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'e') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 'r') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 'n') {
                      lexer->advance(lexer, false);
                      if (iswspace(lexer->lookahead)) {
                        lexer->result_symbol = RULE_END;
                        return true;
                      }
                    }
                  }
                }
              }
            }
          }

          // scan for "function"
          if (lexer->lookahead == 'f') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'u') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'n') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'c') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 't') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 'i') {
                      lexer->advance(lexer, false);
                      if (lexer->lookahead == 'o') {
                        lexer->advance(lexer, false);
                        if (lexer->lookahead == 'n') {
                          lexer->advance(lexer, false);
                          if (iswspace(lexer->lookahead)) {
                            lexer->result_symbol = RULE_END;
                            return true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // scan for "import" or "input"
          if (lexer->lookahead == 'i') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'm') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'p') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'o') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 'r') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 't') {
                      lexer->advance(lexer, false);
                      if (iswspace(lexer->lookahead)) {
                        lexer->result_symbol = RULE_END;
                        return true;
                      }
                    }
                  }
                }
              }
            }
            if (lexer->lookahead == 'n') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'p') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'u') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 't') {
                    lexer->advance(lexer, false);
                    if (iswspace(lexer->lookahead)) {
                      lexer->result_symbol = RULE_END;
                      return true;
                    }
                  }
                }
              }
            }
          }

          // scan for "output"
          if (lexer->lookahead == 'o') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'u') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 't') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'p') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 'u') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 't') {
                      lexer->advance(lexer, false);
                      if (iswspace(lexer->lookahead)) {
                        lexer->result_symbol = RULE_END;
                        return true;
                      }
                    }
                  }
                }
              }
            }
          }

          // scan for "primary"
          if (lexer->lookahead == 'p') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'r') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'i') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'm') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 'a') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 'r') {
                      lexer->advance(lexer, false);
                      if (lexer->lookahead == 'y') {
                        lexer->advance(lexer, false);
                        if (iswspace(lexer->lookahead)) {
                          lexer->result_symbol = RULE_END;
                          return true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // scan for "relation"
          if (lexer->lookahead == 'r') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'e') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'l') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'a') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 't') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 'i') {
                      lexer->advance(lexer, false);
                      if (lexer->lookahead == 'o') {
                        lexer->advance(lexer, false);
                        if (lexer->lookahead == 'n') {
                          lexer->advance(lexer, false);
                          if (iswspace(lexer->lookahead)) {
                            lexer->result_symbol = RULE_END;
                            return true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // scan for "typedef"
          if (lexer->lookahead == 't') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'y') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'p') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'e') {
                  lexer->advance(lexer, false);
                  if (lexer->lookahead == 'd') {
                    lexer->advance(lexer, false);
                    if (lexer->lookahead == 'e') {
                      lexer->advance(lexer, false);
                      if (lexer->lookahead == 'f') {
                        lexer->advance(lexer, false);
                        if (iswspace(lexer->lookahead)) {
                          lexer->result_symbol = RULE_END;
                          return true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          was_uc_ident = false;
        }

        while (iswalpha(lexer->lookahead)) {
          if (iswupper(lexer->lookahead)) {
            was_uc_ident = true;
          } else {
            was_uc_ident = false;
          }

          // skip remaining alnum characters
          while (iswalpha(lexer->lookahead)) {
            lexer->advance(lexer, false);
          }

          // skip interspersed whitespace
          while (iswspace(lexer->lookahead)) {
            lexer->advance(lexer, true);
          }

          // skip scope delimiter
          if (lexer->lookahead == ':') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == ':') {
              lexer->advance(lexer, false);
            }
          }

          if (lexer->lookahead == 'i') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'n') {
              lexer->advance(lexer, false);
              if (!iswspace(lexer->lookahead)) {
                return false;
              }
            }
          }

          skip_whitespace_and_comments(lexer);
        }

        // scan for end of rel_name
        if (was_uc_ident) {
          if (lexer->lookahead == '(' || lexer->lookahead == '[') {
            lexer->result_symbol = RULE_END;
            return true;
          }
        }
      }
    }
  }

  return false;
}
}
