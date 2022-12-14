# Localisation and telemetry under Bluetooth Mesh

The code in this repository is part of a bigger project for the Internet of Things course at the University of Salento

The aim of the project is to verify the possibility of sending telemetry information and locating objects at the same time by using a Bluetooth Mesh network.

What done has been developed and tested using several Raspberry Pi computers.

## The system

The system is made up of three main components:

- Nodes. There are two types of nodes: nodes with a sensor and nodes without it. Both types scan the environment for the signal of an Eddystone-UID beacon and send what is found over the Mesh network. The nodes with a sensor are able to send the value they read from it too. [Here](https://github.com/UniSalento-IDALab-IoTCourse-2021-2022/wot-project-2021-2022-meshnode-Ferraro) the code for this component of the system

- Server. This element contains a node that collects data from the other ones. The code for the server component is reachable [here](https://github.com/UniSalento-IDALab-IoTCourse-2021-2022/wot-project-2021-2022-server-Ferraro). After data are collected, relative positions are computed by using RSSI and log-distance path loss model. Both location and telemetry data are sent to a dashboard after being managed.

- Dashboard. In this repository.

##  The Dashboard

The dashboard receives data from the server. A service makes a WebSocket client available and usable. Both telemetry and location-related data are managed this way.

The main page contains a map in which data are represented and some statistics, including timestamps for the last message per type and the average time for a message to arrive (for both categories).

In the map, nodes that are part of the system are shown in red. There is no procedure to graphically add nodes, but it can be done by modifying the source code.

Once telemetry data arrive, the sending node square becomes orange and a tooltip, activated when the cursor is on the square, indicated the received value.

Location data are collected until they are enough to be displayed. It means that at least three nodes sent information about the same located device. Once this happens, a yellow square appears on the map in the computed position.

The position is computed by using a three-border method after data are filtered by selecting the three nearest nodes. This is made possible because the data received contains information about the approximate distance in meters between the discovered device and the node locating it.

In order to make the interface more compliant with modern appearance standards, angular material has been used.

**DISCLAIMER**: The following part of the readme has been generated by Angular itself.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
