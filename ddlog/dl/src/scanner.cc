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

bool tree_sitter_ddlog_dl_is_end_of_token(TSLexer *const lexer) {
  return lexer->lookahead == 0 || iswspace(lexer->lookahead) ||
         lexer->lookahead == '/';
}

void tree_sitter_ddlog_dl_skip_extras(TSLexer *const lexer) {
  while (iswspace(lexer->lookahead) || lexer->lookahead == '/') {
    // consume remaining whitespace
    while (iswspace(lexer->lookahead)) {
      lexer->advance(lexer, true);
    }

    // check if we are at the start of a comment
    if (lexer->lookahead == '/') {
      lexer->advance(lexer, false);

      // check whether the comment is a line comment
      if (lexer->lookahead == '/') {
        lexer->advance(lexer, false);
        // consume everything until the end of the line
        while (lexer->lookahead != 0 && lexer->lookahead != '\n') {
          lexer->advance(lexer, false);
        }
        // otherwise check whether the comment is a block comment
      } else {
        size_t depth = 0;

        // if the comment is a block comment, increment comment depth
        if (lexer->lookahead == '*') {
          lexer->advance(lexer, false);
          depth += 1;

          // continue processing block comments until depth is 0 or eof
          while (depth > 0 && lexer->lookahead != 0) {
            // consume everything that isn't '/', '*', or until eof
            while (lexer->lookahead != '/' && lexer->lookahead != '*' &&
                   lexer->lookahead != 0) {
              lexer->advance(lexer, false);
            }

            // handle nested block comments and increment comment depth
            if (lexer->lookahead == '/') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == '*') {
                lexer->advance(lexer, false);
                depth += 1;
              }
              continue;
            }

            // handle end of block comments and decrement comment depth
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
}

bool tree_sitter_ddlog_dl_external_scanner_scan(
    const void *const payload, TSLexer *const lexer,
    const bool *const valid_symbols) {
  (void)payload;

  if (valid_symbols[RULE_END]) {
    tree_sitter_ddlog_dl_skip_extras(lexer);

    // lookahead for '.'
    if (lexer->lookahead == '.') {
      // skip '.'
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);

      tree_sitter_ddlog_dl_skip_extras(lexer);

      // check for eof or the beginning of an attribute
      if (lexer->lookahead == 0 || lexer->lookahead == '#') {
        lexer->result_symbol = RULE_END;
        return true;
      }

      if (iswlower(lexer->lookahead)) {
        // scan for "export"
        if (lexer->lookahead == 'a') {
          lexer->advance(lexer, false);
          if (lexer->lookahead == 'p') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'p') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'l') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'y') {
                  lexer->advance(lexer, false);
                  if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
                    lexer->result_symbol = RULE_END;
                    return true;
                  }
                }
              }
            }
          }
        }

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
                    if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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
          if (lexer->lookahead == 'o') {
            lexer->advance(lexer, false);
            if (lexer->lookahead == 'r') {
              lexer->advance(lexer, false);
              if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
                lexer->result_symbol = RULE_END;
                return true;
              }
            }
          }
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
                        if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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
                    if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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
            if (lexer->lookahead == 'd') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'e') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 'x') {
                  lexer->advance(lexer, false);
                  if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
                    lexer->result_symbol = RULE_END;
                    return true;
                  }
                }
              }
            }
            if (lexer->lookahead == 'p') {
              lexer->advance(lexer, false);
              if (lexer->lookahead == 'u') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == 't') {
                  lexer->advance(lexer, false);
                  if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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
                    if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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
                      if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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
                        if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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
                      if (tree_sitter_ddlog_dl_is_end_of_token(lexer)) {
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

      bool was_uc_ident;

      // NOTE: for some reason "iswupper" doesn't work here
      while (iswalpha(lexer->lookahead)) {
        was_uc_ident = !iswlower(lexer->lookahead);

        // skip remaining alnum characters
        while (iswalnum(lexer->lookahead) || lexer->lookahead == '_') {
          lexer->advance(lexer, false);
        }

        // skip interspersed whitespace
        tree_sitter_ddlog_dl_skip_extras(lexer);

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
          }
        }

        tree_sitter_ddlog_dl_skip_extras(lexer);
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

  return false;
}
}
