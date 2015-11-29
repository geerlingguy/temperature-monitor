# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "geerlingguy/ubuntu1204"
  config.vm.network "private_network", ip: "192.168.33.2"

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
    vb.memory = "512"
  end

  # TODO - Add second VM for remote-monitor server.
  config.vm.provision :ansible do |ansible|
    ansible.playbook = "playbooks/master/main.yml"
    ansible.sudo = true
  end
end
