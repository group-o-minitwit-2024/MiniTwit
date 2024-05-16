# add the ssh key
resource "digitalocean_ssh_key" "minitwit" {
  name = "tf-minitwit"
  public_key = file(var.pub_key)
}