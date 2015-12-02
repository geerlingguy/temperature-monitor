# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "dhoppe/debian-8.2.0-amd64-nocm"
  config.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true
  # config.vm.network "private_network", ip: "192.168.33.2"

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
    vb.memory = "1024"
  end

  # VMware Fusion.
  config.vm.provider "vmware_fusion" do |v|
    v.vmx["memsize"] = 1024
  end

  # TODO - Add second VM for remote-monitor server.
  config.vm.provision :ansible do |ansible|
    ansible.playbook = "playbooks/master/main.yml"
    ansible.sudo = true
  end
end
