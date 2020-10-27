{
  "targets": [
    {
      "target_name": "tree_sitter_ddlog_dat",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "ddlog/dat/src"
      ],
      "sources": [
        "ddlog/dat/src/parser.c",
        "ddlog/dat/src/binding.cc"
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
        "ddlog/dl/src/parser.c",
        "ddlog/dl/src/binding.cc"
      ],
      "cflags_c": [
        "-std=c99",
      ]
    },
  ]
}
