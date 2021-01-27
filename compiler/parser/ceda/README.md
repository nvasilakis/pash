# Shell scripts <-> JSON (without OCaml)

## Pre-requisites

* json-c v0.15:

```
cd /pash
wget https://s3.amazonaws.com/json-c_releases/releases/json-c-0.15.tar.gz
tar zxf json-c-0.15.tar.gz
cd json-c-0.15
mkdir build
cd build/
cmake -DCMAKE_INSTALL_PREFIX=/pash/json-c-0.15/install ../
make install
```

## Usage

### Shell script -> JSON

It has the same usage as `parse_to_json` i.e.,
`./parse_to_json2 SCRIPT_FILE_NAME` or `./parse_to_json2 < SCRIPT_FILE_NAME`

e.g.,
```
$ ./parse_to_json2 /pash/evaluation/hello-world.sh
```

### JSON -> shell script

It has the same usage as `json_to_shell` i.e.,
`./json_to_shell2 JSON_FILE_NAME` or `./json_to_shell2 < JSON_FILE_NAME`

e.g.,

```
$ cat /pash/evaluation/hello-world.sh | ./parse_to_json2 | ./json_to_shell2
if [ $(uname) = "Darwin" ]; then a=/usr/share/dict/web2; else a=/usr/share/dict/words; fi
if [ -f ${a} ]; then cat ${a} ${a} ${a} ${a} ${a} ${a} ${a} ${a} | grep "\\(.\\).*\\1\\(.\\).*\\2\\(.\\).*\\3\\(.\\).*\\4" | wc -l; else echo "Dictionary file ${a} not found.."; fi
```

## Testing (with an individual test case)

### Shell script -> JSON

```
sh test_parse_to_JSON2.sh SOME_SCRIPT_FILE
```

This applies the OCaml implementation of `parse_to_json` to the specified script file, and compares the output against this re-implementation.

Output:
* `INVALID_INPUT_1` means the shell script cannot be parsed to JSON by the reference implementation. 
* `ABORT` or `FAIL` means there's a bug in Thurston's code.
* `PASS` is good.

### JSON -> shell script

```
sh test_JSON_to_shell2.sh SOME_SCRIPT_FILE
```

This applies the OCaml implementation of `parse_to_json` to the specified script file, then compares the OCaml `json_to_shell` against this re-implementation.

Output:
* `INVALID_INPUT_1` or `INVALID_INPUT_2` means the shell script cannot be parsed to or from JSON by the reference implementation. 
* `ABORT` or `FAIL` means there's a bug in Thurston's code.
* `PASS` is good.

### Combo (shell script -> JSON -> shell script)

```
sh test_rt.sh SOME_SCRIPT_FILE
```

This compares the output of the OCaml pipeline (parse_to_json + json_to_shell) against the C reimplementation (parse_to_json2 + json_to_shell2).



## Testing (with all the scripts in /pash/)

This includes `test_JSON_to_shell2.sh`!

```
make tests  # Uses test_rt.sh
make testsA # Uses test_parse_to_json2.sh
make testsB # Uses test_parse_to_json2.sh
```

### parse_to_json2 results (WORK-IN-PROGRESS)

Some failures are because the Background line number is not initialized by dash for some shell scripts (the libdash OCaml
implementation returns "random" values); I think this is a bug in dash. In any case, since these line numbers are not
used, these differences are irrelevant.

### json_to_shell2 results

All shell scripts that the OCaml implementation works on are regenerated, byte-for-byte identical:
```
    234 PASS
     33 REF_ABORT_1
```


## Mapping of Files

* arg_char.c => ast.ml (part 1A: just the arg_char type and associated functions, used for parsing to JSON)
* ast2a.c => ast.ml (part 1B: everything else for parsing to JSON)
* ast2b.c => ast.ml (part 2: everything for serializing JSON to shell)

* dash2.c => dash.ml

* ast2json.c => Ast_json.ml
 * OCaml version was auto-generated by atdgen
 * Notice that we did not implement converting JSON to our AST; json_to_shell2 directly serializes the JSON data structures.

* json_to_shell2.c => json_to_shell.ml
* parse_to_json2.c => parse_to_json.ml 

* CharList.c, Stack.c => basic data structures that OCaml has built-in

For testing only:
* prettyprint_json.c 

## Known Bugs

### parse_to_json2
* Memory leaks galore
* Not Python

### json_to_shell2
* `fresh_marker` for heredocs. This is really obscure and a pain to implement in C. For real-world, non-adversarial settings, just change the marker from "EOF" to some random text.
* Not Python