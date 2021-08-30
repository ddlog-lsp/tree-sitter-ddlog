{
  "targets": [
    {
      "target_name": "tree_sitter_ddlog_dat",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "ddlog/dat/src"
      ],
      "sources": [
        "ddlog/dat/src/binding.cc",
        "ddlog/dat/src/parser.c",
        "ddlog/dat/src/scanner.cc"
      ],
      "cflags_c": [
        "-std=c99",
      ]
    },
    {
      "target_name": "tree_sitter_ddlog_dl",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "ddlog/dl/src"
      ],
      "sources": [
        "ddlog/dl/src/binding.cc",
        "ddlog/dl/src/parser.c",
        "ddlog/dl/src/scanner.cc"
      ],
      "cflags_c": [
        "-std=c99",
      ]
    },
  ]
}
