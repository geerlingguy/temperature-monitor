To .b.b#ranc178@gmail.c
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "dhoppe/debian-8.2.0-amd64-nocm"

  inventory_groups = {
    'master' => ['master'],
    'remotes' => ['remote']
  }

  # VMware Fusion.
  config.vm.provider "vmware_fusion" do |v|
    v.vmx["memsize"] = 1024
  end

  # VirtualBox.
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end

  config.vm.define "master" do |machine|
    config.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true

    config.vm.provision :ansible do |ansible|
      ansible.playbook = "playbooks/master/main.yml"
      ansible.sudo = true
      ansible.extra_vars = {
        deploy_target_is_pi: false,
        temperature_monitor_dir: '/vagrant',
        temperature_monitor_user: 'vagrant',
        dashboard_uri: 'http://localhost:3000'
      }
      ansible.groups = inventory_groups
    end
  end

  # TODO - Add second VM for remote-monitor server.
end
