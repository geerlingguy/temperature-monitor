# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "geerlingguy/ubuntu1204"
  config.vm.network "private_network", ip: "192.168.33.2"

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
    vb.memory = "512"
  end

  # TODO: Use Ansible, install MySQL properly.
  config.vm.provision "shell",
    inline: "apt-get update -y && apt-get install -y mysql-client mysql-server"
end
