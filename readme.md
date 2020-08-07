
 * Node and NPM : using Node Version Manager : https://github.com/nvm-sh/nvm 
	> Follow instructions for appropriate OS
	> Install latest node version: nvm install node
	> current: node v13.10.1, npm 6.13.7
 
 * MongoDB - Enterprise
	> Official website: https://docs.mongodb.com/manual/administration/install-enterprise/ 
	> v4.2.3 (Shell & run)

 * Local version mongoDB : to get local test datas use : 
 	mongorestore -d AU_datas <directory_backup>
 	directory backup : mongoLocalDatas
 
 * run npm install
 
 * start application locally entering the command: nodemon
 
 * If nodemon not found: npm install -g nodemon
 * Make sure mongod service is running locally: sudo systemctl status mongod, if not 
sudo systemctl start mongod

 * See the web page locally on any browser at: http://localhost:3000/

 * you can connect with credentials : superadmin superadmin / admin admin / user user 
 	

----------- Troubleshoot: 

 * "Port 3000 is already in use"
	+ Ubuntu
	> lsof -i tcp:3000 
	> Find the associate PID, kill it if it's node already running
	> kill -9 PID
