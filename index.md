# Dekalog Live Voting Tool

# Introduction

Dekalog Live Voting Tool is a voting extension for live video streams, such as live shows, live theaters or any live stream.

This is the original source code that was used in Dekalog, the theater production for digital space in 2020 from Schauspielhaus Zürich by Christopher Rüping and ensemble after Krzysztof Kieślowskithe.

The source code includes a WebSocket Server written in Node.js and an admin panel for managing voting options along with the voting buttons, that can be injected via iframe into any external webpage.

## Authors

Original authors of the project are:

**Baran Güneysel** [https://github.com/dasnaar](https://github.com/dasnaar)

**Muhammed Kadir Tan** [https://github.com/mkadirtan](https://github.com/mkadirtan)

**Işık Hüseyin** [https://github.com/isikhi](https://github.com/isikhi)

## Licence

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge and publish. It's not allowed to sell the copies of the software, or the modifying the software for commercial targets.

# 1.1 Technology

## WebSocket

WebSocket is a computer communications protocol. The WebSocket protocol enables interaction between a web browser and a web server, facilitating real-time data transfer from and to the server.

The WebSocket communication enables our tool for real-time data transfer, respectively turning voting on and off, changing data, giving a vote etc.

## Node.js

Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser. 

# 1.2 Code

Specific documentation for the code and its functions can be found under these specific files.

*app.js -* The port and the path for the socket connection will be defined here

*wsevents.js -* WebSocket settings

*public/admin.js -* Settings for admin panel

*public/client.js -* Here the client side is regulated. The work flow from the client side is as follows:

- Set up the WebSocket connection, if it brokes, try it again.
- When a new state comes from admin side, make the required changes
- Send the information what client clicks as answer to the admin panel

# Technical Requirements

Any kind of server where you can install NodeJS and Nginx and work with WebSockets meets the requirements. We have tested with the following system and therefore we recommend it:

```bash
4 vCPU-Kerne
8 GB RAM
200 Mbit/s Port
Ubuntu Server
```

The system wasn't tested for more than 1,000 people.

# Installation step-by-step

You should have NodeJS and Node Packet Manager on your server. If you don't have it yet, run following commands on your server

```bash
sudo apt install nodejs
sudo apt install npm
```

You can easily copy this repository to your git and make the following changes:

*app.js* - Define the port in `const wss`. Note is in the code.

*client.js* - Define the URL of the server in let ws . Here it is important to note that you only change the `url.com`. If your website has SSL certificate, you should change `ws://` to `wss://`

*admin.js* - Define the URL of the server in `ws = new WebSocket` . Here it is important to note that you only change the `url.com`. If your website has SSL certificate, you should change `ws://` to `wss://`

When you defined your server URL and your port in your repository, you can clone and install it to your server with following commands:

`git clone yourrepositorylinkere `

`npm install express`

`npm install cors`

`node app.js `

The app will start on the defined port, f.e http://yourdomain.com:3000

Accessing to admin panel: http://yourdomain.com:3000/admin.html

# Recommendation of use

We are recommending to use the function "Hard Reset" in admin panel when a session is finished. It deletes the peers from array and the system will not burdened by old peer connections.

# Support

In case of bugs, questions, problems or other concerns, you can report them under Issues.




