#!/bin/bash

# load balancer config file
config_file='load_balancer/temp/load_balancer.conf'

# ssh key
key_file='ssh_key/terraform'

# ugly list concatenating of ips from terraform output
rows=$(terraform -chdir=terraform output -raw minitwit-swarm-leader-ip-address)
rows+=' '
rows+=$(terraform -chdir=terraform output -json minitwit-swarm-manager-ip-address | jq -r .[])
rows+=' '
rows+=$(terraform -chdir=terraform output -json minitwit-swarm-worker-ip-address | jq -r .[])

# scp the file
for ip in $rows; do
    echo -e "\n--> Copying load balancer config to $ip\n"
    ssh -o 'StrictHostKeyChecking no' root@$ip -i $key_file "mkdir -p /loadbalancer"
    scp -i $key_file $config_file root@$ip:/loadbalancer/default.conf
done