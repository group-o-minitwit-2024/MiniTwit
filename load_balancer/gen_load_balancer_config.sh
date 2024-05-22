#!/bin/bash

template_file='load_balancer/load_balancer_template.conf'
output_file='load_balancer/temp/load_balancer.conf'

rm $output_file &>/dev/null
cp $template_file $output_file

rows=$(terraform -chdir=terraform output -raw minitwit-swarm-leader-ip-address)
rows+=' '
rows+=$(terraform -chdir=terraform output -json minitwit-swarm-manager-ip-address | jq -r .[])
rows+=' '
rows+=$(terraform -chdir=terraform output -json minitwit-swarm-worker-ip-address | jq -r .[])

for ip in $rows; do
    sed -i "/upstream backend {/a server $ip:5000;" $output_file
done