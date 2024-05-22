#!/bin/bash

template_file='load_balancer/load_balancer_template.conf'
output_file='load_balancer/temp/load_balancer.conf'

# Ensure the output directory exists
mkdir -p $(dirname $output_file)

# Remove the previous output file if it exists and copy the template to the output file
rm $output_file &>/dev/null
cp $template_file $output_file

# Gather IP addresses
rows=$(terraform -chdir=terraform output -raw minitwit-swarm-leader-ip-address)
rows+=' '
rows+=$(terraform -chdir=terraform output -json minitwit-swarm-manager-ip-address | jq -r .[])
rows+=' '
rows+=$(terraform -chdir=terraform output -json minitwit-swarm-worker-ip-address | jq -r .[])

# Populate the backend upstream block
for ip in $rows; do
    sed -i "/upstream backend {/a \    server $ip:5000;" $output_file
done

# Populate the backend_api upstream block
for ip in $rows; do
    sed -i "/upstream backend_api {/a \    server $ip:5001;" $output_file
done
