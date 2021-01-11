#!/bin/bash

unix50_dir="../evaluation/unix50/"
unix50_intermediary="${unix50_dir}/intermediary/"
intermediary_dir="../evaluation/intermediary/"
results_subdir="unix50"

rm -r $unix50_intermediary
mkdir -p $unix50_intermediary
mkdir -p $intermediary_dir
mkdir -p "../evaluation/results/${results_subdir}/"

## Make inputs larger and generate scripts and their envs
##
## TODO: The generation of scripts has to be transparent.
## TODO: Simplify this parameter
## TODO: See if results are similar with a smaller input size
# maximum_input_size="$((10 * 1000 * 1000 * 1000))" # 10 GB
maximum_input_size="$((100 * 1000 * 1000))" # 100 MB
python3 generate_unix50_scripts.py $unix50_dir $unix50_intermediary $maximum_input_size

n_inputs=(
    # 1
    # 2
    4
    # 8
    # 16
    # 32
    # 64
)

## Note: Maybe we need to tune the configuration (fan-out, batch-size)
##       before some specific benchmarks
for unix50_pipeline in $(ls ${unix50_intermediary} | grep -v "_env" | cut -f 1 -d '.' | sort); do
    echo $unix50_pipeline
    exec_seq="-s"
    for n_in in "${n_inputs[@]}"; do

        ## Generate the intermediary script
        echo "Generating input and intermediary scripts... be patient..."
        python3 generate_microbenchmark_intermediary_scripts.py \
                $unix50_intermediary $unix50_pipeline $n_in $intermediary_dir

        ## Execute the intermediary script
        ./execute_compile_evaluation_script.sh $exec_seq -e "${unix50_pipeline}" "${n_in}" "${results_subdir}"  > /dev/null
        rm -f /tmp/eager*

        # Only execute the sequential once
        exec_seq=""
    done
done
