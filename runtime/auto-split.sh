#!/usr/bin/env bash

input="$1"
shift
outputs="$@"
n_outputs="$#"

# Set a default DISH_TOP in this directory if it doesn't exist
PASH_TOP=${PASH_TOP:-$(git rev-parse --show-toplevel)}

temp="$(mktemp --tmpdir -u pash_XXXXXXXXXX)"

cat "$input" > "$temp"
total_lines=$(wc -l $temp | cut -f 1 -d ' ')
batch_size=$( expr $total_lines / $n_outputs )
# echo "Input: $input"
# echo "Ouputs: $outputs"
# echo "Number of outputs: $n_outputs"
# echo "Total Lines: $total_lines"
# echo "Batch Size: $batch_size"
# echo "$PASH_TOP/evaluation/tools/split $input $batch_size $outputs"
$PASH_TOP/runtime/split "$temp" "$batch_size" $outputs
rm -f $temp
